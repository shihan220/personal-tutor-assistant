import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "../types";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}
export const navigation: Record<Role, NavItem[]> = {
  tutor: [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/meetings", label: "Meetings", icon: CalendarDays },
    { path: "/students", label: "My students", icon: Users },
    { path: "/attendance", label: "Attendance", icon: GraduationCap },
    { path: "/notes", label: "Shared notes", icon: BookOpen },
    { path: "/follow-ups", label: "Follow-ups", icon: ClipboardList },
  ],
  student: [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/meetings", label: "My meetings", icon: CalendarDays },
    { path: "/attendance", label: "My attendance", icon: GraduationCap },
    { path: "/notes", label: "Shared notes", icon: BookOpen },
    { path: "/follow-ups", label: "My support plan", icon: ShieldCheck },
  ],
  officer: [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/meetings", label: "Meetings", icon: CalendarDays },
    { path: "/students", label: "Students", icon: Users },
    { path: "/attendance", label: "Attendance", icon: GraduationCap },
    { path: "/follow-ups", label: "Follow-ups", icon: ClipboardList },
    { path: "/rules", label: "Attendance rules", icon: Settings2 },
  ],
  admin: [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/people", label: "People & access", icon: Users },
    { path: "/assignments", label: "Tutor assignments", icon: GraduationCap },
    { path: "/audit", label: "Workspace activity", icon: ShieldCheck },
  ],
};
