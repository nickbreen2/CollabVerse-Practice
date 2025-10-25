"use client";

import * as React from "react";
import { useMemo } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, ExternalLink } from "lucide-react";

type Props = {
  handle: string | null | undefined;
  className?: string;
};

export default function HandleBar({ handle, className }: Props) {
  const publicPath = useMemo(() => {
    const h = (handle ?? "").trim();
    return h ? `collabl.ink/${h}` : "collabl.ink/…";
  }, [handle]);

  const fullOpenUrl = useMemo(() => {
    // Use window.location.origin for the base URL to ensure correct port
    const base = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    return `${base.replace(/\/+$/, "")}/${(handle ?? "").trim()}`;
  }, [handle]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`https://${publicPath}`);
      toast({ 
        title: "Link copied", 
        description: `https://${publicPath}` 
      });
    } catch {
      toast({ 
        variant: "destructive",
        title: "Couldn't copy", 
        description: "Select and copy manually." 
      });
    }
  };

  const openInNewTab = () => {
    window.open(fullOpenUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/90",
        "max-sm:w-full max-sm:justify-between",
        className
      )}
      aria-label="Public profile link"
    >
      <div className="flex items-center gap-2">
        <div className="whitespace-nowrap rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-medium dark:border-neutral-700">
          {publicPath}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={copyToClipboard}
          aria-label="Copy link"
          className="h-8 gap-1.5"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <Button
          size="sm"
          onClick={openInNewTab}
          aria-label="Open link in new tab"
          className="h-8 gap-1.5"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </Button>
      </div>
    </div>
  );
}

