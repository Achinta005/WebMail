"use client";

import React, { useCallback, useRef } from "react";
import { useUiStore } from "@/stores/useUiStore";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ThreePanelLayoutProps {
  sidebar: React.ReactNode;
  messageList: React.ReactNode;
  readingPane: React.ReactNode;
}

const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 340;

function ResizeHandle({ onDrag }: { onDrag: (deltaX: number) => void }) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      lastX.current = e.clientX;

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = ev.clientX - lastX.current;
        lastX.current = ev.clientX;
        onDrag(delta);
      };

      const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [onDrag],
  );

  return (
    <div
      onMouseDown={onMouseDown}
      className="relative z-10 w-1 cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors flex-shrink-0 bg-border/40"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}

export function ThreePanelLayout({
  sidebar,
  messageList,
  readingPane,
}: ThreePanelLayoutProps) {
  const isMobile = useIsMobile();
  const mobilePanelView = useUiStore((s) => s.mobilePanelView);
  const sidebarWidth = useUiStore((s) => s.sidebarWidth);
  const setSidebarWidth = useUiStore((s) => s.setSidebarWidth);
  const isSidebarCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const selectedEmailId = useUiStore((s) => s.selectedEmailId);

  const handleSidebarDrag = useCallback(
    (delta: number) => {
      const current = useUiStore.getState().sidebarWidth;
      const next = Math.max(
        MIN_SIDEBAR_WIDTH,
        Math.min(MAX_SIDEBAR_WIDTH, current + delta),
      );
      setSidebarWidth(next);
    },
    [setSidebarWidth],
  );

  if (isMobile) {
    return (
      <div className="flex h-full w-full overflow-hidden bg-background pb-14 md:pb-0">
        {mobilePanelView === "sidebar" && (
          <div className="h-full w-full">{sidebar}</div>
        )}
        {mobilePanelView === "list" && (
          <div className="h-full w-full">{messageList}</div>
        )}
        {mobilePanelView === "reading" && (
          <div className="h-full w-full">{readingPane}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* 1. Left Sidebar Navigation (collapsible Gmail style) */}
      {!isSidebarCollapsed && (
        <>
          <div
            style={{ width: `${sidebarWidth}px` }}
            className="flex-shrink-0 h-full border-r border-border/60 bg-sidebar overflow-hidden flex flex-col transition-all duration-150"
          >
            {sidebar}
          </div>
          <ResizeHandle onDrag={handleSidebarDrag} />
        </>
      )}

      {/* 2. Main Content Area (Gmail style 2-pane view):
          Preserves MessageList in DOM with scroll position intact when reading email,
          displaying full-width Reading Pane when an email is selected */}
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col bg-background relative">
        <div className={`h-full w-full flex flex-col ${selectedEmailId ? "hidden" : "flex"}`}>
          {messageList}
        </div>
        {selectedEmailId && (
          <div className="h-full w-full flex flex-col">
            {readingPane}
          </div>
        )}
      </div>
    </div>
  );
}
