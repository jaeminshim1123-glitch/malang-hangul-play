import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("includes six guided worlds, twelve lessons, and recorded audio", async () => {
  const [page, css, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const word of ["가방", "나비", "모자", "사과", "다람쥐", "라디오", "바나나", "자전거", "고래", "누나", "미끄럼틀", "소방차"]) {
    assert.match(page, new RegExp(word));
  }
  for (const world of ["소리숲", "도토리 오솔길", "햇살 들판", "밤꽃 언덕", "구름 놀이터", "무지개 정상"]) {
    assert.match(page, new RegExp(world));
  }
  for (const guide of ["난 토토야", "난 토리야", "난 루루야", "나는 밤이야", "나는 구름이야", "우리 모두 기다리고 있어"]) {
    assert.match(page, new RegExp(guide));
  }
  assert.match(page, /<audio ref=\{audioRef\}/);
  assert.match(page, /\/audio\/\$\{file\}\.wav/);
  assert.match(page, /speechSynthesis/);
  assert.match(page, /localStorage/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /forest-cast/);
  assert.match(page, /world-journey/);
  assert.match(page, /journey-route/);
  assert.match(page, /journey-stone__copy/);
  assert.match(page, /journey-nature/);
  assert.match(page, /journey-tree/);
  assert.match(css, /journey-stop--4\s*\{[^}]*grid-row:2/);
  assert.match(css, /journey-bubble[^}]*font-size:14px/);
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
