import { useEffect, useState, type ReactNode } from "react";
import { WorkspaceContext, type Workspace } from "./workspace";
import { toast } from "sonner";
import { mockRepository } from "../services/mockRepository";
import { ROLE_LABELS } from "../data/seed";
import { uid } from "../lib/utils";
import type { Role } from "../types";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => mockRepository.load());
  const [role, setRole] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem("tutorly.preview-role");
      return ["tutor", "student", "officer", "admin"].includes(saved ?? "")
        ? (saved as Role)
        : "tutor";
    } catch {
      return "tutor";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("tutorly.preview-role", role);
    } catch {
      /* Preview still works in memory when storage is unavailable. */
    }
  }, [role]);
  useEffect(() => {
    try {
      mockRepository.save(data);
    } catch {
      toast.error(
        "Your browser could not save changes. Keep this tab open or free some storage.",
      );
    }
  }, [data]);
  const commit: Workspace["commit"] = (update, action) => {
    setData((current) => {
      const next = update(current);
      return action
        ? {
            ...next,
            audit: [
              {
                id: uid(),
                actor: current.profiles[role].name || ROLE_LABELS[role],
                action,
                date: new Date().toISOString(),
              },
              ...next.audit,
            ],
          }
        : next;
    });
  };
  return (
    <WorkspaceContext.Provider
      value={{
        data,
        role,
        setRole,
        commit,
        reset: () => {
          setData(mockRepository.reset());
          toast.success("Sample workspace restored");
        },
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
