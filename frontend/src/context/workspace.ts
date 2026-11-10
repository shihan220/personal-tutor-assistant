import { createContext, useContext } from "react";
import type { DemoData, Role } from "../types";
export interface Workspace {
  data: DemoData;
  role: Role;
  setRole: (role: Role) => void;
  commit: (update: (current: DemoData) => DemoData, action?: string) => void;
  reset: () => void;
}
export const WorkspaceContext = createContext<Workspace | null>(null);
export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("WorkspaceProvider is required");
  return value;
}
