import { useState } from "react";
import { Clock3, MapPin, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, Badge, Button, Field, Modal } from "../../components/ui";
import { useWorkspace } from "../../context/workspace";
import type { DialogState } from "../../context/dialogs";
import { DEMO_NOW } from "../../data/seed";
import { fullDate, meetingDate, meetingTime } from "../../lib/utils";
import type { Attendance } from "../../types";

export function MeetingDetail({
  id,
  close,
  open,
}: {
  id: string;
  close: () => void;
  open: (dialog: DialogState) => void;
}) {
  const { data, role, commit } = useWorkspace();
  const meeting = data.meetings.find((m) => m.id === id);
  const person = data.people.find((p) => p.id === meeting?.studentId);
  const [attendance, setAttendance] = useState<Attendance>(
    meeting?.attendance ?? "unrecorded",
  );
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [reason, setReason] = useState("");
  if (!meeting || !person) return null;
  const past =
    meetingDate(meeting).getTime() + meeting.duration * 60000 <=
    DEMO_NOW.getTime();
  const canManage = role === "tutor" || role === "officer";
  function cancel() {
    if (!reason.trim()) return;
    commit(
      (current) => ({
        ...current,
        meetings: current.meetings.map((m) =>
          m.id === id ? { ...m, status: "cancelled" } : m,
        ),
      }),
      "Cancelled a future meeting",
    );
    toast.success("Meeting cancelled. The original record is retained.");
    close();
  }
  return (
    <Modal
      open
      onOpenChange={close}
      title={meeting.title}
      description={`${fullDate(meeting.date, { weekday: "long", year: "numeric" })} · ${meetingTime(meeting)} · London time`}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Avatar name={person.name} color={person.color} />
          <div>
            <p className="text-sm font-semibold">{person.name}</p>
            <p className="mt-1 text-xs text-muted">
              {person.course} · Year {person.year}
            </p>
          </div>
          <div className="ml-auto">
            <Badge value={meeting.status} />
          </div>
        </div>
        <div className="space-y-3 rounded-xl bg-canvas p-4 text-sm">
          <p className="flex gap-3">
            <MapPin size={17} className="shrink-0 text-muted" />
            {meeting.location}
          </p>
          <p className="flex gap-3">
            <Clock3 size={17} className="text-muted" />
            {meeting.duration} minutes ·{" "}
            {meeting.kind === "online" ? "Online" : "In person"}
          </p>
          <p className="flex gap-3">
            <Users size={17} className="text-muted" />
            {data.tutors.find((t) => t.id === meeting.tutorId)?.name}
          </p>
        </div>
        {past &&
          canManage &&
          !["cancelled", "superseded", "tutor_unavailable"].includes(
            meeting.status,
          ) && (
            <div className="space-y-3">
              <Field label="Student attendance">
                <select
                  className="input"
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value as Attendance)}
                >
                  <option value="unrecorded">Not recorded</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  {role === "officer" && (
                    <option value="excused">Excused</option>
                  )}
                </select>
              </Field>
              <Button
                onClick={() => {
                  commit(
                    (c) => ({
                      ...c,
                      meetings: c.meetings.map((m) =>
                        m.id === id ? { ...m, status: "held", attendance } : m,
                      ),
                    }),
                    "Updated meeting attendance",
                  );
                  toast.success("Attendance updated in this preview");
                  close();
                }}
              >
                Save attendance
              </Button>
            </div>
          )}
        {role === "student" && (
          <Button
            variant="secondary"
            onClick={() => open({ type: "request", id })}
          >
            {past ? "Request an attendance correction" : "Request a change"}
          </Button>
        )}
        {cancelConfirm ? (
          <div className="space-y-3 border-t border-line pt-4">
            <Field label="Reason for cancellation">
              <textarea
                className="input min-h-20"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add a short operational reason"
                required
              />
            </Field>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setCancelConfirm(false)}
              >
                Keep meeting
              </Button>
              <Button
                variant="danger"
                disabled={!reason.trim()}
                onClick={cancel}
              >
                Confirm cancellation
              </Button>
            </div>
          </div>
        ) : (
          role === "tutor" &&
          !past &&
          meeting.status === "scheduled" && (
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => open({ type: "meeting-form", id })}>
                Edit / reschedule
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCancelConfirm(true)}
              >
                Cancel meeting
              </Button>
            </div>
          )
        )}
        {["tutor", "student"].includes(role) && (
          <Button
            variant="ghost"
            onClick={() => open({ type: "note", studentId: person.id })}
          >
            <Plus size={16} />
            Add a shared note
          </Button>
        )}
      </div>
    </Modal>
  );
}
