import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Field, Modal } from "../../components/ui";
import { useWorkspace } from "../../context/workspace";
import { CURRENT_TUTOR } from "../../data/seed";
import { fullDate, hasClash, uid } from "../../lib/utils";
import type { Attendance, Meeting } from "../../types";

export function RequestReview({
  id,
  close,
}: {
  id: string;
  close: () => void;
}) {
  const { data, role, commit } = useWorkspace();
  const request = data.requests.find((r) => r.id === id);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("present");
  if (!request) return null;
  const person = data.people.find((p) => p.id === request.studentId);
  const canReview =
    (role === "officer" && request.kind === "correction") ||
    (role === "tutor" && request.kind !== "correction");
  function decide(accepted: boolean) {
    if (!response.trim())
      return setError("Add a short explanation for your decision.");
    const original = data.meetings.find((m) => m.id === request!.meetingId);
    let candidate: Meeting | undefined;
    if (accepted && ["meeting", "reschedule"].includes(request!.kind)) {
      candidate = {
        id: uid(),
        studentId: request!.studentId,
        tutorId: person?.tutorId ?? CURRENT_TUTOR,
        title: request!.title,
        date: request!.date,
        time: request!.time,
        duration: original?.duration ?? 30,
        location: original?.location ?? "Mercantile House · Room 2.14",
        kind: original?.kind ?? "in-person",
        status: "scheduled",
        attendance: "unrecorded",
        required: true,
      };
      if (hasClash(data.meetings, candidate, original?.id))
        return setError(
          "This requested slot conflicts with another appointment. Decline with an alternative or change the existing schedule first.",
        );
    }
    commit(
      (c) => ({
        ...c,
        requests: c.requests.map((r) =>
          r.id === id
            ? { ...r, status: accepted ? "accepted" : "declined", response }
            : r,
        ),
        meetings: accepted
          ? [
              ...c.meetings.map((m) =>
                m.id !== request!.meetingId
                  ? m
                  : request!.kind === "correction"
                    ? { ...m, attendance, status: "held" as const }
                    : {
                        ...m,
                        status:
                          request!.kind === "cancel"
                            ? ("cancelled" as const)
                            : ("superseded" as const),
                      },
              ),
              ...(candidate ? [candidate] : []),
            ]
          : c.meetings,
      }),
      `${accepted ? "Accepted" : "Declined"} a ${request!.kind} request`,
    );
    toast.success(
      accepted ? "Request accepted and preview updated" : "Decision saved",
    );
    close();
  }
  return (
    <Modal
      open
      onOpenChange={close}
      title={
        request.kind === "correction"
          ? "Review attendance correction"
          : "Meeting request"
      }
      description={`${person?.name} · ${request.kind}`}
    >
      <div className="space-y-4">
        <Badge value={request.status} />
        <h3 className="font-semibold">{request.title}</h3>
        <div className="rounded-xl bg-canvas p-4 text-sm leading-7">
          <p>{request.reason}</p>
          {request.kind !== "correction" && (
            <p className="mt-2 font-medium">
              Requested: {fullDate(request.date)} at {request.time}
            </p>
          )}
        </div>
        {request.status !== "pending" && (
          <p className="text-sm leading-6 text-muted">
            Decision: {request.response}
          </p>
        )}
        {canReview && request.status === "pending" && (
          <>
            {request.kind === "correction" && (
              <Field label="Corrected attendance">
                <select
                  className="input"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value as Attendance)}
                >
                  {["present", "late", "absent", "excused"].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Decision explanation">
              <textarea
                className="input min-h-24"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                required
              />
            </Field>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="dialog-actions">
              <Button variant="secondary" onClick={() => decide(false)}>
                Decline request
              </Button>
              <Button onClick={() => decide(true)}>
                <Check size={16} />
                Accept request
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
