import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Malang Hangul welcome adventure", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ko">/i);
  assert.match(html, /<title>말랑한글: 소리숲 탐험<\/title>/i);
  assert.match(html, /숲속 동산에서/);
  assert.match(html, /탐험 지도 펼치기/);
  assert.match(html, /시간 제한이 없어요/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("includes fifty guided games, sticky navigation, and recorded audio", async () => {
  const [page, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const word of ["가방", "나비", "다람쥐", "라디오", "마법사", "바나나", "사과", "자전거", "거북이", "허수아비", "고래", "도토리", "소방차", "코끼리", "무지개", "수박", "우산"]) {
    assert.match(page, new RegExp(word));
  }
  for (const world of ["소리숲", "도토리 오솔길", "햇살 들판", "밤꽃 언덕", "구름 놀이터"]) {
    assert.match(page, new RegExp(world));
  }
  for (const guide of ["난 토토야", "난 토리야", "난 루루야", "나는 밤이야", "나는 구름이야", "깡충깡충 준비 완료", "도토리를 챙겨 왔어", "꼬리를 살랑살랑", "반짝이는 글자 조각"]) {
    assert.match(page, new RegExp(guide));
  }
  assert.match(page, /const roundSeeds: RoundSeed\[\] = \[/);
  assert.match(page, /const worlds: World\[\] = roundSeeds\.map/);
  assert.equal((page.match(/\{ syllable: "/g) ?? []).length, 50);
  assert.match(page, /function makeStageRounds/);
  assert.match(page, /function validateAllChoices/);
  assert.match(page, /validateAllChoices\(worlds\)/);
  assert.match(page, /new Set\(group\.values\)\.size !== group\.values\.length/);
  assert.match(page, /const count = 4 \+ \(stageIndex % 2\)/);
  assert.match(page, /50개의 스테이지/);
  assert.match(page, /\{totalSteps\}개의 글자 문제/);
  assert.match(page, /동산마다 순서가 섞인 4~5개의 글자 문제/);
  assert.match(page, /다음 문제 \(\$\{roundIndex \+ 2\}\/\$\{world\.rounds\.length\}\)/);
  assert.match(page, /50단계 탐험 지도/);
  assert.match(page, /<audio ref=\{audioRef\}/);
  assert.match(page, /\/audio\/leda\/\$\{file\}\.mp3\?v=2/);
  assert.doesNotMatch(page, /speechSynthesis|SpeechSynthesisUtterance|fallbackSpeak/);
  assert.match(page, /localStorage/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /forest-cast/);
  assert.match(page, /world-journey/);
  assert.match(page, /journey-row--reverse/);
  assert.match(page, /journey-stone__copy/);
  assert.match(page, /journey-nature/);
  assert.match(page, /journey-tree/);
  assert.match(page, /home-button/);
  assert.match(page, /onClick=\{goHome\}/);
  assert.match(page, /game-navigation/);
  assert.match(page, /game-nav-button--next/);
  assert.match(page, /onClick=\{goPreviousScreen\}/);
  assert.match(page, /onClick=\{goNextScreen\}/);
  assert.match(page, /roundIndex === 0/);
  assert.match(page, /setRoundIndex\(previousIndex\)/);
  assert.match(page, /setPhase\("celebrate"\)/);
  assert.match(page, /pictureSolved/);
  assert.match(page, /‘\$\{round\.syllable\}’ 소리를 다시 들어볼까\?/);
  assert.match(page, /playVoice\(`retry-\$\{round\.audioKey\}`/);
  assert.match(page, /기역/);
  assert.match(page, /짜잔! \$\{consonantNames\[round\.consonant\]\}과/);
  assert.match(page, /playVoice\(`tile-\$\{type\}-\$\{voiceIndex\}`/);
  assert.doesNotMatch(page, /playVoice\("wrong"/);
  assert.doesNotMatch(page, /좋은 생각이야/);
  assert.match(page, /playVoice\(`correct-\$\{round\.audioKey\}`,[^\n]+false, showBuildScreen\)/);
  assert.match(page, /if \(phase === "sound"\) \{\s*\n\s*showBuildScreen\(\)/);
  assert.match(page, /const nextScreenDisabled = phase === "build"/);
  assert.match(css, /\.topbar\s*\{[^}]*position:sticky;[^}]*top:0/);
  assert.match(css, /\.game-navigation\s*\{[^}]*position:absolute;[^}]*right:28px;[^}]*top:27px/);
  assert.match(css, /\.game-nav-button\s*\{/);
  assert.match(css, /\.game-nav-button--next\s*\{[^}]*background:var\(--round-color\)/);
  assert.match(css, /journey-row:not\(:last-child\)::after/);
  assert.match(css, /journey-bubble[^}]*font-size:14px/);
  assert.match(css, /flower-shelf[^}]*grid-template-columns:repeat\(5,1fr\)/);
  assert.match(css, /garden-flower--5/);
  assert.doesNotMatch(page, /world-card__scene|world-cards/);
  assert.match(page, /\/brand\/malang-hangul-logo-transparent\.png/);
  assert.doesNotMatch(css, /NanumSquareRound/);
  assert.match(css, /font-family:\s*"Apple SD Gothic Neo",\s*"Pretendard"/);
  assert.match(page, /밤이가 말해요\. 친구야, 같이 놀자!/);
  for (const character of ["toto", "tori", "lulu", "bami"]) {
    assert.match(page, new RegExp(`/characters/sprites/${character}\\.png`));
  }
  assert.doesNotMatch(page, /ForestFriends|콩이|🐰|🐸|🦔|world\.animal/);
  assert.doesNotMatch(page, /tiny-pond/);
  assert.doesNotMatch(css, /\.tiny-pond/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /@media \(max-width:\s*540px\)/);
  assert.match(layout, /lang="ko"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("includes every Google Cloud Leda voice clip used by the fifty stages", async () => {
  const audioDirectory = new URL("../public/audio/leda/", import.meta.url);
  const files = (await readdir(audioDirectory)).filter((file) => file.endsWith(".mp3"));
  assert.equal(files.length, 273);

  for (const common of ["intro.mp3", "tile-wrong.mp3", "complete-4.mp3", "complete-5.mp3"]) {
    assert.ok(files.includes(common), `missing ${common}`);
  }

  for (let index = 1; index <= 50; index += 1) {
    for (const prefix of ["prompt", "build", "correct", "combine", "retry"]) {
      const file = `${prefix}-letter-${index}.mp3`;
      assert.ok(files.includes(file), `missing ${file}`);
      assert.ok((await stat(new URL(file, audioDirectory))).size > 512, `${file} is unexpectedly small`);
    }
  }

  for (let index = 1; index <= 14; index += 1) {
    assert.ok(files.includes(`tile-consonant-${index}.mp3`), `missing tile-consonant-${index}.mp3`);
  }
  for (let index = 1; index <= 5; index += 1) {
    assert.ok(files.includes(`tile-vowel-${index}.mp3`), `missing tile-vowel-${index}.mp3`);
  }
});

test("uses adjustable looping music and preloaded answer effects", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const musicDirectory = new URL("../public/audio/music/", import.meta.url);
  const expectedFiles = ["home-bgm.mp3", "game-bgm.mp3", "correct.mp3", "wrong.mp3", "flower-success.mp3"];

  for (const file of expectedFiles) {
    assert.ok((await stat(new URL(file, musicDirectory))).size > 1024, `${file} is missing or empty`);
  }

  assert.match(page, /DEFAULT_BGM_VOLUME = 0\.34/);
  assert.match(page, /GAME_BGM_SCALE = 0\.9/);
  assert.match(page, /VOICE_DUCKING_SCALE = 0\.35/);
  assert.match(page, /type="range"/);
  assert.match(page, /aria-label="배경음악 볼륨"/);
  assert.match(page, /home-bgm\.mp3\?v=1[^\n]+loop/);
  assert.match(page, /game-bgm\.mp3\?v=1[^\n]+loop/);
  assert.match(page, /playEffect\("correct", CORRECT_EFFECT_VOLUME\)/);
  assert.match(page, /playEffect\("wrong", WRONG_EFFECT_VOLUME\)/);
  assert.match(page, /playEffect\("flower-success", FLOWER_EFFECT_VOLUME\)/);
  assert.match(page, /correctEffectRef[^]*correct\.mp3\?v=2/);
  assert.match(page, /wrongEffectRef[^]*wrong\.mp3\?v=2/);
  assert.match(page, /flowerEffectRef[^]*flower-success\.mp3\?v=2/);
  assert.doesNotMatch(page, /effect\.src\s*=/);
  assert.doesNotMatch(page, /speechSynthesis|SpeechSynthesisUtterance|fallbackSpeak/);
});
