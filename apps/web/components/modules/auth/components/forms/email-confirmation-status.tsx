"use client";

import { Button } from "@synq/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@synq/ui/card";
import { MailCheck, RefreshCw } from "lucide-react";
import React from "react";

interface EmailConfirmationStatusProps {
  onResendEmail?: () => Promise<void>;
}

export function EmailConfirmationStatus({
  onResendEmail,
}: EmailConfirmationStatusProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailCheck className="h-5 w-5 text-primary" />
          Check your email
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>We've sent a confirmation email.</p>
        <p className="mt-4">
          Click the link in the email to verify your account. If you don't see
          the email, check your spam folder.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {onResendEmail && (
          <Button variant="outline" className="w-full" onClick={onResendEmail}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resend confirmation email
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
