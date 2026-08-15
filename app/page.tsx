"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Phase = "welcome" | "map" | "sound" | "build" | "celebrate" | "complete";

type LearningRound = {
  audioKey: string;
  syllable: string;
  consonant: string;
  vowel: string;
  word: string;
  emoji: string;
  color: string;
  choices: Array<{ word: string; emoji: string }>;
  consonantChoices: string[];
  vowelChoices: string[];
};

type World = {
  name: string;
  label: string;
  tagline: string;
  description: string;
  guide: "toto" | "tori" | "lulu" | "bami" | "cloud" | "friends";
  guideName: string;
  greeting: string;
  accent: string;
  completeTitle: string;
  completeCopy: string;
  rounds: LearningRound[];
};

type RoundSeed = Pick<LearningRound, "syllable" | "consonant" | "vowel" | "word" | "emoji">;

const roundSeeds: RoundSeed[] = [
  { syllable: "가", consonant: "ㄱ", vowel: "ㅏ", word: "가방", emoji: "🎒" },
  { syllable: "나", consonant: "ㄴ", vowel: "ㅏ", word: "나비", emoji: "🦋" },
  { syllable: "다", consonant: "ㄷ", vowel: "ㅏ", word: "다람쥐", emoji: "🐿️" },
  { syllable: "라", consonant: "ㄹ", vowel: "ㅏ", word: "라디오", emoji: "📻" },
  { syllable: "마", consonant: "ㅁ", vowel: "ㅏ", word: "마법사", emoji: "🧙" },
  { syllable: "바", consonant: "ㅂ", vowel: "ㅏ", word: "바나나", emoji: "🍌" },
  { syllable: "사", consonant: "ㅅ", vowel: "ㅏ", word: "사과", emoji: "🍎" },
  { syllable: "아", consonant: "ㅇ", vowel: "ㅏ", word: "아이", emoji: "🧒" },
  { syllable: "자", consonant: "ㅈ", vowel: "ㅏ", word: "자전거", emoji: "🚲" },
  { syllable: "차", consonant: "ㅊ", vowel: "ㅏ", word: "차표", emoji: "🎫" },
  { syllable: "카", consonant: "ㅋ", vowel: "ㅏ", word: "카메라", emoji: "📷" },
  { syllable: "타", consonant: "ㅌ", vowel: "ㅏ", word: "타조", emoji: "🐦" },
  { syllable: "파", consonant: "ㅍ", vowel: "ㅏ", word: "파도", emoji: "🌊" },
  { syllable: "하", consonant: "ㅎ", vowel: "ㅏ", word: "하마", emoji: "🦛" },
  { syllable: "거", consonant: "ㄱ", vowel: "ㅓ", word: "거북이", emoji: "🐢" },
  { syllable: "너", consonant: "ㄴ", vowel: "ㅓ", word: "너구리", emoji: "🦝" },
  { syllable: "더", consonant: "ㄷ", vowel: "ㅓ", word: "더하기", emoji: "➕" },
  { syllable: "러", consonant: "ㄹ", vowel: "ㅓ", word: "러닝화", emoji: "👟" },
  { syllable: "머", consonant: "ㅁ", vowel: "ㅓ", word: "머리", emoji: "💇" },
  { syllable: "버", consonant: "ㅂ", vowel: "ㅓ", word: "버스", emoji: "🚌" },
  { syllable: "서", consonant: "ㅅ", vowel: "ㅓ", word: "서랍", emoji: "🗄️" },
  { syllable: "어", consonant: "ㅇ", vowel: "ㅓ", word: "어항", emoji: "🐠" },
  { syllable: "저", consonant: "ㅈ", vowel: "ㅓ", word: "저금통", emoji: "🐷" },
  { syllable: "처", consonant: "ㅊ", vowel: "ㅓ", word: "처마", emoji: "🏠" },
  { syllable: "커", consonant: "ㅋ", vowel: "ㅓ", word: "커피", emoji: "☕" },
  { syllable: "터", consonant: "ㅌ", vowel: "ㅓ", word: "터널", emoji: "🚇" },
  { syllable: "퍼", consonant: "ㅍ", vowel: "ㅓ", word: "퍼즐", emoji: "🧩" },
  { syllable: "허", consonant: "ㅎ", vowel: "ㅓ", word: "허수아비", emoji: "🌾" },
  { syllable: "고", consonant: "ㄱ", vowel: "ㅗ", word: "고래", emoji: "🐳" },
  { syllable: "노", consonant: "ㄴ", vowel: "ㅗ", word: "노래", emoji: "🎵" },
  { syllable: "도", consonant: "ㄷ", vowel: "ㅗ", word: "도토리", emoji: "🌰" },
  { syllable: "로", consonant: "ㄹ", vowel: "ㅗ", word: "로봇", emoji: "🤖" },
  { syllable: "모", consonant: "ㅁ", vowel: "ㅗ", word: "모자", emoji: "👒" },
  { syllable: "보", consonant: "ㅂ", vowel: "ㅗ", word: "보트", emoji: "⛵" },
  { syllable: "소", consonant: "ㅅ", vowel: "ㅗ", word: "소방차", emoji: "🚒" },
  { syllable: "오", consonant: "ㅇ", vowel: "ㅗ", word: "오리", emoji: "🦆" },
  { syllable: "조", consonant: "ㅈ", vowel: "ㅗ", word: "조개", emoji: "🐚" },
  { syllable: "초", consonant: "ㅊ", vowel: "ㅗ", word: "초콜릿", emoji: "🍫" },
  { syllable: "코", consonant: "ㅋ", vowel: "ㅗ", word: "코끼리", emoji: "🐘" },
  { syllable: "토", consonant: "ㅌ", vowel: "ㅗ", word: "토끼", emoji: "🐇" },
  { syllable: "포", consonant: "ㅍ", vowel: "ㅗ", word: "포도", emoji: "🍇" },
  { syllable: "호", consonant: "ㅎ", vowel: "ㅗ", word: "호랑이", emoji: "🐯" },
  { syllable: "구", consonant: "ㄱ", vowel: "ㅜ", word: "구름", emoji: "☁️" },
  { syllable: "누", consonant: "ㄴ", vowel: "ㅜ", word: "누나", emoji: "👧" },
  { syllable: "두", consonant: "ㄷ", vowel: "ㅜ", word: "두부", emoji: "⬜" },
  { syllable: "루", consonant: "ㄹ", vowel: "ㅜ", word: "루돌프", emoji: "🦌" },
  { syllable: "무", consonant: "ㅁ", vowel: "ㅜ", word: "무지개", emoji: "🌈" },
  { syllable: "부", consonant: "ㅂ", vowel: "ㅜ", word: "부엉이", emoji: "🦉" },
  { syllable: "수", consonant: "ㅅ", vowel: "ㅜ", word: "수박", emoji: "🍉" },
  { syllable: "우", consonant: "ㅇ", vowel: "ㅜ", word: "우산", emoji: "☂️" },
];

