import { createContext, useContext } from "react";
export type DialogState = {
  type:
    | "meeting"
    | "meeting-form"
    | "note"
    | "person"
    | "concern"
    | "request"
    | "review-request"
    | "account"
    | "help";
  id?: string;
  studentId?: string;
} | null;
interface DialogActions {
  open: (dialog: DialogState) => void;
  close: () => void;
}
export const DialogContext = createContext<DialogActions | null>(null);

export function useDialogs() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("DialogProvider is required");
  return context;
}
