import type { TrainingContent } from "./types";
import en from "./en";
import hi from "./hi";
import mr from "./mr";
import gu from "./gu";
import pa from "./pa";
import ta from "./ta";
import te from "./te";
import kn from "./kn";
import ml from "./ml";

export type { TrainingContent, UIStrings } from "./types";

export const CONTENT: Record<string, TrainingContent> = {
  en,
  hi,
  mr,
  gu,
  pa,
  ta,
  te,
  kn,
  ml,
};

export const LANGUAGES = Object.entries(CONTENT).map(([code, c]) => ({
  code,
  label: c.label,
}));

export const getContent = (code: string): TrainingContent => CONTENT[code] ?? en;
