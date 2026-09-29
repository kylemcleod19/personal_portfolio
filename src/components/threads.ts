// The three experimentation-loop threads, shared by the homepage loop and the writing index.
export type ThreadKey = "building" | "signals" | "practice";

export interface ThreadDef {
  key: ThreadKey;
  label: string;
  shortLabel: string;
  context: string;
}

export const THREADS: Record<ThreadKey, ThreadDef> = {
  building: {
    key: "building",
    label: "What I am building",
    shortLabel: "Building",
    context: "Real software, built with AI tools, to test whether the argument holds.",
  },
  signals: {
    key: "signals",
    label: "Industry signals and thoughts",
    shortLabel: "Signals",
    context: "What cheaper software does to moats, markets and who gets to build.",
  },
  practice: {
    key: "practice",
    label: "How I practice",
    shortLabel: "Practice",
    context: "How I scope, prompt, review and ship with AI tools, day to day.",
  },
};
