"use client";

import { cn } from "@synq/ui/utils";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { Label } from "@synq/ui/label";

import { OAuthButton } from "../components/provider-button";
import { SynqIcon } from "@ui/shared/icons/icons";
import { signUpWithPassword } from "@synq/supabase/queries";

import { useToast } from "@synq/ui/use-toast";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Card } from "@synq/ui/card";

type FormState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = React.useActionState<FormState, FormData>(
    signUpWithPassword,
    { success: false }
  );

  useEffect(() => {
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
  }, [state, router, toast]);

  return (
    <Card className={cn("p-8", className)} {...props}>
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <a href="#" className="flex flex-col items-center space-y-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <SynqIcon />
            </div>
            <span className="sr-only">synq.com</span>
          </a>
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground text-center">
            Welcome! Please fill in the details to get started.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <OAuthButton provider="apple" />
          <OAuthButton provider="google" />
        </div>
        <div className="relative text-center text-sm">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative bg-background px-2 text-muted-foreground">
            Or
          </span>
        </div>
        <form action={formAction}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Name Surname"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
        </form>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <a href="/auth/signin" className="underline underline-offset-4 hover:text-primary">
            Log in
          </a>
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
        and <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
      </div>
    </Card>
  );
}
