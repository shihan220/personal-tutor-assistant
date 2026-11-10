export type Role = "tutor" | "student" | "officer" | "admin";
export type Attendance =
  "present" | "late" | "absent" | "excused" | "unrecorded";
export type MeetingStatus =
  "scheduled" | "held" | "cancelled" | "superseded" | "tutor_unavailable";
export type CaseStatus =
  "awaiting_review" | "in_progress" | "escalated" | "resolved";
export interface Person {
  id: string;
  name: string;
  email: string;
  course: string;
  year: number;
  cohort: string;
  tutorId: string;
  active: boolean;
  color: string;
}
export interface Tutor {
  id: string;
  name: string;
  email: string;
}
export interface Meeting {
  id: string;
  studentId: string;
  tutorId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  kind: "in-person" | "online";
  required: boolean;
  status: MeetingStatus;
  attendance: Attendance;
}
export interface Note {
  id: string;
  studentId: string;
  meetingId: string;
  title: string;
  body: string;
  author: string;
  authorRole: Role;
  createdAt: string;
  revisions: number;
}
export interface Action {
  id: string;
  text: string;
  done: boolean;
}
export interface TimelineEntry {
  id: string;
  text: string;
  date: string;
}
export interface Concern {
  id: string;
  studentId: string;
  title: string;
  category: "Attendance" | "Academic support";
  status: CaseStatus;
  owner: string;
  dueDate: string;
  summary: string;
  studentSummary: string;
  actions: Action[];
  timeline: TimelineEntry[];
}
export interface Notification {
  id: string;
  title: string;
  body: string;
  role: Role;
  read: boolean;
  date: string;
  path: string;
}
export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  date: string;
}
export interface Profile {
  name: string;
  email: string;
  title: string;
}
export interface MeetingRequest {
  id: string;
  studentId: string;
  meetingId?: string;
  title: string;
  date: string;
  time: string;
  reason: string;
  kind: "meeting" | "reschedule" | "cancel" | "correction";
  status: "pending" | "accepted" | "declined";
  response: string;
}
export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "student">;
  cohort: string;
  active: boolean;
}
export interface Preferences {
  email: boolean;
  reminders: boolean;
  digest: boolean;
}
export interface DemoData {
  version: 1;
  people: Person[];
  tutors: Tutor[];
  meetings: Meeting[];
  notes: Note[];
  concerns: Concern[];
  notifications: Notification[];
  audit: AuditEvent[];
  requests: MeetingRequest[];
  staff: StaffAccount[];
  profiles: Record<Role, Profile>;
  preferences: Record<Role, Preferences>;
  rules: { threshold: number; minimum: number; consecutive: number };
}
