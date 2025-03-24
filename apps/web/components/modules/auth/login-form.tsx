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
import { CircularSpinner } from "@ui/shared/components/spinners/circular-spinner";

type FormState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

const RESEND_COOLDOWN = 30; // seconds

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [signInState, signInAction] = React.useActionState<FormState, FormData>(
    signInWithOTP,
    {}
  );
  const [verifyState, verifyAction] = React.useActionState<FormState, FormData>(
    verifyOTP,
    {}
  );

  // Handle sign-in state changes
  useEffect(() => {
    if (signInState?.success) {
      setShowOTP(true);
      setCountdown(RESEND_COOLDOWN);
      toast({
        title: "Code sent",
        description: "Verification code sent to your email.",
      });
    }
    if (signInState?.error) {
      toast({
        title: "Error",
        description: signInState.error,
        variant: "destructive",
      });
    }
  }, [signInState, toast]);

  // Handle verification state changes
  useEffect(() => {
    if (verifyState?.success && verifyState.redirectTo) {
      router.push(verifyState.redirectTo);
    }
    if (verifyState?.error) {
      toast({
        title: "Error",
        description: verifyState.error,
        variant: "destructive",
      });
    }
  }, [verifyState, router, toast]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = () => {
    if (countdown > 0) return;

    setIsResending(true);
    const formData = new FormData();
    formData.append("email", email);
    startTransition(() => {
      signInAction(formData);
      setIsResending(false);
    });
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("token", otp);
    startTransition(() => verifyAction(formData));
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 w-full max-w-sm mx-auto animate-in fade-in duration-500",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-6">
        <HeaderSection />

        {showOTP ? (
          <OTPForm
            otp={otp}
            countdown={countdown}
            isResending={isResending}
            onOtpChange={setOtp}
            onSubmit={handleOTPSubmit}
            onResend={handleResend}
          />
        ) : (
          <EmailForm
            email={email}
            onEmailChange={setEmail}
            action={signInAction}
          />
        )}
      </div>

      <PolicyLinks />
    </div>
  );
}

const HeaderSection = () => (
  <div className="flex flex-col items-center gap-4">
    <SynqIcon className="hover:rotate-12 transition-transform duration-300" />
    <div className="flex flex-col items-center gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-sm text-muted-foreground">
        Enter your email to sign in to your account
      </p>
    </div>
  </div>
);

const OTPForm = ({
  otp,
  countdown,
  isResending,
  onOtpChange,
  onSubmit,
  onResend,
}: {
  otp: string;
  countdown: number;
  isResending: boolean;
  onOtpChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
}) => (
  <div className="flex flex-col items-center gap-4">
    <p className="text-sm text-muted-foreground text-center">
      Enter the code sent to your email
    </p>
    <form onSubmit={onSubmit} className="w-full">
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        value={otp}
        onChange={onOtpChange}
        className="flex flex-col gap-4"
      >
        <InputOTPGroup className="gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="w-12 h-12 text-lg"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <Button type="submit" className="w-full mt-4" disabled={otp.length !== 6}>
        Verify Code
      </Button>
    </form>
    <ResendButton
      countdown={countdown}
      isResending={isResending}
      onResend={onResend}
    />
  </div>
);

const ResendButton = ({
  countdown,
  isResending,
  onResend,
}: {
  countdown: number;
  isResending: boolean;
  onResend: () => void;
}) => (
  <div className="flex items-center gap-2 text-sm">
    <p className="text-muted-foreground">Didn't receive the code?</p>
    {countdown > 0 ? (
      <p className="text-muted-foreground">Resend in {countdown}s</p>
    ) : (
      <Button
        variant="link"
        className="h-auto p-0 text-sm"
        onClick={onResend}
        disabled={isResending}
      >
        {isResending ? (
          <>
            <CircularSpinner /> Resending...
          </>
        ) : (
          "Resend code"
        )}
      </Button>
    )}
  </div>
);

const EmailForm = ({
  email,
  onEmailChange,
  action,
}: {
  email: string;
  onEmailChange: (value: string) => void;
  action: (formData: FormData) => void;
}) => (
  <form action={action}>
    <div className="flex flex-col gap-6 mt-4">
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="m@example.com"
          autoComplete="email"
          required
          className="h-10"
        />
      </div>
      <SubmitButton />
    </div>
  </form>
);

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full h-10"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <CircularSpinner /> Signing in...
        </>
      ) : (
        "Continue with Email"
      )}
    </Button>
  );
};

const PolicyLinks = () => (
  <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
    By clicking continue, you agree to our <a href="#">Terms of Service</a> and{" "}
    <a href="#">Privacy Policy</a>.
  </div>
);