const consonants = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const vowels = ["ㅏ", "ㅓ", "ㅗ", "ㅜ", "ㅣ"];
const roundColors = ["#ff8067", "#7d6be8", "#28ae86", "#f3a727", "#4c9ec9", "#dc7796"];
const worldAccents = ["#2f9270", "#9a7042", "#e17b61", "#7f6ac9", "#479a9e", "#dc7796"];
const suffixes = ["꽃길", "놀이터", "언덕", "오솔길", "들판", "나무숲"];

function mixedOptions(answer: string, pool: string[], index: number) {
  const wrong = pool.filter((item) => item !== answer);
  const options = [answer, wrong[index % wrong.length], wrong[(index * 3 + 4) % wrong.length]];
  const unique = Array.from(new Set(options));
  for (const item of wrong) if (unique.length < 3 && !unique.includes(item)) unique.push(item);
  const shift = index % 3;
  return [...unique.slice(shift), ...unique.slice(0, shift)];
}

function makeRound(seed: RoundSeed, index: number): LearningRound {
  const distractorPool = roundSeeds.filter((candidate) => candidate.word !== seed.word);
  const distractors = [distractorPool[index % distractorPool.length], distractorPool[(index + 19) % distractorPool.length]];
  const choices = [seed, ...distractors].map(({ word, emoji }) => ({ word, emoji }));
  const shift = index % 3;
  return {
    ...seed,
    audioKey: `stage-${index + 1}`,
    color: roundColors[index % roundColors.length],
    choices: [...choices.slice(shift), ...choices.slice(0, shift)],
    consonantChoices: mixedOptions(seed.consonant, consonants, index),
    vowelChoices: mixedOptions(seed.vowel, vowels, index + 1),
  };
}

