"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface Provider {
  id: string;
  name: string;
  description: string;
  avatarColor: string;
  initial: string;
}

const providers: Provider[] = [
  {
    id: "google",
    name: "Google",
    description: "Connect your Google account",
    avatarColor: "bg-red-500",
    initial: "G",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Connect your Facebook account",
    avatarColor: "bg-blue-600",
    initial: "F",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    description: "Connect your Twitter account",
    avatarColor: "bg-black dark:bg-white",
    initial: "X",
  },
  {
    id: "github",
    name: "GitHub",
    description: "Connect your GitHub account",
    avatarColor: "bg-gray-800",
    initial: "G",
  },
];

export default function ConnectedAccountsSection() {
  const handleAction = () => {
    toast({
      title: "Coming Soon",
      description: "Connected Accounts will be enabled once integrations are available.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-950 rounded-lg border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Connected Accounts</h2>
          <p className="text-sm text-muted-foreground">
            Link your accounts for easier sign-in and integrations
          </p>
        </div>

        <div className="space-y-3">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full ${provider.avatarColor} flex items-center justify-center text-white font-semibold`}
                >
                  {provider.initial}
                </div>
                <div>
                  <p className="text-sm font-medium">{provider.name}</p>
                  <p className="text-xs text-muted-foreground">{provider.description}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAction}
                className="opacity-60"
              >
                Connect
              </Button>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> You'll be able to link accounts here once integrations are
            live. Disconnecting won't be possible until integrations are fully implemented.
          </p>
        </div>
      </div>
    </div>
  );
}

