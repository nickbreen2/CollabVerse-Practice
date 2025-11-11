"use client";

import * as React from "react";
import HandleBar from "./HandleBar";
import { cn } from "@/lib/utils";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  handle?: string | null;
  right?: React.ReactNode;
  showHandleBar?: boolean;
  className?: string;
  badge?: React.ReactNode;
};

export default function DashboardHeader({
  title,
  subtitle,
  handle,
  right,
  showHandleBar = true,
  className,
  badge,
}: DashboardHeaderProps) {
  return (
    <div className={cn("sticky top-0 z-[100] bg-gray-50 dark:bg-gray-900 border-b", className)}>
      <div className="mx-auto w-full max-w-[1180px] px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{title}</h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="ml-auto w-full max-w-none sm:w-auto">
            {right !== undefined ? (
              right
            ) : showHandleBar && handle ? (
              <HandleBar handle={handle} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

