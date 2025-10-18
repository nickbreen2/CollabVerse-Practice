"use client";

import * as React from "react";
import { Search, User, Link2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import PersonalInfoSection from "./PersonalInfoSection";
import ConnectedAccountsSection from "./ConnectedAccountsSection";
import DangerZoneSection from "./DangerZoneSection";

type Section = "personal-info" | "connected-accounts" | "pause-delete";

interface SettingsSectionItem {
  id: Section;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const sections: SettingsSectionItem[] = [
  {
    id: "personal-info",
    label: "Personal Info",
    icon: User,
    keywords: ["personal", "info", "name", "username", "birth", "date", "location", "email", "password", "login"],
  },
  {
    id: "connected-accounts",
    label: "Connected Accounts",
    icon: Link2,
    keywords: ["connected", "accounts", "integrations", "oauth", "google", "facebook"],
  },
  {
    id: "pause-delete",
    label: "Pause / Delete",
    icon: AlertTriangle,
    keywords: ["pause", "delete", "danger", "account", "deactivate", "remove"],
  },
];

interface SettingsShellProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    birthDate: Date | null;
    accountStatus: string;
    scheduledDeletionAt: Date | null;
    store: {
      handle: string;
      displayName: string | null;
      location: string | null;
    } | null;
  };
}

export default function SettingsShell({ user }: SettingsShellProps) {
  const [activeSection, setActiveSection] = React.useState<Section>("personal-info");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(
      (section) =>
        section.label.toLowerCase().includes(query) ||
        section.keywords.some((keyword) => keyword.includes(query))
    );
  }, [searchQuery]);

  const renderSection = () => {
    switch (activeSection) {
      case "personal-info":
        return <PersonalInfoSection user={user} />;
      case "connected-accounts":
        return <ConnectedAccountsSection />;
      case "pause-delete":
        return <DangerZoneSection user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile header */}
      <div className="lg:hidden border-b bg-white dark:bg-gray-950 px-4 py-3">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="flex h-full">
        {/* Left navigation - Desktop */}
        <aside className="hidden lg:flex w-80 flex-col border-r bg-white dark:bg-gray-950 h-full">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile navigation sheet trigger */}
        <div className="lg:hidden fixed bottom-4 left-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
          >
            Sections
          </button>
        </div>

        {/* Mobile navigation overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-xl p-4 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Right content panel */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl p-6 lg:p-8">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
}