function makeStageRounds(stageIndex: number) {
  const count = 4 + (stageIndex % 2);
  const seedIndexes = [stageIndex, stageIndex + 13, stageIndex + 29, stageIndex + 41, stageIndex + 7]
    .slice(0, count)
    .map((index) => index % roundSeeds.length);
  const shift = (stageIndex * 3) % count;
  const mixedIndexes = [...seedIndexes.slice(shift), ...seedIndexes.slice(0, shift)];
  return mixedIndexes.map((seedIndex, questionIndex) => makeRound(roundSeeds[seedIndex], stageIndex * 5 + questionIndex));
}

const guideProfiles = {
  toto: { name: "토토", greeting: () => "깡충깡충 준비 완료! 오늘 숨어 있는 글자 친구들을 나랑 같이 찾아보자!" },
  tori: { name: "토리", greeting: () => "도토리를 챙겨 왔어! 여러 글자꽃을 하나씩 함께 피워 볼래?" },
  lulu: { name: "루루", greeting: () => "꼬리를 살랑살랑! 알록달록 섞인 소리를 찾는 게임을 같이 하자!" },
  bami: { name: "밤이", greeting: () => "반짝이는 글자 조각들이 숨어 있어! 끝까지 함께 찾아볼래?" },
} as const;

const firstFive: Array<Pick<World, "name" | "guide" | "guideName" | "greeting">> = [
  { name: "소리숲", guide: "toto", guideName: "토토", greeting: "안녕! 난 토토야! 나랑 소리숲에서 한글 공부 하지 않을래?" },
  { name: "도토리 오솔길", guide: "tori", guideName: "토리", greeting: "반가워! 난 토리야! 도토리 오솔길에서 글자꽃을 같이 피워 보자!" },
  { name: "햇살 들판", guide: "lulu", guideName: "루루", greeting: "안녕! 난 루루야! 햇살 들판에서 새 자음 친구를 만나 볼래?" },
  { name: "밤꽃 언덕", guide: "bami", guideName: "밤이", greeting: "나는 밤이야! 밤꽃 언덕에서 소리 조각을 맞추며 같이 놀자!" },
  { name: "구름 놀이터", guide: "cloud", guideName: "구름이", greeting: "나는 구름이야! 구름 놀이터에서 새 모음을 찾아 함께 날아 보자!" },
];

const animalOrder: Array<keyof typeof guideProfiles> = ["lulu", "toto", "bami", "tori", "toto", "lulu", "tori", "bami"];

const worlds: World[] = roundSeeds.map((seed, index) => {
  const introduction = firstFive[index];
  const animal = animalOrder[(index * 5 + 2) % animalOrder.length];
  const profile = guideProfiles[animal];
  const name = introduction?.name ?? `${seed.word} ${suffixes[index % suffixes.length]}`;
  const rounds = makeStageRounds(index);
  const letters = rounds.map((round) => round.syllable).join(" · ");
  return {
    name,
    label: `${index + 1}단계 동산`,
    tagline: `${rounds.length}개의 글자꽃을 피워요`,
    description: `${letters}의 첫소리를 듣고 여러 글자를 만들어요.`,
    guide: introduction?.guide ?? animal,
    guideName: introduction?.guideName ?? profile.name,
    greeting: introduction?.greeting ?? profile.greeting(),
    accent: worldAccents[index % worldAccents.length],
    completeTitle: `${rounds.length}송이 글자꽃이 피었어요!`,
    completeCopy: `${letters}, 섞여 있던 글자 친구를 모두 찾고 ${index + 1}단계 탐험을 멋지게 마쳤어요.`,
    rounds,
  };
});

function validateAllChoices(items: World[]) {
  for (const [worldIndex, item] of items.entries()) {
    for (const [roundIndex, round] of item.rounds.entries()) {
      const groups = [
        { name: "word", values: round.choices.map((choice) => choice.word), answer: round.word },
        { name: "consonant", values: round.consonantChoices, answer: round.consonant },
        { name: "vowel", values: round.vowelChoices, answer: round.vowel },
      ];
      for (const group of groups) {
        const answerCount = group.values.filter((value) => value === group.answer).length;
        if (new Set(group.values).size !== group.values.length || answerCount !== 1) {
          throw new Error(`Invalid ${group.name} choices at stage ${worldIndex + 1}, question ${roundIndex + 1}`);
        }
      }
    }
  }
}

validateAllChoices(worlds);

function fallbackSpeak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.82;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}

