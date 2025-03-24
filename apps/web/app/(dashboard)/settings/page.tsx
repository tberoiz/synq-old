import { Metadata } from "next";
import { User, Bell, FolderTree } from "lucide-react";
import { PageContainer } from "@ui/shared/layouts/server/page-container";
import { AccountForm } from "@ui/modules/settings/components/forms/account-form";
import { NotificationsForm } from "@ui/modules/settings/components/forms/notifications-form";
import { CategoriesForm } from "@ui/modules/settings/components/forms/categories-form";
import { Separator } from "@synq/ui/separator";

export const metadata: Metadata = {
  title: "Settings",
  description: "User Settings",
};

const settingsSections = [
  {
    key: "account",
    title: "Account Settings",
    description: "Update your account information and profile.",
    content: <AccountForm />,
    icon: <User className="w-5 h-5" />,
  },
  {
    key: "categories",
    title: "Categories",
    description: "Manage your inventory categories.",
    content: <CategoriesForm />,
    icon: <FolderTree className="w-5 h-5" />,
  },
  {
    key: "notifications",
    title: "Notification Preferences",
    description: "Manage how and when you receive notifications.",
    content: <NotificationsForm />,
    icon: <Bell className="w-5 h-5" />,
  },
];

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        {settingsSections.map((section, index) => (
          <div key={section.key}>
            <div className="flex items-center gap-2 mb-4">
              {section.icon}
              <div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
            {section.content}
            {index < settingsSections.length - 1 && (
              <Separator className="my-8" />
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
