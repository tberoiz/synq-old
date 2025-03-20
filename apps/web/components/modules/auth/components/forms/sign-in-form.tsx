"use client";

import { cn } from "@synq/ui/utils";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { Label } from "@synq/ui/label";
import { useToast } from "@synq/ui/use-toast";
import { useFormStatus } from "react-dom";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";

import { OAuthButton } from "../components/provider-button";
import { SynqIcon } from "@ui/shared/icons/icons";
import { signIn } from "@synq/supabase/queries";

type FormState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

export function SignInForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { toast } = useToast();
  const router = useRouter();
  const [message, setMessage] = useQueryState("message");
  const [state, formAction] = React.useActionState<FormState, FormData>(
    signIn,
    { success: false }
  );

  useEffect(() => {
    // Handle success message from URL
    if (message) {
      toast({
        title: message.includes('successfully') ? "Success" : "Error",
        description: message,
        variant: message.includes('successfully') ? "default" : "destructive",
      });
      // Clean up the URL
      setMessage(null);
    }

    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    }

    if (state?.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router, toast, message, setMessage]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <form action={formAction}>
          <div className="flex flex-col items-center gap-2">
            <a
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <SynqIcon />
              </div>
              <span className="sr-only">synq.com</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to synq.com</h1>
            <div className="text-center text-sm">
              Don&apos;t have an account?
              <a
                href="/auth/signup"
                className="underline underline-offset-4 ml-1"
              >
                Sign up
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </div>
            <SubmitButton />
          </div>
        </form>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <OAuthButton provider="apple" />
          <OAuthButton provider="google" />
        </div>
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
      className="w-full"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Signing in...</span>
        </div>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}
