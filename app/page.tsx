"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Phase = "welcome" | "sound" | "build" | "celebrate" | "complete";

type Round = {
  syllable: string;
  consonant: string;
  vowel: string;
  word: string;
  emoji: string;
  color: string;
  choices: Array<{ word: string; emoji: string }>;
  consonantChoices: string[];
  vowelChoices: string[];
  reward: string;
};

const rounds: Round[] = [
  {
    syllable: "가",
    consonant: "ㄱ",
    vowel: "ㅏ",
    word: "가방",
    emoji: "🎒",
    color: "#ff8067",
    choices: [
      { word: "나비", emoji: "🦋" },
      { word: "가방", emoji: "🎒" },
      { word: "모자", emoji: "👒" },
    ],
    consonantChoices: ["ㄴ", "ㄱ", "ㅁ"],
    vowelChoices: ["ㅗ", "ㅏ", "ㅜ"],
    reward: "가방꽃",
  },
  {
    syllable: "나",
    consonant: "ㄴ",
    vowel: "ㅏ",
    word: "나비",
    emoji: "🦋",
    color: "#7d6be8",
    choices: [
      { word: "모자", emoji: "👒" },
      { word: "사과", emoji: "🍎" },
      { word: "나비", emoji: "🦋" },
    ],
    consonantChoices: ["ㅁ", "ㄴ", "ㅅ"],
    vowelChoices: ["ㅏ", "ㅓ", "ㅗ"],
    reward: "나비꽃",
  },
  {
    syllable: "모",
    consonant: "ㅁ",
    vowel: "ㅗ",
    word: "모자",
    emoji: "👒",
    color: "#28ae86",
    choices: [
      { word: "모자", emoji: "👒" },
      { word: "가방", emoji: "🎒" },
      { word: "나비", emoji: "🦋" },
    ],
    consonantChoices: ["ㅅ", "ㄱ", "ㅁ"],
    vowelChoices: ["ㅜ", "ㅗ", "ㅏ"],
    reward: "모자꽃",
  },
  {
    syllable: "사",
    consonant: "ㅅ",
    vowel: "ㅏ",
    word: "사과",
    emoji: "🍎",
    color: "#f3a727",
    choices: [
      { word: "나비", emoji: "🦋" },
      { word: "사과", emoji: "🍎" },
      { word: "가방", emoji: "🎒" },
    ],
    consonantChoices: ["ㄱ", "ㅅ", "ㄴ"],
    vowelChoices: ["ㅗ", "ㅜ", "ㅏ"],
    reward: "사과꽃",
  },
];

function speak(text: string, enabled = true) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ko-KR";
  utterance.rate = 0.82;
  utterance.pitch = 1.12;
  window.speechSynthesis.speak(utterance);
}