function CloudBuddy({ mood = "happy" }: { mood?: "happy" | "cheer" }) {
  return (
    <div className={`buddy buddy--${mood}`} aria-hidden="true">
      <span className="buddy__puff buddy__puff--left" />
      <span className="buddy__puff buddy__puff--top" />
      <span className="buddy__puff buddy__puff--right" />
      <span className="buddy__face"><i className="buddy__eye buddy__eye--left" /><i className="buddy__eye buddy__eye--right" /><i className="buddy__mouth" /></span>
      <span className="buddy__spark">✦</span>
    </div>
  );
}

function WorldGuide({ guide }: { guide: World["guide"] }) {
  if (guide === "cloud") {
    return <span className="journey-guide journey-guide--cloud"><span className="journey-cloud-scale"><CloudBuddy mood="cheer" /></span></span>;
  }

  if (guide === "friends") {
    return (
      <span className="journey-guide journey-guide--friends" aria-hidden="true">
        {(["toto", "tori", "lulu", "bami"] as const).map((friend) => <img key={friend} src={`/characters/sprites/${friend}.png`} alt="" />)}
      </span>
    );
  }

  return <span className="journey-guide"><img src={`/characters/sprites/${guide}.png`} alt="" /></span>;
}

function ForestDetails() {
  return (
    <div className="forest-details" aria-hidden="true">
      <div className="mushroom-patch"><i>●</i><i>●</i><i>●</i></div>
      <span className="acorn acorn--one">♠</span><span className="acorn acorn--two">♠</span>
      <span className="forest-spark forest-spark--one">✦</span><span className="forest-spark forest-spark--two">✦</span>
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [worldIndex, setWorldIndex] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("몽글이와 동산을 탐험해 볼까요?");
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [pickedConsonant, setPickedConsonant] = useState<string | null>(null);
  const [pickedVowel, setPickedVowel] = useState<string | null>(null);
  const [wrongTile, setWrongTile] = useState<string | null>(null);
  const [pictureSolved, setPictureSolved] = useState(false);
  const [petals, setPetals] = useState(0);
  const [completedWorlds, setCompletedWorlds] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const world = worlds[worldIndex];
  const round = world.rounds[roundIndex];
  const totalSteps = worlds.reduce((total, item) => total + item.rounds.length, 0);
  const completedSteps = worlds.slice(0, worldIndex).reduce((total, item) => total + item.rounds.length, 0) + roundIndex + (phase === "build" || phase === "celebrate" || phase === "complete" ? 0.5 : 0);
  const progress = phase === "welcome" || phase === "map" ? (completedWorlds.length / worlds.length) * 100 : Math.min(100, (completedSteps / totalSteps) * 100);
  const worldRows = useMemo(() => Array.from({ length: Math.ceil(worlds.length / 3) }, (_, row) => worlds.slice(row * 3, row * 3 + 3).map((item, offset) => ({ item, index: row * 3 + offset }))), []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("malang-completed-worlds-50-multi") ?? "[]") as number[];
      setCompletedWorlds(saved.filter((item) => Number.isInteger(item) && item >= 0 && item < worlds.length));
    } catch {
      setCompletedWorlds([]);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  const playVoice = useCallback((file: string, fallback: string, force = false) => {
    if (!soundOn && !force) return;
    stopAudio();
    const audio = audioRef.current;
    if (!audio) {
      fallbackSpeak(fallback);
      return;
    }
    audio.src = `/audio/${file}.wav`;
    audio.volume = 1;
    audio.load();
    void audio.play().catch(() => fallbackSpeak(fallback));
  }, [soundOn, stopAudio]);

  const promptText = useMemo(() => phase === "build"
    ? `${round.consonant}과 ${round.vowel}를 찾아서 ${round.syllable}를 만들어요.`
    : `${round.syllable}로 시작하는 친구는 누구일까요?`, [phase, round]);

  const replayPrompt = useCallback(() => {
    playVoice(`${phase === "build" ? "build" : "prompt"}-${round.audioKey}`, promptText);
  }, [phase, playVoice, promptText, round.audioKey]);

  const openMap = () => {
    stopAudio();
    setPhase("map");
    setMessage("가고 싶은 동산을 골라 주세요.");
  };

  const goHome = () => {
    stopAudio();
    setPhase("welcome");
    setMessage("숲속 친구들과 동산을 탐험해 볼까요?");
  };

  const startWorld = (index: number) => {
    const nextWorld = worlds[index];
    setWorldIndex(index);
    setRoundIndex(0);
    setPetals(0);
    setPickedConsonant(null);
    setPickedVowel(null);
    setWrongChoice(null);
    setWrongTile(null);
    setPictureSolved(false);
    setPhase("sound");
    setMessage("귀를 쫑긋! 첫소리를 찾아봐요.");
    playVoice(`prompt-${nextWorld.rounds[0].audioKey}`, `${nextWorld.rounds[0].syllable}로 시작하는 친구는 누구일까요?`, true);
  };

  const goPreviousScreen = () => {
    stopAudio();
    setWrongChoice(null);
    setWrongTile(null);
    if (phase === "sound") {
      if (roundIndex === 0) {
        openMap();
        return;
      }
      const previousIndex = roundIndex - 1;
      const previousRound = world.rounds[previousIndex];
      setRoundIndex(previousIndex);
      setPickedConsonant(previousRound.consonant);
      setPickedVowel(previousRound.vowel);
      setPictureSolved(true);
      setPhase("celebrate");
      setMessage(`${previousRound.syllable} 글자꽃을 다시 살펴봐요.`);
      return;
    }
    if (phase === "build") {
      setPickedConsonant(null);
      setPickedVowel(null);
      setPictureSolved(true);
      setPhase("sound");
      setMessage(`${round.syllable}로 시작하는 그림을 다시 찾아봐요.`);
      playVoice(`prompt-${round.audioKey}`, `${round.syllable}로 시작하는 친구는 누구일까요?`, true);
      return;
    }
    if (phase === "celebrate") {
      setPetals(roundIndex);
      setPickedConsonant(round.consonant);
      setPickedVowel(round.vowel);
      setPictureSolved(true);
      setPhase("build");
      setMessage(`${round.consonant}과 ${round.vowel}를 다시 맞춰 볼까요?`);
    }
  };

  const choosePicture = (word: string) => {
    if (pictureSolved) return;
    if (word === round.word) {
      setWrongChoice(null);
      setPictureSolved(true);
      setMessage(`딩동댕! ${round.word}은 ‘${round.syllable}’로 시작해요. 다음 화면으로 가 볼까요?`);
      playVoice(`correct-${round.audioKey}`, `딩동댕! ${round.word}은 ${round.syllable}로 시작해요.`);
      return;
    }
    setWrongChoice(word);
    setMessage(`좋은 생각이야! ${round.syllable} 소리를 다시 들어볼까?`);
    playVoice("wrong", `좋은 생각이야! ${round.syllable} 소리를 다시 들어볼까?`);
    window.setTimeout(() => setWrongChoice(null), 650);
  };

  const chooseTile = (tile: string, type: "consonant" | "vowel") => {
    const answer = type === "consonant" ? round.consonant : round.vowel;
    if (tile !== answer) {
      setWrongTile(`${type}-${tile}`);
      setMessage("통통! 다른 소리 조각도 살펴봐요.");
      playVoice("tile-wrong", "다른 소리 조각도 살펴봐요.");
      window.setTimeout(() => setWrongTile(null), 550);
      return;
    }
    if (type === "consonant") setPickedConsonant(tile);
    if (type === "vowel") setPickedVowel(tile);
    setMessage(type === "consonant" ? `${tile}! 첫 조각을 찾았어요.` : `${tile}! 두 번째 조각을 찾았어요.`);
  };

  const combine = () => {
    if (!pickedConsonant || !pickedVowel) return;
    setPetals((current) => current + 1);
    setMessage(`${round.consonant}과 ${round.vowel}가 만나 ‘${round.syllable}’!`);
    setPhase("celebrate");
    playVoice(`combine-${round.audioKey}`, `${round.consonant}과 ${round.vowel}가 만나 ${round.syllable}. ${round.word}!`);
  };

  const nextRound = () => {
    if (roundIndex === world.rounds.length - 1) {
      const updated = Array.from(new Set([...completedWorlds, worldIndex])).sort();
      setCompletedWorlds(updated);
      window.localStorage.setItem("malang-completed-worlds-50-multi", JSON.stringify(updated));
      setPhase("complete");
      setMessage(world.completeTitle);
      if (soundOn) fallbackSpeak(world.completeTitle);
      return;
    }
    const next = roundIndex + 1;
    setRoundIndex(next);
    setPickedConsonant(null);
    setPickedVowel(null);
    setWrongChoice(null);
    setWrongTile(null);
    setPictureSolved(false);
    setPhase("sound");
    setMessage("다음 소리 친구를 찾아봐요.");
    playVoice(`prompt-${world.rounds[next].audioKey}`, `${world.rounds[next].syllable}로 시작하는 친구는 누구일까요?`);
  };

  const goNextWorld = () => {
    if (worldIndex < worlds.length - 1) startWorld(worldIndex + 1);
    else openMap();
  };

  const goNextScreen = () => {
    stopAudio();
    if (phase === "sound" && pictureSolved) {
      setPickedConsonant(null);
      setPickedVowel(null);
      setPhase("build");
      setMessage("이제 소리 조각을 합쳐 볼까요?");
      playVoice(`build-${round.audioKey}`, `${round.consonant}과 ${round.vowel}를 찾아서 ${round.syllable}를 만들어요.`, true);
      return;
    }
    if (phase === "build" && pickedConsonant && pickedVowel) {
      combine();
      return;
    }
    if (phase === "celebrate") nextRound();
  };

  const nextScreenDisabled = phase === "sound" ? !pictureSolved : phase === "build" ? !pickedConsonant || !pickedVowel : false;

  return (
    <main className={`game-shell world-theme-${worldIndex}`}>
      <div className="sky-decoration" aria-hidden="true"><span className="cloud cloud--one" /><span className="cloud cloud--two" /><span className="sun">✦</span></div>

      <header className="topbar">
        <div className="topbar__brand-group">
          <button className="home-button" onClick={goHome} disabled={phase === "welcome"} aria-label="말랑한글 메인 화면으로 돌아가기"><span aria-hidden="true">←</span><b>처음으로</b></button>
          <button className="brand" onClick={goHome} aria-label="말랑한글 처음 화면으로 이동">
            <img src="/brand/malang-hangul-logo-transparent.png" alt="말랑한글" />
          </button>
        </div>
        <div className="progress-wrap" aria-label={`전체 탐험 진행률 ${Math.round(progress)}퍼센트`}><div className="progress-label"><span>{phase === "welcome" || phase === "map" ? "50단계 탐험 지도" : world.name}</span><b>{completedWorlds.length} / {worlds.length} 단계</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
        <button className="sound-toggle" onClick={() => {
          const next = !soundOn;
          setSoundOn(next);
          if (!next) stopAudio();
          else playVoice(phase === "sound" || phase === "build" ? `${phase === "build" ? "build" : "prompt"}-${round.audioKey}` : "intro", phase === "sound" || phase === "build" ? promptText : "몽글이와 함께 숲속 동산을 탐험해 볼까요?", true);
        }} aria-label={soundOn ? "소리 끄기" : "소리 켜기"} aria-pressed={soundOn}><span aria-hidden="true">{soundOn ? "♫" : "—"}</span>{soundOn ? "소리 켜짐" : "소리 꺼짐"}</button>
      </header>

      {phase === "welcome" && (
        <section className="welcome-card">
          <div className="welcome-copy">
            <span className="eyebrow">새 친구들이 기다려요</span>
            <h1>숲속 동산에서<br /><em>글자 모험</em>을 떠나요!</h1>
            <p>숲속 동산의 글자 길이 흐려졌대요.<br />소리를 찾고 글자를 만들어 50개의 동산을 밝혀 주세요.</p>
            <div className="adventure-summary"><span>50개의 스테이지</span><i>✦</i><span>{totalSteps}개의 글자 문제</span></div>
            <button className="primary-button" onClick={() => { setPhase("map"); playVoice("intro", "몽글이와 함께 소리숲을 탐험해 볼까요?", true); }}>탐험 지도 펼치기 <span aria-hidden="true">→</span></button>
            <small className="play-note">동산마다 약 3분 · 시간 제한이 없어요</small>
          </div>
          <div className="forest-scene forest-scene--alive" aria-label="글자꽃과 나무가 자라는 알록달록한 숲속 동산">
            <CloudBuddy mood="cheer" />
            <span className="tree tree--one"><i /><b>가</b></span><span className="tree tree--two"><i /><b>나</b></span><span className="tree tree--three"><i /><b>모</b></span>
            <span className="hill hill--back" /><span className="hill hill--front" />
            <span className="flower flower--one">✿</span><span className="flower flower--two">✿</span><span className="flower flower--three">✿</span>
            <ForestDetails />
            <div className="forest-cast" role="img" aria-label="토끼 토토, 여우 루루, 고슴도치 밤이, 다람쥐 토리가 함께 모인 모습">
              <img className="forest-character forest-character--toto" src="/characters/sprites/toto.png" alt="" />
              <img className="forest-character forest-character--lulu" src="/characters/sprites/lulu.png" alt="" />
              <img className="forest-character forest-character--bami" src="/characters/sprites/bami.png" alt="" />
              <img className="forest-character forest-character--tori" src="/characters/sprites/tori.png" alt="" />
            </div>
            <div className="scene-bubble" aria-label="밤이가 말해요. 친구야, 같이 놀자!"><span>친구야,</span><br /><b>같이 놀자!</b></div>
          </div>
        </section>
      )}

      {phase === "map" && (
        <section className="world-map-card">
          <div className="map-heading"><span className="eyebrow">50단계 징검다리를 따라 출발!</span><h1>말랑한글 <em>탐험 지도</em></h1><p>동산마다 순서가 섞인 4~5개의 글자 문제가 기다려요. 원하는 징검돌을 눌러 보세요.</p></div>
          <div className="world-journey">
            {worldRows.map((row, rowIndex) => (
              <div key={rowIndex} className={`journey-row ${rowIndex % 2 === 1 ? "journey-row--reverse" : ""}`}>
                {row.map(({ item, index }) => (
                  <button key={item.name} className={`journey-stop ${completedWorlds.includes(index) ? "is-complete" : ""}`} onClick={() => startWorld(index)} style={{ "--world-accent": item.accent } as React.CSSProperties} aria-label={`${item.label} ${item.name}. ${item.greeting}`}>
                    <span className="journey-dialogue">
                      <WorldGuide guide={item.guide} />
                      <span className="journey-bubble"><b>{item.guideName}</b>{item.greeting}</span>
                    </span>
                    <span className="journey-stone">
                      <span className="journey-stone__number">{completedWorlds.includes(index) ? "✓" : index + 1}</span>
                      <span className="journey-stone__copy">
                        <small>{item.label}</small>
                        <strong>{item.name}</strong>
                        <em>{item.tagline}</em>
                        <span className="journey-letters">{item.rounds.map((lesson) => <i key={lesson.syllable}>{lesson.syllable}</i>)}</span>
                      </span>
                      <span className="journey-nature" aria-hidden="true">
                        <i className="journey-tree" />
                        <i className="journey-letter-sign">{item.rounds[0].syllable}</i>
                        <i className="journey-flower">✿</i>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {(phase === "sound" || phase === "build") && (
        <section className="mission-layout">
          <aside className="guide-card"><div className="guide-badge">{world.name} · {roundIndex + 1} / {world.rounds.length} 문제</div><CloudBuddy /><div className="speech-card"><p>{message}</p><button onClick={replayPrompt} disabled={!soundOn}><span aria-hidden="true">▶</span> 다시 듣기</button></div><div className="flower-shelf" aria-label={`모은 글자꽃 ${petals}개`}>{world.rounds.map((item, index) => <span key={item.syllable} className={index < petals ? "is-grown" : ""}><i>✿</i><small>{index < petals ? item.syllable : "?"}</small></span>)}</div><button className="map-link" onClick={openMap}>⌂ 탐험 지도</button></aside>
          <div className="play-card" style={{ "--round-color": round.color } as React.CSSProperties}>
            <div className="game-navigation" aria-label="게임 화면 이동">
              <button className="game-nav-button" onClick={goPreviousScreen}><span aria-hidden="true">←</span> 이전 화면</button>
              <button className="game-nav-button game-nav-button--next" onClick={goNextScreen} disabled={nextScreenDisabled}>다음 화면 <span aria-hidden="true">→</span></button>
            </div>
            <div className="step-title"><span>{phase === "sound" ? "첫 번째 놀이" : "두 번째 놀이"}</span><h2>{phase === "sound" ? <><em>‘{round.syllable}’</em>로 시작하는 친구는?</> : <><em>소리 조각</em>을 맞춰 보세요</>}</h2><p>{phase === "sound" ? "그림을 콕 눌러 주세요" : `${round.consonant} + ${round.vowel} = 어떤 글자가 될까요?`}</p></div>
            {phase === "sound" && <div className="picture-choices">{round.choices.map((choice) => <button key={choice.word} onClick={() => choosePicture(choice.word)} disabled={pictureSolved} className={`${wrongChoice === choice.word ? "is-wrong" : ""} ${pictureSolved && choice.word === round.word ? "is-correct" : ""}`} aria-label={`${choice.word} 그림`}><span>{choice.emoji}</span><b>{choice.word}</b><i aria-hidden="true">콕!</i></button>)}</div>}
            {phase === "build" && <div className="builder"><div className="build-stage" aria-label="글자 조립판"><div className={`letter-slot ${pickedConsonant ? "is-filled" : ""}`}>{pickedConsonant ?? <span>자음</span>}</div><span className="plus">+</span><div className={`letter-slot ${pickedVowel ? "is-filled" : ""}`}>{pickedVowel ?? <span>모음</span>}</div><span className="equals">=</span><div className={`letter-result ${pickedConsonant && pickedVowel ? "is-ready" : ""}`}>{pickedConsonant && pickedVowel ? round.syllable : "?"}</div></div><div className="tile-groups"><div><span>자음 친구</span><div>{round.consonantChoices.map((tile) => <button key={tile} className={`${pickedConsonant === tile ? "is-picked" : ""} ${wrongTile === `consonant-${tile}` ? "is-wrong" : ""}`} onClick={() => chooseTile(tile, "consonant")}>{tile}</button>)}</div></div><div><span>모음 친구</span><div>{round.vowelChoices.map((tile) => <button key={tile} className={`${pickedVowel === tile ? "is-picked" : ""} ${wrongTile === `vowel-${tile}` ? "is-wrong" : ""}`} onClick={() => chooseTile(tile, "vowel")}>{tile}</button>)}</div></div></div><button className="combine-button" disabled={!pickedConsonant || !pickedVowel} onClick={combine}>{pickedConsonant && pickedVowel ? "글자 합치기!" : "두 조각을 찾아 주세요"}</button></div>}
          </div>
        </section>
      )}

      {phase === "celebrate" && <section className="celebrate-card" style={{ "--round-color": round.color } as React.CSSProperties}><div className="game-navigation game-navigation--celebrate" aria-label="게임 화면 이동"><button className="game-nav-button" onClick={goPreviousScreen}><span aria-hidden="true">←</span> 이전 화면</button><button className="game-nav-button game-nav-button--next" onClick={goNextScreen}>다음 화면 <span aria-hidden="true">→</span></button></div><div className="confetti" aria-hidden="true">✦ <i>●</i> ✿ <b>▲</b> ✦ <i>●</i> ✿</div><div className="word-flower"><span className="word-flower__petal word-flower__petal--one" /><span className="word-flower__petal word-flower__petal--two" /><span className="word-flower__petal word-flower__petal--three" /><span className="word-flower__petal word-flower__petal--four" /><b>{round.syllable}</b></div><span className="success-label">{roundIndex + 1}번째 글자꽃이 피었어요!</span><h2><em>{round.consonant}</em> + <em>{round.vowel}</em> = <strong>{round.syllable}</strong></h2><div className="learned-word"><span>{round.emoji}</span><p><b>{round.word}</b><small>“{round.word}”의 첫 글자예요</small></p></div><button className="primary-button" onClick={nextRound}>{roundIndex === world.rounds.length - 1 ? `${world.name} 완성하기` : `다음 문제 (${roundIndex + 2}/${world.rounds.length})`} <span aria-hidden="true">→</span></button></section>}

      {phase === "complete" && <section className="complete-card"><div className={`complete-garden complete-garden--${worldIndex + 1}`} aria-label={`${world.name}의 글자꽃 정원`}>{world.rounds.map((item, index) => <div className={`garden-flower garden-flower--${index + 1}`} key={item.syllable}><i>✿</i><b>{item.syllable}</b></div>)}<CloudBuddy mood="cheer" /><div className="garden-sparkles" aria-hidden="true">✦ <i>✦</i> ✦</div></div><div className="complete-copy"><span className="eyebrow">{world.label} 탐험 완료</span><h1>{world.completeTitle.split(" ").slice(0, -1).join(" ")}<br /><em>{world.completeTitle.split(" ").at(-1)}</em></h1><p>{world.completeCopy}</p><div className="reward-ticket"><span>✿</span><p><small>이번 동산에서 피운 꽃</small><b>{world.rounds.length}송이</b></p></div><button className="primary-button" onClick={goNextWorld}>{worldIndex < worlds.length - 1 ? `다음: ${worlds[worldIndex + 1].name}` : "탐험 지도 보기"} <span aria-hidden="true">→</span></button><button className="text-button" onClick={() => startWorld(worldIndex)}>이 동산 한 번 더</button><button className="text-button text-button--map" onClick={openMap}>다른 동산 고르기</button></div></section>}

      <p className="sr-only" aria-live="polite">{message}</p>
      <audio ref={audioRef} className="sr-only" preload="auto" aria-hidden="true" />
      <footer><span>말랑한글 연구소</span><p>아이의 속도로, 놀이처럼 천천히 배워요.</p></footer>
    </main>
  );
}
