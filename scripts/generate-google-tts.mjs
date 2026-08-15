import { execFileSync } from "node:child_process";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const [projectId, gcloudBin, cloudConfig, ...options] = process.argv.slice(2);
const refreshLearningFlow = options.includes("--refresh-learning-flow");

if (!projectId || !gcloudBin || !cloudConfig) {
  throw new Error("Usage: node scripts/generate-google-tts.mjs PROJECT_ID GCLOUD_BIN CLOUDSDK_CONFIG");
}

const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const seedBlock = source.match(/const roundSeeds:[\s\S]*?= \[([\s\S]*?)\n\];/)?.[1];
if (!seedBlock) throw new Error("Could not find roundSeeds in app/page.tsx");

const seeds = [...seedBlock.matchAll(/\{ syllable: "([^"]+)", consonant: "([^"]+)", vowel: "([^"]+)", word: "([^"]+)"/g)]
  .map((match) => ({ syllable: match[1], consonant: match[2], vowel: match[3], word: match[4] }));

if (seeds.length !== 50) throw new Error(`Expected 50 learning seeds, found ${seeds.length}`);

function hasBatchim(text) {
  const code = text.codePointAt(text.length - 1) ?? 0;
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}

function topicParticle(text) {
  return hasBatchim(text) ? "은" : "는";
}

const clips = [
  { file: "intro", text: "몽글이와 함께 숲속 동산을 탐험해 볼까요?" },
  { file: "tile-wrong", text: "이 소리 조각은 아닌 것 같아. 다시 찾아볼까?" },
  { file: "complete-4", text: "네 송이 글자꽃이 피었어요!" },
  { file: "complete-5", text: "다섯 송이 글자꽃이 피었어요!" },
];

const consonantNames = ["기역", "니은", "디귿", "리을", "미음", "비읍", "시옷", "이응", "지읒", "치읓", "키읔", "티읕", "피읖", "히읗"];
const vowelNames = ["아", "어", "오", "우", "이"];
const consonantNameByLetter = Object.fromEntries(["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"].map((letter, index) => [letter, consonantNames[index]]));
const vowelNameByLetter = Object.fromEntries(["ㅏ", "ㅓ", "ㅗ", "ㅜ", "ㅣ"].map((letter, index) => [letter, vowelNames[index]]));

for (const [index, name] of consonantNames.entries()) {
  clips.push({ file: `tile-consonant-${index + 1}`, text: `딩동댕! ${name}을 찾았어.` });
}
for (const [index, name] of vowelNames.entries()) {
  clips.push({ file: `tile-vowel-${index + 1}`, text: `맞아! ${name}를 찾았어.` });
}

for (const [index, seed] of seeds.entries()) {
  const key = `letter-${index + 1}`;
  const consonantName = consonantNameByLetter[seed.consonant];
  const vowelName = vowelNameByLetter[seed.vowel];
  clips.push(
    { file: `prompt-${key}`, text: `${seed.syllable}로 시작하는 친구는 누구일까요?` },
    { file: `build-${key}`, text: `${seed.syllable}를 만들어 볼까? ${consonantName}과 ${vowelName}를 찾아보자!` },
    { file: `correct-${key}`, text: `딩동댕! ${seed.word}${topicParticle(seed.word)} ${seed.syllable}로 시작해요.` },
    { file: `combine-${key}`, text: `짜잔! ${consonantName}과 ${vowelName}를 합치면 ${seed.syllable}! ${seed.word}도 ${seed.syllable}로 시작해. 글자꽃이 피었네!` },
    { file: `retry-${key}`, text: `${seed.syllable} 소리를 다시 들어볼까?` },
  );
}

const outputDir = path.resolve("public/audio/leda");
await mkdir(outputDir, { recursive: true });

const accessToken = execFileSync(gcloudBin, ["auth", "print-access-token"], {
  encoding: "utf8",
  env: { ...process.env, CLOUDSDK_CONFIG: cloudConfig },
}).trim();

async function alreadyGenerated(file) {
  if (refreshLearningFlow && (/^(build|combine)-/.test(file) || /^tile-(consonant|vowel)-/.test(file))) return false;
  try {
    return (await stat(path.join(outputDir, `${file}.mp3`))).size > 512;
  } catch {
    return false;
  }
}

async function synthesize(clip, attempt = 1) {
  if (await alreadyGenerated(clip.file)) return "skipped";

  const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Goog-User-Project": projectId,
    },
    body: JSON.stringify({
      input: { text: clip.text },
      voice: { languageCode: "ko-KR", name: "ko-KR-Chirp3-HD-Leda" },
      audioConfig: { audioEncoding: "MP3" },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
      return synthesize(clip, attempt + 1);
    }
    throw new Error(`${clip.file}: ${response.status} ${detail}`);
  }

  const payload = await response.json();
  const temporaryPath = path.join(outputDir, `.${clip.file}.mp3.tmp`);
  await writeFile(temporaryPath, Buffer.from(payload.audioContent, "base64"));
  await rename(temporaryPath, path.join(outputDir, `${clip.file}.mp3`));
  return "created";
}

let cursor = 0;
let completed = 0;
const workers = Array.from({ length: 5 }, async () => {
  while (cursor < clips.length) {
    const clip = clips[cursor++];
    await synthesize(clip);
    completed += 1;
    if (completed % 25 === 0 || completed === clips.length) {
      console.log(`Generated ${completed}/${clips.length}`);
    }
  }
});

await Promise.all(workers);
console.log(`Leda audio ready: ${clips.length} clips in ${outputDir}`);
