"use client";

import { cn } from "@synq/ui/utils";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { Label } from "@synq/ui/label";
import { useToast } from "@synq/ui/use-toast";
import { useFormStatus } from "react-dom";
import React, { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";

import { SynqIcon } from "@ui/shared/icons/icons";
import { signInWithOTP, verifyOTP } from "@synq/supabase/queries";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@synq/ui/input-otp";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

type FormState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formState, setFormState] = useState<FormState>({ success: false });
  const [countdown, setCountdown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const [state, formAction] = React.useActionState<FormState, FormData>(
    signInWithOTP,
    { success: false }
  );

  const [verifyState, verifyAction] = React.useActionState<FormState, FormData>(
    verifyOTP,
    { success: false }
  );

  useEffect(() => {
    if (state?.success) {
      setFormState(state);
      setCountdown(30);
      toast({
        title: "Code sent",
        description: "A new verification code has been sent to your email.",
      });
    }

    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }

    if (verifyState?.success && verifyState?.redirectTo) {
      router.push(verifyState.redirectTo);
    }

    if (verifyState?.error) {
      toast({
        title: "Error",
        description: verifyState.error,
        variant: "destructive",
      });
    }
  }, [state, verifyState, router, toast]);

  useEffect(() => {
    if (formState.success && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [formState.success, countdown]);

  const handleResend = () => {
    setIsResending(true);
    const formData = new FormData();
    formData.append("email", email);
    startTransition(() => {
      formAction(formData);
      setIsResending(false);
    });
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("token", otp);
    startTransition(() => {
      verifyAction(formData);
    });
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto animate-in fade-in duration-500", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <SynqIcon className="hover:rotate-12 transition-transform duration-300" />
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
          </div>
        </div>
        {formState.success ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">Enter the code sent to your email</p>
            <form onSubmit={handleOTPSubmit} className="w-full">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                value={otp}
                onChange={setOtp}
                className="flex flex-col gap-4"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>
              <Button type="submit" className="w-full mt-4" disabled={otp.length !== 6}>
                Verify Code
              </Button>
            </form>
            <div className="flex items-center gap-2 text-sm">
              <p className="text-muted-foreground">Didn't receive the code?</p>
              {countdown > 0 ? (
                <p className="text-muted-foreground">Resend in {countdown}s</p>
              ) : (
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Resending...</span>
                    </div>
                  ) : (
                    "Resend code"
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form action={formAction}>
            <div className="flex flex-col gap-6 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  className="h-10"
                />
              </div>
              <SubmitButton />
            </div>
          </form>
        )}
      </div>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full h-10"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Signing in...</span>
        </div>
      ) : (
        "Continue with Email"
      )}
    </Button>
  );
}
