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
  accent: string;
  completeTitle: string;
  completeCopy: string;
  rounds: LearningRound[];
};

const worlds: World[] = [
  {
    name: "소리숲",
    label: "첫 번째 동산",
    tagline: "글자꽃을 깨워요",
    description: "몽글이와 첫소리를 듣고 기본 글자를 만들어요.",
    accent: "#2f9270",
    completeTitle: "소리숲이 다시 말랑말랑!",
    completeCopy: "가 · 나 · 모 · 사, 네 개의 글자꽃을 피웠어요.",
    rounds: [
      { audioKey: "ga", syllable: "가", consonant: "ㄱ", vowel: "ㅏ", word: "가방", emoji: "🎒", color: "#ff8067", choices: [{ word: "나비", emoji: "🦋" }, { word: "가방", emoji: "🎒" }, { word: "모자", emoji: "👒" }], consonantChoices: ["ㄴ", "ㄱ", "ㅁ"], vowelChoices: ["ㅗ", "ㅏ", "ㅜ"] },
      { audioKey: "na", syllable: "나", consonant: "ㄴ", vowel: "ㅏ", word: "나비", emoji: "🦋", color: "#7d6be8", choices: [{ word: "모자", emoji: "👒" }, { word: "사과", emoji: "🍎" }, { word: "나비", emoji: "🦋" }], consonantChoices: ["ㅁ", "ㄴ", "ㅅ"], vowelChoices: ["ㅏ", "ㅓ", "ㅗ"] },
      { audioKey: "mo", syllable: "모", consonant: "ㅁ", vowel: "ㅗ", word: "모자", emoji: "👒", color: "#28ae86", choices: [{ word: "모자", emoji: "👒" }, { word: "가방", emoji: "🎒" }, { word: "나비", emoji: "🦋" }], consonantChoices: ["ㅅ", "ㄱ", "ㅁ"], vowelChoices: ["ㅜ", "ㅗ", "ㅏ"] },
      { audioKey: "sa", syllable: "사", consonant: "ㅅ", vowel: "ㅏ", word: "사과", emoji: "🍎", color: "#f3a727", choices: [{ word: "나비", emoji: "🦋" }, { word: "사과", emoji: "🍎" }, { word: "가방", emoji: "🎒" }], consonantChoices: ["ㄱ", "ㅅ", "ㄴ"], vowelChoices: ["ㅗ", "ㅜ", "ㅏ"] },
    ],
  },
  {
    name: "토끼 동산",
    label: "두 번째 동산",
    tagline: "소풍길을 만들어요",
    description: "새 자음 친구를 만나 토끼의 소풍길을 이어 주세요.",
    accent: "#e17b61",
    completeTitle: "토끼 동산의 길이 열렸어요!",
    completeCopy: "다 · 라 · 바 · 자, 네 개의 발판을 놓았어요.",
    rounds: [
      { audioKey: "da", syllable: "다", consonant: "ㄷ", vowel: "ㅏ", word: "다람쥐", emoji: "🐿️", color: "#e9785d", choices: [{ word: "다람쥐", emoji: "🐿️" }, { word: "바나나", emoji: "🍌" }, { word: "라디오", emoji: "📻" }], consonantChoices: ["ㄹ", "ㄷ", "ㅂ"], vowelChoices: ["ㅗ", "ㅏ", "ㅜ"] },
      { audioKey: "ra", syllable: "라", consonant: "ㄹ", vowel: "ㅏ", word: "라디오", emoji: "📻", color: "#816bd8", choices: [{ word: "자전거", emoji: "🚲" }, { word: "라디오", emoji: "📻" }, { word: "다람쥐", emoji: "🐿️" }], consonantChoices: ["ㄷ", "ㅂ", "ㄹ"], vowelChoices: ["ㅏ", "ㅓ", "ㅗ"] },
      { audioKey: "ba", syllable: "바", consonant: "ㅂ", vowel: "ㅏ", word: "바나나", emoji: "🍌", color: "#dfa928", choices: [{ word: "라디오", emoji: "📻" }, { word: "바나나", emoji: "🍌" }, { word: "자전거", emoji: "🚲" }], consonantChoices: ["ㅈ", "ㄹ", "ㅂ"], vowelChoices: ["ㅜ", "ㅏ", "ㅗ"] },
      { audioKey: "ja", syllable: "자", consonant: "ㅈ", vowel: "ㅏ", word: "자전거", emoji: "🚲", color: "#3d9fa3", choices: [{ word: "바나나", emoji: "🍌" }, { word: "다람쥐", emoji: "🐿️" }, { word: "자전거", emoji: "🚲" }], consonantChoices: ["ㅂ", "ㅈ", "ㄷ"], vowelChoices: ["ㅗ", "ㅜ", "ㅏ"] },
    ],
  },
  {
    name: "도토리 언덕",
    label: "세 번째 동산",
    tagline: "여러 모음을 만나요",
    description: "고·누·미·소를 만들며 더 다양한 모음을 익혀요.",
    accent: "#947049",
    completeTitle: "도토리 언덕 친구들이 돌아왔어요!",
    completeCopy: "고 · 누 · 미 · 소, 새로운 모음도 멋지게 찾았어요.",
    rounds: [
      { audioKey: "go", syllable: "고", consonant: "ㄱ", vowel: "ㅗ", word: "고래", emoji: "🐳", color: "#4c9ec9", choices: [{ word: "누나", emoji: "👧" }, { word: "고래", emoji: "🐳" }, { word: "소방차", emoji: "🚒" }], consonantChoices: ["ㄴ", "ㅅ", "ㄱ"], vowelChoices: ["ㅏ", "ㅗ", "ㅜ"] },
      { audioKey: "nu", syllable: "누", consonant: "ㄴ", vowel: "ㅜ", word: "누나", emoji: "👧", color: "#8c6fd0", choices: [{ word: "고래", emoji: "🐳" }, { word: "미끄럼틀", emoji: "🛝" }, { word: "누나", emoji: "👧" }], consonantChoices: ["ㅁ", "ㄴ", "ㄱ"], vowelChoices: ["ㅗ", "ㅏ", "ㅜ"] },
      { audioKey: "mi", syllable: "미", consonant: "ㅁ", vowel: "ㅣ", word: "미끄럼틀", emoji: "🛝", color: "#dd7b9e", choices: [{ word: "미끄럼틀", emoji: "🛝" }, { word: "소방차", emoji: "🚒" }, { word: "고래", emoji: "🐳" }], consonantChoices: ["ㅅ", "ㄱ", "ㅁ"], vowelChoices: ["ㅣ", "ㅗ", "ㅏ"] },
      { audioKey: "so", syllable: "소", consonant: "ㅅ", vowel: "ㅗ", word: "소방차", emoji: "🚒", color: "#e25f4d", choices: [{ word: "누나", emoji: "👧" }, { word: "고래", emoji: "🐳" }, { word: "소방차", emoji: "🚒" }], consonantChoices: ["ㄴ", "ㅅ", "ㅁ"], vowelChoices: ["ㅜ", "ㅗ", "ㅣ"] },
    ],
  },
];

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
  const [petals, setPetals] = useState(0);
  const [completedWorlds, setCompletedWorlds] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const world = worlds[worldIndex];
  const round = world.rounds[roundIndex];
  const totalSteps = worlds.length * 4;
  const completedSteps = worldIndex * 4 + roundIndex + (phase === "build" || phase === "celebrate" || phase === "complete" ? 0.5 : 0);
  const progress = phase === "welcome" || phase === "map" ? (completedWorlds.length / worlds.length) * 100 : Math.min(100, (completedSteps / totalSteps) * 100);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("malang-completed-worlds") ?? "[]") as number[];
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

  const startWorld = (index: number) => {
    const nextWorld = worlds[index];
    setWorldIndex(index);
    setRoundIndex(0);
    setPetals(0);
    setPickedConsonant(null);
    setPickedVowel(null);
    setWrongChoice(null);
    setWrongTile(null);
    setPhase("sound");
    setMessage("귀를 쫑긋! 첫소리를 찾아봐요.");
    playVoice(`prompt-${nextWorld.rounds[0].audioKey}`, `${nextWorld.rounds[0].syllable}로 시작하는 친구는 누구일까요?`, true);
  };

  const choosePicture = (word: string) => {
    if (word === round.word) {
      setWrongChoice(null);
      setMessage(`딩동댕! ${round.word}은 ‘${round.syllable}’로 시작해요.`);
      playVoice(`correct-${round.audioKey}`, `딩동댕! ${round.word}은 ${round.syllable}로 시작해요.`);
      window.setTimeout(() => {
        setPickedConsonant(null);
        setPickedVowel(null);
        setPhase("build");
        setMessage("이제 소리 조각을 합쳐 볼까요?");
      }, 1250);
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
      window.localStorage.setItem("malang-completed-worlds", JSON.stringify(updated));
      setPhase("complete");
      setMessage(world.completeTitle);
      playVoice(`complete-${worldIndex}`, world.completeTitle);
      return;
    }
    const next = roundIndex + 1;
    setRoundIndex(next);
    setPickedConsonant(null);
    setPickedVowel(null);
    setWrongChoice(null);
    setWrongTile(null);
    setPhase("sound");
    setMessage("다음 소리 친구를 찾아봐요.");
    playVoice(`prompt-${world.rounds[next].audioKey}`, `${world.rounds[next].syllable}로 시작하는 친구는 누구일까요?`);
  };

  const goNextWorld = () => {
    if (worldIndex < worlds.length - 1) startWorld(worldIndex + 1);
    else openMap();
  };

  return (
    <main className={`game-shell world-theme-${worldIndex}`}>
      <div className="sky-decoration" aria-hidden="true"><span className="cloud cloud--one" /><span className="cloud cloud--two" /><span className="sun">✦</span></div>

      <header className="topbar">
        <button className="brand" onClick={() => setPhase("welcome")} aria-label="말랑한글 처음 화면으로 이동">
          <img src="/brand/malang-hangul-logo.png" alt="말랑한글" />
        </button>
        <div className="progress-wrap" aria-label={`전체 탐험 진행률 ${Math.round(progress)}퍼센트`}><div className="progress-label"><span>{phase === "welcome" || phase === "map" ? "동산 탐험 지도" : world.name}</span><b>{completedWorlds.length} / {worlds.length} 동산</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
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
            <p>숲속 동산의 글자 길이 흐려졌대요.<br />소리를 찾고 글자를 만들어 세 동산을 밝혀 주세요.</p>
            <div className="adventure-summary"><span>3개의 동산</span><i>✦</i><span>12개의 글자 친구</span></div>
            <button className="primary-button" onClick={() => { setPhase("map"); playVoice("intro", "몽글이와 함께 소리숲을 탐험해 볼까요?", true); }}>탐험 지도 펼치기 <span aria-hidden="true">→</span></button>
            <small className="play-note">동산마다 약 5분 · 시간 제한이 없어요</small>
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
          <div className="map-heading"><span className="eyebrow">어디부터 가볼까요?</span><h1>말랑한글 <em>탐험 지도</em></h1><p>완료한 동산도 언제든 다시 놀 수 있어요.</p></div>
          <div className="world-path" aria-hidden="true"><span /><i /><span /><i /><span /></div>
          <div className="world-cards">
            {worlds.map((item, index) => (
              <button key={item.name} className={`world-card world-card--${index + 1} ${completedWorlds.includes(index) ? "is-complete" : ""}`} onClick={() => startWorld(index)} style={{ "--world-accent": item.accent } as React.CSSProperties}>
                <span className="world-card__number">{completedWorlds.includes(index) ? "✓" : index + 1}</span>
                <div className="world-card__scene"><i className="world-card__tree">♣</i><i className="world-card__flower">✿</i><b className="world-card__stone">{item.rounds[0].syllable}</b><span className="world-card__trail" aria-hidden="true"><i /><i /><i /></span></div>
                <small>{item.label}</small><h2>{item.name}</h2><strong>{item.tagline}</strong><p>{item.description}</p>
                <span className="world-card__letters">{item.rounds.map((lesson) => <i key={lesson.syllable}>{lesson.syllable}</i>)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {(phase === "sound" || phase === "build") && (
        <section className="mission-layout">
          <aside className="guide-card"><div className="guide-badge">{world.name} · 소리 {roundIndex + 1}</div><CloudBuddy /><div className="speech-card"><p>{message}</p><button onClick={replayPrompt} disabled={!soundOn}><span aria-hidden="true">▶</span> 다시 듣기</button></div><div className="flower-shelf" aria-label={`모은 글자꽃 ${petals}개`}>{world.rounds.map((item, index) => <span key={item.syllable} className={index < petals ? "is-grown" : ""}><i>✿</i><small>{index < petals ? item.syllable : "?"}</small></span>)}</div><button className="map-link" onClick={openMap}>⌂ 탐험 지도</button></aside>
          <div className="play-card" style={{ "--round-color": round.color } as React.CSSProperties}>
            <div className="step-title"><span>{phase === "sound" ? "첫 번째 놀이" : "두 번째 놀이"}</span><h2>{phase === "sound" ? <><em>‘{round.syllable}’</em>로 시작하는 친구는?</> : <><em>소리 조각</em>을 맞춰 보세요</>}</h2><p>{phase === "sound" ? "그림을 콕 눌러 주세요" : `${round.consonant} + ${round.vowel} = 어떤 글자가 될까요?`}</p></div>
            {phase === "sound" && <div className="picture-choices">{round.choices.map((choice) => <button key={choice.word} onClick={() => choosePicture(choice.word)} className={wrongChoice === choice.word ? "is-wrong" : ""} aria-label={`${choice.word} 그림`}><span>{choice.emoji}</span><b>{choice.word}</b><i aria-hidden="true">콕!</i></button>)}</div>}
            {phase === "build" && <div className="builder"><div className="build-stage" aria-label="글자 조립판"><div className={`letter-slot ${pickedConsonant ? "is-filled" : ""}`}>{pickedConsonant ?? <span>자음</span>}</div><span className="plus">+</span><div className={`letter-slot ${pickedVowel ? "is-filled" : ""}`}>{pickedVowel ?? <span>모음</span>}</div><span className="equals">=</span><div className={`letter-result ${pickedConsonant && pickedVowel ? "is-ready" : ""}`}>{pickedConsonant && pickedVowel ? round.syllable : "?"}</div></div><div className="tile-groups"><div><span>자음 친구</span><div>{round.consonantChoices.map((tile) => <button key={tile} className={`${pickedConsonant === tile ? "is-picked" : ""} ${wrongTile === `consonant-${tile}` ? "is-wrong" : ""}`} onClick={() => chooseTile(tile, "consonant")}>{tile}</button>)}</div></div><div><span>모음 친구</span><div>{round.vowelChoices.map((tile) => <button key={tile} className={`${pickedVowel === tile ? "is-picked" : ""} ${wrongTile === `vowel-${tile}` ? "is-wrong" : ""}`} onClick={() => chooseTile(tile, "vowel")}>{tile}</button>)}</div></div></div><button className="combine-button" disabled={!pickedConsonant || !pickedVowel} onClick={combine}>{pickedConsonant && pickedVowel ? "글자 합치기!" : "두 조각을 찾아 주세요"}</button></div>}
          </div>
        </section>
      )}

      {phase === "celebrate" && <section className="celebrate-card" style={{ "--round-color": round.color } as React.CSSProperties}><div className="confetti" aria-hidden="true">✦ <i>●</i> ✿ <b>▲</b> ✦ <i>●</i> ✿</div><div className="word-flower"><span className="word-flower__petal word-flower__petal--one" /><span className="word-flower__petal word-flower__petal--two" /><span className="word-flower__petal word-flower__petal--three" /><span className="word-flower__petal word-flower__petal--four" /><b>{round.syllable}</b></div><span className="success-label">글자꽃이 피었어요!</span><h2><em>{round.consonant}</em> + <em>{round.vowel}</em> = <strong>{round.syllable}</strong></h2><div className="learned-word"><span>{round.emoji}</span><p><b>{round.word}</b><small>“{round.word}”의 첫 글자예요</small></p></div><button className="primary-button" onClick={nextRound}>{roundIndex === world.rounds.length - 1 ? `${world.name} 완성하기` : "다음 소리 찾기"} <span aria-hidden="true">→</span></button></section>}

      {phase === "complete" && <section className="complete-card"><div className={`complete-garden complete-garden--${worldIndex + 1}`} aria-label={`${world.name}의 글자꽃 정원`}>{world.rounds.map((item, index) => <div className={`garden-flower garden-flower--${index + 1}`} key={item.syllable}><i>✿</i><b>{item.syllable}</b></div>)}<CloudBuddy mood="cheer" /><div className="garden-sparkles" aria-hidden="true">✦ <i>✦</i> ✦</div></div><div className="complete-copy"><span className="eyebrow">{world.label} 탐험 완료</span><h1>{world.completeTitle.split(" ").slice(0, -1).join(" ")}<br /><em>{world.completeTitle.split(" ").at(-1)}</em></h1><p>{world.completeCopy}</p><div className="reward-ticket"><span>✿</span><p><small>이번 동산에서 피운 꽃</small><b>{world.rounds.length}송이</b></p></div><button className="primary-button" onClick={goNextWorld}>{worldIndex < worlds.length - 1 ? `다음: ${worlds[worldIndex + 1].name}` : "탐험 지도 보기"} <span aria-hidden="true">→</span></button><button className="text-button" onClick={() => startWorld(worldIndex)}>이 동산 한 번 더</button><button className="text-button text-button--map" onClick={openMap}>다른 동산 고르기</button></div></section>}

      <p className="sr-only" aria-live="polite">{message}</p>
      <audio ref={audioRef} className="sr-only" preload="auto" aria-hidden="true" />
      <footer><span>말랑한글 연구소</span><p>아이의 속도로, 놀이처럼 천천히 배워요.</p></footer>
    </main>
  );
}
