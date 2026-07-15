"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

function stripLeadingSlash(path: string): string {
  return path.replace(/^\/+/, "");
}

function getToolCallLabel(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;
  const path =
    typeof args?.path === "string" ? stripLeadingSlash(args.path) : undefined;

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":
        return path ? `Creating ${path}` : "Creating a file";
      case "str_replace":
      case "insert":
        return path ? `Editing ${path}` : "Editing a file";
      case "view":
        return path ? `Viewing ${path}` : "Viewing a file";
      case "undo_edit":
        return path ? `Undoing changes to ${path}` : "Undoing changes";
      default:
        return path ? `Working on ${path}` : "Editing files";
    }
  }

  if (toolName === "file_manager") {
    const newPath =
      typeof args?.new_path === "string"
        ? stripLeadingSlash(args.new_path)
        : undefined;
    switch (args?.command) {
      case "rename":
        return path && newPath
          ? `Renaming ${path} to ${newPath}`
          : "Renaming a file";
      case "delete":
        return path ? `Deleting ${path}` : "Deleting a file";
      default:
        return "Managing files";
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isComplete =
    toolInvocation.state === "result" && !!toolInvocation.result;
  const label = getToolCallLabel(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
