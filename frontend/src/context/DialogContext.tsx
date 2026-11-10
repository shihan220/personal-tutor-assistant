import { useState, type ReactNode } from "react";
import { DialogContext, type DialogState } from "./dialogs";
import { WorkspaceDialogs } from "../features/WorkspaceDialogs";
export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>(null);
  return (
    <DialogContext.Provider
      value={{ open: setDialog, close: () => setDialog(null) }}
    >
      {children}
      <WorkspaceDialogs
        key={`${dialog?.type}-${dialog?.id}-${dialog?.studentId}`}
        dialog={dialog}
        close={() => setDialog(null)}
        open={setDialog}
      />
    </DialogContext.Provider>
  );
}
