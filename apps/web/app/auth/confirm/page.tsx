import { EmailConfirmationStatus } from "@ui/modules/auth/components/forms/email-confirmation-status";

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <EmailConfirmationStatus />
      </div>
    </div>
  );
}
