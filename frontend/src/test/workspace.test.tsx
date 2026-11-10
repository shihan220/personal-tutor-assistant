import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { createSeed } from "../data/seed";
import {
  attendanceFor,
  hasClash,
  visibleMeetings,
  visiblePeople,
} from "../lib/utils";
import { mockRepository } from "../services/mockRepository";

describe("Frontend view models", () => {
  it("handles confirmed, unknown, excused and cancelled outcomes without inventing absence", () => {
    const source = createSeed()
      .meetings.filter((m) => m.studentId === "s1" && m.status === "held")
      .slice(0, 4);
    const meetings = source.map((m, i) => ({
      ...m,
      attendance: ["present", "late", "absent", "unrecorded"][
        i
      ] as typeof m.attendance,
    }));
    expect(attendanceFor(meetings, "s1")).toMatchObject({
      attended: 2,
      total: 3,
      unknown: 1,
    });
    expect(attendanceFor(meetings, "s1").percent).toBeCloseTo(66.6667, 3);
    expect(
      attendanceFor(
        source.map((m) => ({ ...m, status: "cancelled" })),
        "s1",
      ).percent,
    ).toBeNull();
    expect(
      attendanceFor(
        source.map((m) => ({ ...m, attendance: "excused" })),
        "s1",
      ).total,
    ).toBe(0);
  });
  it("does not infer consecutive absences across an unknown outcome", () => {
    const source = createSeed()
      .meetings.filter((m) => m.studentId === "s1")
      .slice(0, 3);
    const sequence = source.map((m, i) => ({
      ...m,
      attendance: i === 1 ? ("unrecorded" as const) : ("absent" as const),
    }));
    expect(attendanceFor(sequence, "s1").consecutive).toBe(1);
    expect(
      attendanceFor(
        sequence.slice(1).map((m) => ({ ...m, attendance: "absent" })),
        "s1",
      ).consecutive,
    ).toBe(2);
  });
  it("blocks overlapping slots but permits back-to-back meetings", () => {
    const data = createSeed();
    const original = data.meetings.find((m) => m.id === "m1")!;
    expect(
      hasClash(data.meetings, { ...original, id: "new", time: "09:45" }),
    ).toBe(true);
    expect(
      hasClash(data.meetings, { ...original, id: "new", time: "10:00" }),
    ).toBe(false);
  });
  it("keeps each preview role scoped to its synthetic view", () => {
    const data = createSeed();
    expect(visiblePeople(data, "student").map((p) => p.id)).toEqual(["s1"]);
    expect(visiblePeople(data, "tutor")).toHaveLength(6);
    expect(visiblePeople(data, "officer").some((p) => p.cohort === "B")).toBe(
      false,
    );
    expect(visibleMeetings(data, "admin")).toEqual([]);
  });
  it("recovers from invalid saved mock data and round-trips valid changes", () => {
    localStorage.setItem("tutorly.frontend.v1", "{invalid");
    expect(mockRepository.load().people).toHaveLength(8);
    const data = createSeed();
    data.people[0].name = "Edited sample name";
    mockRepository.save(data);
    expect(mockRepository.load().people[0].name).toBe("Edited sample name");
  });
});

describe("Interactive frontend flows", () => {
  it("switches role navigation without exposing shared-note pages to officers", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Good morning, Sarah" }),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Preview role"), "student");
    expect(
      screen.getByRole("heading", { name: "Good morning, Emma" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "My students" }),
    ).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Preview role"), "officer");
    expect(
      screen.queryByRole("link", { name: "Shared notes" }),
    ).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Preview role"), "admin");
    expect(
      screen.getByRole("link", { name: "People & access" }),
    ).toBeInTheDocument();
  });
  it("validates a schedule conflict, then creates a meeting with a free slot", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Schedule a meeting" }),
    );
    const dialog = screen.getByRole("dialog");
    await user.clear(within(dialog).getByLabelText("Meeting title"));
    await user.type(
      within(dialog).getByLabelText("Meeting title"),
      "Frontend acceptance check-in",
    );
    await user.clear(within(dialog).getByLabelText("Start time · London"));
    await user.type(
      within(dialog).getByLabelText("Start time · London"),
      "09:30",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Schedule meeting" }),
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent("overlaps");
    await user.clear(within(dialog).getByLabelText("Start time · London"));
    await user.type(
      within(dialog).getByLabelText("Start time · London"),
      "15:00",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Schedule meeting" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      mockRepository
        .load()
        .meetings.some((m) => m.title === "Frontend acceptance check-in"),
    ).toBe(true);
  });
  it("lets a student request a meeting without creating a confirmed appointment", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Preview role"), "student");
    const original = mockRepository.load().meetings.length;
    await user.click(screen.getByRole("button", { name: "Request a meeting" }));
    const dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Anything your tutor should know?"),
      "I would like to talk about my project.",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Submit request" }),
    );
    expect(
      mockRepository
        .load()
        .requests.some((r) => r.studentId === "s1" && r.status === "pending"),
    ).toBe(true);
    expect(mockRepository.load().meetings).toHaveLength(original);
  });
  it("creates a shared note and keeps another author’s note read-only", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("link", { name: "Shared notes" }));
    await user.click(screen.getByRole("button", { name: "Add a shared note" }));
    let dialog = screen.getByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Title", { exact: true }),
      "A useful next step",
    );
    await user.type(
      within(dialog).getByLabelText("Your note"),
      "Break the assignment into three milestones.",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Save shared note" }),
    );
    expect(
      screen.getByRole("heading", { name: "A useful next step" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Things I would like to talk about/ }),
    );
    dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Your note")).toHaveAttribute(
      "readonly",
    );
    expect(
      within(dialog).queryByRole("button", { name: "Save changes" }),
    ).not.toBeInTheDocument();
  });
  it("requires follow-up actions to be completed before resolving a case", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Preview role"), "officer");
    await user.click(screen.getByRole("link", { name: /Follow-ups/ }));
    await user.click(
      screen.getByRole("button", {
        name: /A little extra support with attendance/,
      }),
    );
    const dialog = screen.getByRole("dialog");
    await user.selectOptions(
      within(dialog).getByLabelText("Status", { exact: true }),
      "resolved",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Save follow-up" }),
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "outstanding actions",
    );
    await user.click(
      within(dialog).getByRole("checkbox", {
        name: /Review attendance and any correction requests/,
      }),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Save follow-up" }),
    );
    expect(
      mockRepository.load().concerns.find((c) => c.id === "c1")?.status,
    ).toBe("resolved");
  });
  it("reflects an administrator’s reassignment in the tutor view", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Preview role"), "admin");
    await user.click(screen.getByRole("link", { name: "Tutor assignments" }));
    await user.click(
      screen.getAllByRole("button", { name: "Change tutor" })[0],
    );
    const dialog = screen.getByRole("dialog");
    await user.selectOptions(
      within(dialog).getByLabelText("Personal tutor"),
      "t2",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Save account" }),
    );
    await user.selectOptions(screen.getByLabelText("Preview role"), "tutor");
    await user.click(screen.getByRole("link", { name: "My students" }));
    expect(
      screen.queryByRole("button", { name: "View Emma Wilson" }),
    ).not.toBeInTheDocument();
  });
  it("provides a complete preview recovery state without an authentication service", async () => {
    window.history.replaceState({}, "", "/login");
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Forgot your password?" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Preview recovery confirmation" }),
    );
    expect(
      screen.getByRole("heading", { name: "Recovery screen preview" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/doesn’t send email or change passwords/),
    ).toBeInTheDocument();
  });
});
