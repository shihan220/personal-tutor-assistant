import { createSeed } from "../data/seed";
import type { DemoData } from "../types";

// Browser-only adapter. Replace this boundary after a Flask API contract is agreed.
// This is neither authentication nor a security boundary. All bundled records are synthetic.
const STORAGE_KEY = "tutorly.frontend.v1";
export const mockRepository = {
  load(): DemoData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createSeed();
      const data = JSON.parse(raw) as DemoData;
      if (
        data.version !== 1 ||
        ![
          "people",
          "tutors",
          "meetings",
          "notes",
          "concerns",
          "notifications",
          "audit",
          "requests",
          "staff",
        ].every((key) => Array.isArray(data[key as keyof DemoData])) ||
        !data.profiles ||
        !data.preferences ||
        !data.rules
      )
        return createSeed();
      if (
        !data.people.every(
          (p) => typeof p.name === "string" && typeof p.id === "string",
        ) ||
        !data.concerns.every(
          (c) => Array.isArray(c.actions) && Array.isArray(c.timeline),
        )
      )
        return createSeed();
      return data;
    } catch {
      return createSeed();
    }
  },
  save(data: DemoData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    return createSeed();
  },
};
