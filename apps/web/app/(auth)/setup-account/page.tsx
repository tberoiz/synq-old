import { Suspense } from "react";
import { SetupAccountForm } from "@/components/modules/auth/components/forms/setup-account-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup Account",
  description: "Setup Account Page",
};

export default function SetupAccountPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <SetupAccountForm />
        </Suspense>
      </div>
    </div>
  );
}
