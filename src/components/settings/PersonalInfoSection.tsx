"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Mail, Key, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PersonalInfoSectionProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    birthDate: Date | null;
    store: {
      handle: string;
      displayName: string | null;
    } | null;
  };
}

export default function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  // About You state
  const [displayName, setDisplayName] = React.useState(user.store?.displayName || "");
  const [username, setUsername] = React.useState(user.store?.handle || "");
  const [birthDate, setBirthDate] = React.useState(
    user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : ""
  );
  const [isCheckingUsername, setIsCheckingUsername] = React.useState(false);
  const [usernameError, setUsernameError] = React.useState("");
  const [usernameAvailable, setUsernameAvailable] = React.useState<boolean | null>(null);
  const [birthDateError, setBirthDateError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);

  // Email change state
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState("");
  const [emailVerificationSent, setEmailVerificationSent] = React.useState(false);

  // Password change state
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  // Track if form is dirty
  React.useEffect(() => {
    const hasChanges =
      displayName !== (user.store?.displayName || "") ||
      username !== (user.store?.handle || "") ||
      birthDate !== (user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "");
    setIsDirty(hasChanges);
  }, [displayName, username, birthDate, user]);

  // Username validation and uniqueness check
  const checkUsername = React.useCallback(
    async (value: string) => {
      // Reset states
      setUsernameError("");
      setUsernameAvailable(null);

      if (!value) {
        setUsernameError("Username is required");
        return false;
      }

      // Format validation
      const usernameRegex = /^[a-z0-9_]{3,20}$/;
      if (!usernameRegex.test(value)) {
        if (value.length < 3) {
          setUsernameError("Username must be at least 3 characters");
        } else if (value.length > 20) {
          setUsernameError("Username must be 20 characters or less");
        } else {
          setUsernameError("Only lowercase letters, numbers, and underscores allowed");
        }
        return false;
      }

      // Skip uniqueness check if username hasn't changed
      if (value === user.store?.handle) {
        setUsernameAvailable(true);
        return true;
      }

      // Check uniqueness
      setIsCheckingUsername(true);
      try {
        const response = await fetch(`/api/settings/check-username?username=${value}`);
        const data = await response.json();

        if (!data.available) {
          setUsernameError("Username already taken");
          setUsernameAvailable(false);
          return false;
        }

        setUsernameAvailable(true);
        return true;
      } catch (error) {
        setUsernameError("Failed to check username availability");
        setUsernameAvailable(null);
        return false;
      } finally {
        setIsCheckingUsername(false);
      }
    },
    [user.store?.handle]
  );

  // Debounced username check
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (username && username !== user.store?.handle) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user.store?.handle, checkUsername]);

  // Birth date validation
  const validateBirthDate = (date: string) => {
    if (!date) {
      setBirthDateError("");
      return true;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      setBirthDateError("Birth date cannot be in the future");
      return false;
    }

    setBirthDateError("");
    return true;
  };

  React.useEffect(() => {
    validateBirthDate(birthDate);
  }, [birthDate]);

  const handleSave = async () => {
    // Final validation
    const isUsernameValid = await checkUsername(username);
    const isBirthDateValid = validateBirthDate(birthDate);

    if (!isUsernameValid || !isBirthDateValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors before saving",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username,
          birthDate: birthDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      toast({
        title: "Saved",
        description: "Your personal information has been updated",
      });

      setIsDirty(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    try {
      const response = await fetch("/api/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      if (!response.ok) {
        throw new Error("Failed to change email");
      }

      setEmailVerificationSent(true);
      toast({
        title: "Verification Email Sent",
        description: `A verification link has been sent to ${newEmail}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send verification email",
      });
    }
  };

  const handlePasswordChange = async () => {
    // Reset error
    setPasswordError("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Password must include at least 1 letter and 1 number");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });

      // Reset form and close dialog
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordDialogOpen(false);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* About You Card */}
      <div className="bg-white dark:bg-gray-950 rounded-lg border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">About You</h2>
          <p className="text-sm text-muted-foreground">
            Update your personal information and username
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="username"
                className="pl-7"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isCheckingUsername && (
                  <p className="text-xs text-muted-foreground">Checking availability...</p>
                )}
                {!isCheckingUsername && usernameError && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <X className="h-3 w-3" />
                    <span>{usernameError}</span>
                  </div>
                )}
                {!isCheckingUsername && !usernameError && usernameAvailable && username !== user.store?.handle && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    <span>Username available</span>
                  </div>
                )}
                {!isCheckingUsername && !usernameError && username === user.store?.handle && (
                  <p className="text-xs text-muted-foreground">Current username</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {username.length}/20
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
            {birthDateError && <p className="text-sm text-destructive">{birthDateError}</p>}
          </div>

        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving || !!usernameError || !!birthDateError || isCheckingUsername}
            variant="gradient"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Log In Information Card */}
      <div className="bg-white dark:bg-gray-950 rounded-lg border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Log In Information</h2>
          <p className="text-sm text-muted-foreground">
            Manage your email and password
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Email Address</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Email Address</DialogTitle>
                  <DialogDescription>
                    Enter your new email address. We'll send a verification link to confirm the
                    change.
                  </DialogDescription>
                </DialogHeader>

                {emailVerificationSent ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        Verification email sent to <strong>{newEmail}</strong>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEmailVerificationSent(false);
                        setNewEmail("");
                        setEmailDialogOpen(false);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">New Email Address</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="new@example.com"
                      />
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleEmailChange}>Send Verification</Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
            </div>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one. Must be at least 8 characters
                    with 1 letter and 1 number.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <PasswordInput
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <PasswordInput
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPasswordDialogOpen(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange} disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

