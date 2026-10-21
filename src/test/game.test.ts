import { describe, expect, it } from "vitest";
import { chapters, drawQuestions, levelOf } from "@/lib/game";

describe("game rules", () => {
  it("has 12 chapters with 20 questions each", () => {
    expect(chapters.length).toBe(12);
    expect(chapters.every((c) => c.questions.length === 20)).toBe(true);
  });
  it("levels by question position", () => {
    expect(levelOf(7)).toBe("facil");
    expect(levelOf(8)).toBe("medio");
    expect(levelOf(15)).toBe("dificil");
  });
  it("draws only from selected chapters and level", () => {
    const qs = drawQuestions([3], "dificil", 20);
    expect(qs.length).toBe(6);
    expect(qs.every((q) => q.chapter === 3 && q.num >= 15)).toBe(true);
  });
});