function CloudBuddy({ mood = "happy" }: { mood?: "happy" | "cheer" }) {
  return (
    <div className={`buddy buddy--${mood}`} aria-hidden="true">
      <span className="buddy__puff buddy__puff--left" />
      <span className="buddy__puff buddy__puff--top" />
      <span className="buddy__puff buddy__puff--right" />
      <span className="buddy__face">
        <i className="buddy__eye buddy__eye--left" />
        <i className="buddy__eye buddy__eye--right" />
        <i className="buddy__mouth" />
      </span>
      <span className="buddy__spark">✦</span>
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("welcome");
  const [roundIndex, setRoundIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [message, setMessage] = useState("몽글이와 소리숲을 깨워 볼까요?");
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [pickedConsonant, setPickedConsonant] = useState<string | null>(null);
  const [pickedVowel, setPickedVowel] = useState<string | null>(null);
  const [wrongTile, setWrongTile] = useState<string | null>(null);
  const [petals, setPetals] = useState(0);
  const [bestPetals, setBestPetals] = useState(0);

  const round = rounds[roundIndex];
  const progress = phase === "welcome" ? 0 : phase === "complete" ? 100 : (roundIndex / rounds.length) * 100 + (phase === "build" || phase === "celebrate" ? 12.5 : 0);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("malang-hangul-petals") ?? 0);
    setBestPetals(saved);
  }, []);

  const promptText = useMemo(() => {
    if (phase === "sound") return `‘${round.syllable}’로 시작하는 친구는 누구일까요?`;
    if (phase === "build") return `${round.consonant}과 ${round.vowel}를 찾아서 ‘${round.syllable}’를 만들어요.`;
    return message;
  }, [message, phase, round]);

  const replayPrompt = useCallback(() => {
    speak(promptText, soundOn);
  }, [promptText, soundOn]);

  const startGame = () => {
    setRoundIndex(0);
    setPetals(0);
    setPickedConsonant(null);
    setPickedVowel(null);
    setWrongChoice(null);
    setWrongTile(null);
    setPhase("sound");
    setMessage("귀를 쫑긋! 첫소리를 찾아봐요.");
    window.setTimeout(() => speak("가로 시작하는 친구는 누구일까요?", soundOn), 300);
  };

  const choosePicture = (word: string) => {
    if (word === round.word) {
      setWrongChoice(null);
      setMessage(`딩동댕! ${round.word}은 ‘${round.syllable}’로 시작해요.`);
      speak(`딩동댕! ${round.word}. ${round.syllable}로 시작해요.`, soundOn);
      window.setTimeout(() => {
        setPickedConsonant(null);
        setPickedVowel(null);
        setPhase("build");
        setMessage("이제 소리 조각을 합쳐 볼까요?");
      }, 900);
      return;
    }

    setWrongChoice(word);
    setMessage(`좋은 생각이야! ${round.syllable} 소리를 다시 들어볼까?`);
    speak(`${round.syllable}. 한 번 더 들어봐요.`, soundOn);
    window.setTimeout(() => setWrongChoice(null), 650);
  };

  const chooseTile = (tile: string, type: "consonant" | "vowel") => {
    const answer = type === "consonant" ? round.consonant : round.vowel;
    if (tile !== answer) {
      setWrongTile(`${type}-${tile}`);
      setMessage("통통! 다른 소리 조각도 살펴봐요.");
      speak("다른 소리 조각도 살펴봐요.", soundOn);
      window.setTimeout(() => setWrongTile(null), 550);
      return;
    }

    if (type === "consonant") setPickedConsonant(tile);
    if (type === "vowel") setPickedVowel(tile);
    setMessage(type === "consonant" ? `${tile}! 첫 조각을 찾았어요.` : `${tile}! 두 번째 조각을 찾았어요.`);
    speak(tile, soundOn);
  };

  const combine = () => {
    if (!pickedConsonant || !pickedVowel) return;
    const nextPetals = petals + 1;
    setPetals(nextPetals);
    setMessage(`${round.consonant}과 ${round.vowel}가 만나 ‘${round.syllable}’!`);
    setPhase("celebrate");
    speak(`${round.consonant}과 ${round.vowel}가 만나 ${round.syllable}. ${round.word}!`, soundOn);
  };

  const nextRound = () => {
    if (roundIndex === rounds.length - 1) {
      const completedPetals = Math.max(petals, rounds.length);
      setBestPetals((current) => Math.max(current, completedPetals));
      window.localStorage.setItem("malang-hangul-petals", String(Math.max(bestPetals, completedPetals)));
      setPhase("complete");
      setMessage("소리숲에 글자꽃이 활짝 피었어요!");
      speak("참 잘했어요! 소리숲에 글자꽃이 활짝 피었어요!", soundOn);
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
    window.setTimeout(() => speak(`${rounds[next].syllable}로 시작하는 친구는 누구일까요?`, soundOn), 250);
  };

  return (
    <main className="game-shell">
      <div className="sky-decoration" aria-hidden="true">
        <span className="cloud cloud--one" />
        <span className="cloud cloud--two" />
        <span className="sun">✦</span>
      </div>

      <header className="topbar">
        <button className="brand" onClick={() => setPhase("welcome")} aria-label="처음 화면으로 이동">
          <span className="brand__mark">ㅁ</span>
          <span><b>말랑한글</b><small>소리숲 탐험</small></span>
        </button>

        <div className="progress-wrap" aria-label={`탐험 진행률 ${Math.round(progress)}퍼센트`}>
          <div className="progress-label"><span>오늘의 탐험</span><b>{phase === "welcome" ? "준비!" : `${Math.min(roundIndex + 1, rounds.length)} / ${rounds.length}`}</b></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>

        <button
          className="sound-toggle"
          onClick={() => {
            setSoundOn((value) => !value);
            if (soundOn && typeof window !== "undefined") window.speechSynthesis?.cancel();
          }}
          aria-label={soundOn ? "소리 끄기" : "소리 켜기"}
          aria-pressed={soundOn}
        >
          <span aria-hidden="true">{soundOn ? "♫" : "—"}</span>
          {soundOn ? "소리 켜짐" : "소리 꺼짐"}
        </button>
      </header>

      {phase === "welcome" && (
        <section className="welcome-card">
          <div className="welcome-copy">
            <span className="eyebrow">오늘의 이야기</span>
            <h1>사라진 소리를 찾아<br /><em>글자꽃</em>을 피워요!</h1>
            <p>먹구름이 소리숲의 글자들을 숨겼대요.<br />몽글이와 함께 네 개의 소리를 되찾아 주세요.</p>
            <div className="mission-chips" aria-label="오늘 배울 글자">
              {rounds.map((item) => <span key={item.syllable}>{item.syllable}</span>)}
            </div>
            <button className="primary-button" onClick={startGame}>
              탐험 시작! <span aria-hidden="true">→</span>
            </button>
            <small className="play-note">약 5분 · 점수와 시간 제한이 없어요</small>
          </div>
          <div className="forest-scene" aria-label="구름 요정 몽글이가 있는 알록달록한 소리숲">
            <div className="scene-bubble">친구야,<br /><b>같이 가자!</b></div>
            <CloudBuddy mood="cheer" />
            <span className="tree tree--one"><i /><b>가</b></span>
            <span className="tree tree--two"><i /><b>나</b></span>
            <span className="tree tree--three"><i /><b>모</b></span>
            <span className="hill hill--back" />
            <span className="hill hill--front" />
            <span className="flower flower--one">✿</span>
            <span className="flower flower--two">✿</span>
            <span className="flower flower--three">✿</span>
          </div>
        </section>
      )}

      {(phase === "sound" || phase === "build") && (
        <section className="mission-layout">
          <aside className="guide-card">
            <div className="guide-badge">소리 {roundIndex + 1}</div>
            <CloudBuddy />
            <div className="speech-card">
              <p>{message}</p>
              <button onClick={replayPrompt} disabled={!soundOn}>
                <span aria-hidden="true">▶</span> 다시 듣기
              </button>
            </div>
            <div className="flower-shelf" aria-label={`모은 글자꽃 ${petals}개`}>
              {rounds.map((item, index) => (
                <span key={item.syllable} className={index < petals ? "is-grown" : ""}>
                  <i>✿</i><small>{index < petals ? item.syllable : "?"}</small>
                </span>
              ))}
            </div>
          </aside>

          <div className="play-card" style={{ "--round-color": round.color } as React.CSSProperties}>
            <div className="step-title">
              <span>{phase === "sound" ? "첫 번째 놀이" : "두 번째 놀이"}</span>
              <h2>{phase === "sound" ? <><em>‘{round.syllable}’</em>로 시작하는 친구는?</> : <><em>소리 조각</em>을 맞춰 보세요</>}</h2>
              <p>{phase === "sound" ? "그림을 콕 눌러 주세요" : `${round.consonant} + ${round.vowel} = 어떤 글자가 될까요?`}</p>
            </div>

            {phase === "sound" && (
              <div className="picture-choices">
                {round.choices.map((choice) => (
                  <button
                    key={choice.word}
                    onClick={() => choosePicture(choice.word)}
                    className={wrongChoice === choice.word ? "is-wrong" : ""}
                    aria-label={`${choice.word} 그림`}
                  >
                    <span>{choice.emoji}</span>
                    <b>{choice.word}</b>
                    <i aria-hidden="true">콕!</i>
                  </button>
                ))}
              </div>
            )}

            {phase === "build" && (
              <div className="builder">
                <div className="build-stage" aria-label="글자 조립판">
                  <div className={`letter-slot ${pickedConsonant ? "is-filled" : ""}`}>
                    {pickedConsonant ?? <span>자음</span>}
                  </div>
                  <span className="plus">+</span>
                  <div className={`letter-slot ${pickedVowel ? "is-filled" : ""}`}>
                    {pickedVowel ?? <span>모음</span>}
                  </div>
                  <span className="equals">=</span>
                  <div className={`letter-result ${pickedConsonant && pickedVowel ? "is-ready" : ""}`}>
                    {pickedConsonant && pickedVowel ? round.syllable : "?"}
                  </div>
                </div>

                <div className="tile-groups">
                  <div><span>자음 친구</span><div>
                    {round.consonantChoices.map((tile) => (
                      <button
                        key={tile}
                        className={`${pickedConsonant === tile ? "is-picked" : ""} ${wrongTile === `consonant-${tile}` ? "is-wrong" : ""}`}
                        onClick={() => chooseTile(tile, "consonant")}
                      >{tile}</button>
                    ))}
                  </div></div>
                  <div><span>모음 친구</span><div>
                    {round.vowelChoices.map((tile) => (
                      <button
                        key={tile}
                        className={`${pickedVowel === tile ? "is-picked" : ""} ${wrongTile === `vowel-${tile}` ? "is-wrong" : ""}`}
                        onClick={() => chooseTile(tile, "vowel")}
                      >{tile}</button>
                    ))}
                  </div></div>
                </div>

                <button className="combine-button" disabled={!pickedConsonant || !pickedVowel} onClick={combine}>
                  {pickedConsonant && pickedVowel ? "글자 합치기!" : "두 조각을 찾아 주세요"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {phase === "celebrate" && (
        <section className="celebrate-card" style={{ "--round-color": round.color } as React.CSSProperties}>
          <div className="confetti" aria-hidden="true">✦ <i>●</i> ✿ <b>▲</b> ✦ <i>●</i> ✿</div>
          <div className="word-flower">
            <span className="word-flower__petal word-flower__petal--one" />
            <span className="word-flower__petal word-flower__petal--two" />
            <span className="word-flower__petal word-flower__petal--three" />
            <span className="word-flower__petal word-flower__petal--four" />
            <b>{round.syllable}</b>
          </div>
          <span className="success-label">글자꽃이 피었어요!</span>
          <h2><em>{round.consonant}</em> + <em>{round.vowel}</em> = <strong>{round.syllable}</strong></h2>
          <div className="learned-word"><span>{round.emoji}</span><p><b>{round.word}</b><small>“{round.word}”의 첫 글자예요</small></p></div>
          <button className="primary-button" onClick={nextRound}>
            {roundIndex === rounds.length - 1 ? "소리숲으로 돌아가기" : "다음 소리 찾기"} <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      {phase === "complete" && (
        <section className="complete-card">
          <div className="complete-garden" aria-label="가, 나, 모, 사 글자꽃이 핀 정원">
            {rounds.map((item, index) => (
              <div className={`garden-flower garden-flower--${index + 1}`} key={item.syllable}>
                <i>✿</i><b>{item.syllable}</b>
              </div>
            ))}
            <CloudBuddy mood="cheer" />
          </div>
          <div className="complete-copy">
            <span className="eyebrow">오늘의 탐험 완료</span>
            <h1>소리숲이 다시<br /><em>말랑말랑!</em></h1>
            <p>가 · 나 · 모 · 사<br />네 개의 첫소리와 글자 조각을 찾았어요.</p>
            <div className="reward-ticket"><span>✿</span><p><small>오늘 피운 글자꽃</small><b>{rounds.length}송이</b></p></div>
            <button className="primary-button" onClick={startGame}>한 번 더 놀기 <span aria-hidden="true">↻</span></button>
            <button className="text-button" onClick={() => setPhase("welcome")}>처음 화면으로</button>
            {bestPetals > 0 && <small className="saved-note">이 기기에서 가장 많이 피운 꽃: {bestPetals}송이</small>}
          </div>
        </section>
      )}

      <p className="sr-only" aria-live="polite">{message}</p>
      <footer><span>말랑한글 연구소</span><p>아이의 속도로, 놀이처럼 천천히 배워요.</p></footer>
    </main>
  );
}
