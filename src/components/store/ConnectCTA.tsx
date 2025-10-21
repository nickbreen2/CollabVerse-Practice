"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  avatarUrl?: string;
  displayName?: string;
  isEditMode?: boolean;
  theme?: "LIGHT" | "DARK";
  onConnect?: () => void;
  className?: string;
};

export default function ConnectCTA({ 
  avatarUrl, 
  displayName, 
  isEditMode = false,
  theme = "DARK",
  onConnect, 
  className 
}: Props) {
  // In edit mode: don't render the button at all
  if (isEditMode) {
    return null;
  }
  
  // In preview mode: button with gradient scrim, sticky to scroll container
  return (
    <div 
      className={cn(
        "sticky bottom-0 w-full pointer-events-none z-30 -mt-32",
        className
      )}
    >
      {/* Gradient scrim/shadow - extends to actual bottom */}
      <div 
        className={cn(
          "absolute inset-x-0 -bottom-8 h-40 pointer-events-none",
          theme === "LIGHT" 
            ? "bg-gradient-to-t from-white via-white/95 to-transparent"
            : "bg-gradient-to-t from-black via-black/95 to-transparent"
        )}
        aria-hidden="true"
      />
      
      {/* Button */}
      <div className="relative px-4 pb-4 pointer-events-auto">
        <div className="max-w-72 mx-auto">
          <Button
            onClick={onConnect}
            variant={theme === "LIGHT" ? "default" : "secondary"}
            className={cn(
              "w-full h-14 rounded-full px-4",
              "text-sm font-semibold",
              "flex items-center justify-center gap-2",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-200 hover:scale-[1.02]",
              theme === "DARK" && "bg-white hover:bg-gray-100 text-gray-900 shadow-white/10"
            )}
            size="lg"
          >
            {/* Label */}
            <span>Collab with</span>
            
            {/* Avatar */}
            <span className={cn(
              "relative inline-flex h-6 w-6 overflow-hidden rounded-full ring-2",
              theme === "LIGHT" ? "ring-white/20" : "ring-gray-900/20"
            )}>
              <span className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 to-indigo-500" aria-hidden />
              {avatarUrl ? (
                <Image 
                  alt={displayName || "Profile"} 
                  src={avatarUrl} 
                  fill 
                  className="object-cover" 
                />
              ) : null}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

