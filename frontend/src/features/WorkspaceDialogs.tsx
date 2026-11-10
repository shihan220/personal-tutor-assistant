import { Info } from "lucide-react";
import { Button, Modal } from "../components/ui";
import type { DialogState } from "../context/dialogs";
import { MeetingForm } from "./meetings/MeetingForm";
import { MeetingDetail } from "./meetings/MeetingDetail";
import { NoteForm } from "./notes/NoteForm";
import { PersonDetail } from "./people/PersonDetail";
import { ConcernForm } from "./concerns/ConcernForm";
import { RequestForm } from "./meetings/RequestForm";
import { RequestReview } from "./meetings/RequestReview";
import { AccountForm } from "./people/AccountForm";

type Props = {
  dialog: DialogState;
  close: () => void;
  open: (dialog: DialogState) => void;
};
export function WorkspaceDialogs({ dialog, close, open }: Props) {
  if (!dialog) return null;
  if (dialog.type === "meeting-form")
    return (
      <MeetingForm id={dialog.id} studentId={dialog.studentId} close={close} />
    );
  if (dialog.type === "meeting")
    return <MeetingDetail id={dialog.id!} close={close} open={open} />;
  if (dialog.type === "note")
    return (
      <NoteForm id={dialog.id} studentId={dialog.studentId} close={close} />
    );
  if (dialog.type === "person")
    return <PersonDetail id={dialog.id!} close={close} open={open} />;
  if (dialog.type === "concern")
    return (
      <ConcernForm id={dialog.id} studentId={dialog.studentId} close={close} />
    );
  if (dialog.type === "request")
    return <RequestForm id={dialog.id} close={close} />;
  if (dialog.type === "review-request")
    return <RequestReview id={dialog.id!} close={close} />;
  if (dialog.type === "account")
    return <AccountForm id={dialog.id} close={close} />;
  return (
    <Modal
      open
      onOpenChange={close}
      title="A little help, right here"
      description="Make the most of your personal tutoring workspace."
    >
      <div className="space-y-5">
        <div className="info-box">
          <Info size={19} className="shrink-0" />
          <p>
            This interactive design preview uses fictional people and saves
            changes in this browser. The role selector lets you explore each
            experience.
          </p>
        </div>
        {[
          [
            "Meetings",
            "Request or schedule a check-in, review details, and manage rescheduling.",
          ],
          [
            "Shared notes",
            "Keep a useful record together. Notes are visible to the student and their current tutor.",
          ],
          [
            "Attendance & support",
            "Review meeting attendance and follow up with practical support.",
          ],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
          </div>
        ))}
        <p className="text-xs leading-5 text-muted">
          For urgent wellbeing needs, use your university’s established support
          services. This workspace is for ordinary tutoring follow-up.
        </p>
        <Button onClick={close} className="w-full">
          Got it
        </Button>
      </div>
    </Modal>
  );
}
