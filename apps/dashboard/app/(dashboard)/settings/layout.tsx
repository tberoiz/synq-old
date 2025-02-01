import { CardLayout } from "@ui/layouts/content/card-layout";
import { Settings } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CardLayout title="Settings" icon={<Settings strokeWidth={1} />} description="Manage your account settings and preferences.">
      {children}
    </CardLayout>
  );
}
