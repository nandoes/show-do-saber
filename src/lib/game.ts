import data from "@/data/questions.json";

export type Question = { q: string; o: string[]; a: number; e: string };
export type Chapter = { n: number; title: string; pages: string; questions: Question[] };
export type Level = "facil" | "medio" | "dificil" | "misto";
export type GameQ = Question & { id: string; chapter: number; num: number };

export const chapters = data as Chapter[];
export const LETTERS = ["A", "B", "C", "D", "E"];

/** Level is defined by the question's position inside its chapter (1–7 fácil, 8–14 médio, 15–20 difícil). */
export function levelOf(num: number): Exclude<Level, "misto"> {
  return num <= 7 ? "facil" : num <= 14 ? "medio" : "dificil";
}

export function drawQuestions(chs: number[], level: Level, count: number, rnd = Math.random): GameQ[] {
  const pool: GameQ[] = [];
  for (const c of chapters) {
    if (!chs.includes(c.n)) continue;
    c.questions.forEach((q, i) => {
      const num = i + 1;
      if (level === "misto" || levelOf(num) === level) pool.push({ ...q, id: `c${c.n}q${num}`, chapter: c.n, num });
    });
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}
