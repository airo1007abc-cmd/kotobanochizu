import type { Quiz } from "./domain";
export const isCorrectAnswer = (question: Quiz, choice: number) =>
  question.answer === choice;
export const resultMessage = (score: number, total: number) => {
  const ratio = total ? score / total : 0;
  return ratio >= 0.8
    ? "ことば旅の達人！"
    : ratio >= 0.5
      ? "地域の響きが見えてきた！"
      : "知らないことばとの出会い！";
};
