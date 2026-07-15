import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

test("ToolCallBadge shows friendly label for creating a file", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/components/Card.jsx" },
    state: "result",
    result: "Success",
  };

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating src/components/Card.jsx")).toBeDefined();
});

test("ToolCallBadge shows friendly label and spinner while editing is in progress", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "src/components/Card.jsx" },
    state: "call",
  };

  const { container } = render(
    <ToolCallBadge toolInvocation={toolInvocation} />
  );

  expect(screen.getByText("Editing src/components/Card.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolCallBadge strips the leading slash from virtual file system paths", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "10",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "Success",
  };

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(screen.queryByText("Creating /App.jsx")).toBeNull();
});

test("ToolCallBadge shows friendly label for insert command", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "3",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "src/App.jsx" },
    state: "result",
    result: "Success",
  };

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Editing src/App.jsx")).toBeDefined();
});

test("ToolCallBadge shows friendly label for viewing a file", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "view", path: "src/App.jsx" },
    state: "result",
    result: "file contents",
  };

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Viewing src/App.jsx")).toBeDefined();
});

test("ToolCallBadge falls back to a generic message when args are missing", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "5",
    toolName: "str_replace_editor",
    args: {},
    state: "result",
    result: "Success",
  };

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Editing files")).toBeDefined();
});

test("ToolCallBadge shows friendly label for renaming a file", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "6",
    toolName: "file_manager",
    args: {
      command: "rename",
      path: "src/Old.jsx",
      new_path: "src/New.jsx",
    },
    state: "result",
    result: "Success",
  };

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(
    screen.getByText("Renaming src/Old.jsx to src/New.jsx")
  ).toBeDefined();
});

test("ToolCallBadge shows friendly label for deleting a file", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "7",
    toolName: "file_manager",
    args: { command: "delete", path: "src/Unused.jsx" },
    state: "result",
    result: "Success",
  };

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("Deleting src/Unused.jsx")).toBeDefined();
});

test("ToolCallBadge shows green dot once the tool call has a result", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "8",
    toolName: "file_manager",
    args: { command: "delete", path: "src/Unused.jsx" },
    state: "result",
    result: "Success",
  };

  const { container } = render(
    <ToolCallBadge toolInvocation={toolInvocation} />
  );

  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallBadge falls back to the raw tool name for unrecognized tools", () => {
  const toolInvocation: ToolInvocation = {
    toolCallId: "9",
    toolName: "some_future_tool",
    args: { command: "do_something", path: "src/App.jsx" },
    state: "result",
    result: "Success",
  };

  render(<ToolCallBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("some_future_tool")).toBeDefined();
});
