"use client";

import { cn } from "@synq/ui/utils";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { Label } from "@synq/ui/label";
import { useToast } from "@synq/ui/use-toast";
import { useFormStatus } from "react-dom";
import React, { useState, startTransition, useRef } from "react";
import { useRouter } from "next/navigation";

import { SynqIcon } from "@ui/shared/icons/icons";
import { updateUserProfile } from "@synq/supabase/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@synq/ui/avatar";
import { Camera } from "lucide-react";

type FormState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

export function SetupAccountForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { toast } = useToast();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction] = React.useActionState<FormState, FormData>(
    updateUserProfile,
    { success: false }
  );

  React.useEffect(() => {
    if (state?.success && state?.redirectTo) {
      router.push(state.redirectTo);
    }

    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  }, [state, router, toast]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum file size is 5MB. Your file is ${formatFileSize(file.size)}.`,
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, JPEG, GIF, or WebP)",
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData();
    formData.append("full_name", fullName);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto animate-in fade-in duration-500", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview || undefined} alt="Profile picture" />
              <AvatarFallback>
                <SynqIcon className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/50 rounded-full transition-opacity",
                isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
              className="hidden"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Set up your account</h1>
            <p className="text-sm text-muted-foreground">Please enter your full name to continue</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name" className="text-sm font-medium">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                required
                disabled={isUploading}
                className="h-10"
              />
            </div>
            <SubmitButton isUploading={isUploading} />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton({ isUploading }: { isUploading: boolean }) {
  const { pending } = useFormStatus();
  const isLoading = pending || isUploading;

  return (
    <Button
      type="submit"
      className="w-full h-10"
      disabled={isLoading}
      aria-disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>{isUploading ? "Uploading..." : "Setting up account..."}</span>
        </div>
      ) : (
        "Continue"
      )}
    </Button>
  );
}
