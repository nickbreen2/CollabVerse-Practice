"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, Clock, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DangerZoneSectionProps {
  user: {
    id: string;
    accountStatus: string;
    scheduledDeletionAt: Date | null;
  };
}

export default function DangerZoneSection({ user: initialUser }: DangerZoneSectionProps) {
  const [user, setUser] = React.useState(initialUser);
  const [pauseDialogOpen, setPauseDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const accountStatus = user.accountStatus;
  const isPaused = accountStatus === "PAUSED";
  const isPendingDeletion = accountStatus === "PENDING_DELETION";
  const scheduledDeletionAt = user.scheduledDeletionAt
    ? new Date(user.scheduledDeletionAt)
    : null;

  // Calculate days remaining
  const daysRemaining = React.useMemo(() => {
    if (!scheduledDeletionAt) return null;
    const now = new Date();
    const diff = scheduledDeletionAt.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }, [scheduledDeletionAt]);

  const handlePauseAccount = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/settings/pause-account", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to pause account");
      }

      const data = await response.json();
      setUser((prev) => ({ ...prev, accountStatus: data.accountStatus }));

      toast({
        title: "Account Paused",
        description: "Your account has been paused. Sign in again to reactivate.",
      });

      setPauseDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to pause account",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateAccount = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/settings/reactivate-account", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to reactivate account");
      }

      const data = await response.json();
      setUser((prev) => ({ ...prev, accountStatus: data.accountStatus }));

      toast({
        title: "Account Reactivated",
        description: "Welcome back! Your account is now active.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reactivate account",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      toast({
        variant: "destructive",
        title: "Password Required",
        description: "Please enter your password to confirm",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to schedule account deletion");
      }

      setUser((prev) => ({
        ...prev,
        accountStatus: data.accountStatus,
        scheduledDeletionAt: data.scheduledDeletionAt,
      }));

      toast({
        title: "Deletion Scheduled",
        description: "Your account will be deleted in 30 days. You can cancel anytime.",
      });

      setDeleteDialogOpen(false);
      setPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to schedule deletion",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelDeletion = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/settings/cancel-deletion", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel deletion");
      }

      const data = await response.json();
      setUser((prev) => ({
        ...prev,
        accountStatus: data.accountStatus,
        scheduledDeletionAt: null,
      }));

      toast({
        title: "Deletion Canceled",
        description: "Your account is safe. Deletion has been canceled.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel deletion",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-950 rounded-lg border border-red-200 dark:border-red-900 p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1 text-red-900 dark:text-red-100">
              Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your account status and deletion
            </p>
          </div>
        </div>

        {/* Paused State Banner */}
        {isPaused && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                Account Paused
              </p>
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
              Your storefront is hidden and you cannot receive new collaboration requests.
            </p>
            <Button
              onClick={handleReactivateAccount}
              disabled={isProcessing}
              size="sm"
              variant="outline"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reactivate Account
            </Button>
          </div>
        )}

        {/* Pending Deletion State */}
        {isPendingDeletion && scheduledDeletionAt && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="font-semibold text-red-900 dark:text-red-100">
                Scheduled for Deletion
              </p>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200 mb-1">
              Your account will be permanently deleted in{" "}
              <strong>{daysRemaining} days</strong> (
              {scheduledDeletionAt.toLocaleDateString()}).
            </p>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              During this time, your account is deactivated. You can cancel deletion anytime
              before the deadline.
            </p>
            <Button
              onClick={handleCancelDeletion}
              disabled={isProcessing}
              size="sm"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Deletion
            </Button>
          </div>
        )}

        {/* Normal State - Show Actions */}
        {!isPendingDeletion && (
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-2 pb-4">
              <h3 className="text-xl font-semibold">
                Are you sure you want to delete your account?
              </h3>
              <div className="space-y-1 text-muted-foreground">
                <p className="text-sm">Your account will be deactivated for 30 days.</p>
                <p className="text-sm">
                  After 30 days, your account will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!isPaused && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setPauseDialogOpen(true)}
                    className="sm:min-w-[140px]"
                  >
                    Pause Account
                  </Button>

                  <Button
                    onClick={() => setDeleteDialogOpen(true)}
                    className="sm:min-w-[140px] bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
                  >
                    Delete Account
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pause Account Dialog */}
      <Dialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <DialogContent className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pause Account</DialogTitle>
            <DialogDescription>
              Your storefront will be hidden and you won't receive new collaboration requests.
              You can reactivate your account anytime by signing in again.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePauseAccount} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pause Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action will schedule your account for deletion in 30 days. During this time,
              your account will be deactivated. You can cancel the deletion anytime before the
              deadline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
              <p className="text-sm text-red-900 dark:text-red-100">
                <strong>Warning:</strong> After 30 days, all your data will be permanently
                deleted and cannot be recovered.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Confirm Password</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isProcessing || !password}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

