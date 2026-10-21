import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import stage from "@/assets/stage.jpg";
import { chapters, drawQuestions, LETTERS, type GameQ, type Level } from "@/lib/game";
import { speak, stopVoice } from "@/lib/voice";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Show do Conhecimento — Análise do Comportamento" },
      { name: "description", content: "Jogo de perguntas com 240 questões sobre Princípios Básicos de Análise do Comportamento, com apresentador narrado." },
      { property: "og:title", content: "Show do Conhecimento" },
      { property: "og:description", content: "240 perguntas por capítulo e nível, com apresentador narrado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const LEVELS: { id: Level; label: string }[] = [
  { id: "facil", label: "Fácil" },
  { id: "medio", label: "Médio" },
  { id: "dificil", label: "Difícil" },
  { id: "misto", label: "Misto" },
];

type Screen = "home" | "play" | "end";

function Index() {
  const [screen, setScreen] = useState<Screen>("home");
  const [sel, setSel] = useState<number[]>([1]);
  const [level, setLevel] = useState<Level>("misto");
  const [count, setCount] = useState(10);
  const [voiceOn, setVoiceOn] = useState(true);
  const [qs, setQs] = useState<GameQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [hidden, setHidden] = useState<number[]>([]);
  const [hint, setHint] = useState(false);
  const [used, setUsed] = useState({ cut: false, skip: false, hint: false });
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<GameQ[]>([]);

  const q = qs[idx];

  useEffect(() => {
    if (screen === "play" && q && voiceOn) {
      speak(q.id, `${q.q} ${q.o.map((o, i) => `${LETTERS[i]}: ${o}`).join(". ")}`);
    }
    return () => stopVoice();
  }, [screen, idx, q, voiceOn]);

  function start() {
    const drawn = drawQuestions(sel, level, count);
    if (!drawn.length) return;
    setQs(drawn);
    setIdx(0);
    setScore(0);
    setWrong([]);
    setUsed({ cut: false, skip: false, hint: false });
    resetQ();
    setScreen("play");
  }
  function resetQ() {
    setPicked(null);
    setRevealed(false);
    setHidden([]);
    setHint(false);
  }
  function confirm() {
    if (picked === null || !q) return;
    setRevealed(true);
    const ok = picked === q.a;
    if (ok) setScore((s) => s + 1);
    else setWrong((w) => [...w, q]);
    if (voiceOn) speak(ok ? "certo" : "errado", ok ? "Certa resposta!" : "Que pena, resposta errada.");
  }
  function next() {
    resetQ();
    if (idx + 1 >= qs.length) {
      setScreen("end");
      if (voiceOn) speak("fim", "Fim de rodada!");
    } else setIdx(idx + 1);
  }
  function cut() {
    if (!q) return;
    const wrongs = [0, 1, 2, 3, 4].filter((i) => i !== q.a).sort(() => Math.random() - 0.5);
    setHidden(wrongs.slice(0, 2));
    setUsed((u) => ({ ...u, cut: true }));
  }
  function skip() {
    if (!q) return;
    const pool = drawQuestions(sel, level, 999).filter((x) => !qs.some((y) => y.id === x.id));
    setUsed((u) => ({ ...u, skip: true }));
    if (pool[0]) {
      const copy = [...qs];
      copy[idx] = pool[0];
      setQs(copy);
      resetQ();
    } else next();
  }

  const ch = q ? chapters.find((c) => c.n === q.chapter) : undefined;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img src={stage} alt="" width={1024} height={1536} className="fixed inset-0 -z-10 h-full w-full object-cover opacity-70" />
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-4 py-6">
        <h1 className="text-center font-display text-5xl tracking-wide gold-text sm:text-6xl">Show do Conhecimento</h1>

        {screen === "home" && (
          <section className="glass flex flex-col gap-5 rounded-2xl p-5">
            <div>
              <h2 className="mb-2 font-display text-2xl text-primary">Capítulos</h2>
              <div className="mb-2 flex gap-2 text-sm">
                <button className="underline" onClick={() => setSel(chapters.map((c) => c.n))}>Todos</button>
                <button className="underline" onClick={() => setSel([])}>Nenhum</button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {chapters.map((c) => {
                  const on = sel.includes(c.n);
                  return (
                    <button
                      key={c.n}
                      onClick={() => setSel(on ? sel.filter((x) => x !== c.n) : [...sel, c.n])}
                      className={`rounded-lg border-2 px-3 py-2 text-left text-sm ${on ? "option-picked" : "bg-secondary"}`}
                    >
                      <b>{c.n}.</b> {c.title}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="mb-2 font-display text-2xl text-primary">Nível</h2>
              <div className="grid grid-cols-4 gap-2">
                {LEVELS.map((l) => (
                  <button key={l.id} onClick={() => setLevel(l.id)} className={`option px-2 py-2 ${level === l.id ? "option-picked" : ""}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                Perguntas:
                <select value={count} onChange={(e) => setCount(+e.target.value)} className="rounded bg-secondary px-2 py-1">
                  {[5, 10, 15, 20].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} /> Voz do apresentador
              </label>
            </div>
            <button disabled={!sel.length} onClick={start} className="option option-picked py-4 font-display text-3xl disabled:opacity-40">
              JOGAR
            </button>
          </section>
        )}

        {screen === "play" && q && (
          <section className="flex flex-col gap-4">
            <div className="flex justify-between font-display text-xl text-primary">
              <span>Pergunta {idx + 1}/{qs.length}</span>
              <span>Acertos: {score}</span>
            </div>
            <div className="glass rounded-2xl p-5 text-lg font-semibold">
              <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">Cap. {q.chapter} — {ch?.title}</p>
              {q.q}
              {hint && <p className="mt-3 text-sm text-primary">💡 Dica: conteúdo do capítulo {q.chapter}, páginas {ch?.pages} do livro.</p>}
            </div>
            <div className="flex flex-col gap-2">
              {q.o.map((o, i) => {
                if (hidden.includes(i)) return <div key={i} className="h-12" />;
                let cls = "";
                if (revealed && i === q.a) cls = "option-right";
                else if (revealed && i === picked) cls = "option-wrong";
                else if (i === picked) cls = "option-picked";
                return (
                  <button key={i} disabled={revealed} onClick={() => setPicked(i)} className={`option flex items-center gap-3 px-5 py-3 text-left ${cls}`}>
                    <span className="font-display text-2xl text-primary">{LETTERS[i]}</span> {o}
                  </button>
                );
              })}
            </div>
            {!revealed ? (
              <>
                <button disabled={picked === null} onClick={confirm} className="option option-picked py-3 font-display text-2xl disabled:opacity-40">
                  CONFIRMAR
                </button>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <button disabled={used.cut} onClick={cut} className="option py-2 disabled:opacity-30">✂ Eliminar 2</button>
                  <button disabled={used.skip} onClick={skip} className="option py-2 disabled:opacity-30">⏭ Pular</button>
                  <button disabled={used.hint} onClick={() => { setHint(true); setUsed((u) => ({ ...u, hint: true })); }} className="option py-2 disabled:opacity-30">💡 Dica</button>
                  <button onClick={() => speak(q.id, q.q)} className="option py-2">🔊 Repetir</button>
                </div>
              </>
            ) : (
              <div className="glass rounded-2xl p-4">
                <p className={`font-display text-2xl ${picked === q.a ? "text-success" : "text-destructive"}`}>
                  {picked === q.a ? "Certa resposta!" : `Errou! Correta: ${LETTERS[q.a]}) ${q.o[q.a]}`}
                </p>
                <p className="mt-1 text-sm">{q.o[q.a]}: {q.e}</p>
                <button onClick={next} className="option option-picked mt-3 w-full py-3 font-display text-2xl">PRÓXIMA</button>
              </div>
            )}
            <button onClick={() => { stopVoice(); setScreen("home"); }} className="text-sm underline opacity-70">Sair da partida</button>
          </section>
        )}

        {screen === "end" && (
          <section className="glass flex flex-col gap-4 rounded-2xl p-5 text-center">
            <p className="font-display text-6xl gold-text">{score}/{qs.length}</p>
            <p>{score === qs.length ? "Perfeito!" : score >= qs.length * 0.7 ? "Ótimo resultado!" : "Continue estudando!"}</p>
            {wrong.length > 0 && (
              <div className="text-left">
                <h2 className="mb-2 font-display text-2xl text-primary">Para revisar</h2>
                <ul className="flex flex-col gap-2 text-sm">
                  {wrong.map((w) => (
                    <li key={w.id} className="rounded-lg bg-secondary p-3">
                      {w.q}<br /><b className="text-success">{LETTERS[w.a]}) {w.o[w.a]}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={start} className="option option-picked py-3 font-display text-2xl">JOGAR DE NOVO</button>
            <button onClick={() => setScreen("home")} className="option py-3">Escolher capítulos</button>
          </section>
        )}
      </div>
    </main>
  );
}
