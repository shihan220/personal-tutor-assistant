import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { Avatar, Button, Modal } from "../../components/ui";
import { useWorkspace } from "../../context/workspace";
import type { DialogState } from "../../context/dialogs";
import { attendanceFor, visiblePeople } from "../../lib/utils";

export function PersonDetail({
  id,
  close,
  open,
}: {
  id: string;
  close: () => void;
  open: (dialog: DialogState) => void;
}) {
  const { data, role } = useWorkspace();
  const navigate = useNavigate();
  const person = visiblePeople(data, role).find((p) => p.id === id);
  if (!person) return null;
  const attendance = attendanceFor(data.meetings, id);
  return (
    <Modal
      open
      onOpenChange={close}
      title="Student profile"
      description="A little context for a more useful conversation."
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <Avatar name={person.name} color={person.color} size="lg" />
          <div>
            <h3 className="font-heading text-xl font-bold">{person.name}</h3>
            <p className="mt-1 text-sm text-muted">
              {person.course} · Year {person.year}
            </p>
            <a
              href={`mailto:${person.email}`}
              className="mt-1 block text-xs text-brand"
            >
              {person.email}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-small">
            <span>Cohort</span>
            <strong>{person.cohort}</strong>
          </div>
          <div className="stat-small">
            <span>Personal tutor</span>
            <strong className="text-sm!">
              {data.tutors.find((t) => t.id === person.tutorId)?.name ??
                "Not assigned"}
            </strong>
          </div>
          {role !== "admin" && (
            <>
              <div className="stat-small">
                <span>Meeting attendance</span>
                <strong>
                  {attendance.percent === null
                    ? "—"
                    : `${Math.round(attendance.percent)}%`}
                </strong>
              </div>
              <div className="stat-small">
                <span>Confirmed meetings</span>
                <strong>
                  {attendance.attended} / {attendance.total}
                </strong>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {role === "tutor" && (
            <>
              <Button
                onClick={() => open({ type: "meeting-form", studentId: id })}
              >
                <CalendarDays size={16} />
                Schedule meeting
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  close();
                  navigate(`/notes?student=${id}`);
                }}
              >
                View shared notes
              </Button>
              <Button
                variant="ghost"
                onClick={() => open({ type: "concern", studentId: id })}
              >
                Raise a concern
              </Button>
            </>
          )}
          {role === "officer" && (
            <Button onClick={() => open({ type: "concern", studentId: id })}>
              Raise a concern
            </Button>
          )}
          {role === "admin" && (
            <Button onClick={() => open({ type: "account", id })}>
              Edit student account
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
