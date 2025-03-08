import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@synq/ui/tabs";
import { AccountForm } from "@ui/forms/settings/account-form";
import { NotificationsForm } from "@ui/forms/settings/notifications-form";
import { User, Bell } from "lucide-react";
import { PageContainer } from "@ui/layouts/page-container";
import { PageHeader } from "@ui/layouts/page-header";

export const metadata: Metadata = {
  title: "Settings",
  description: "User Settings",
};

const tabsNavItems = [
  {
    key: "account",
    title: "Account",
    description: "Update your account information.",
    content: <AccountForm />,
    icon: <User className="mr-2 h-4 w-4" />,
  },
  {
    key: "notifications",
    title: "Notifications",
    description: "Manage your notifications.",
    content: <NotificationsForm />,
    icon: <Bell className="mr-2 h-4 w-4" />,
  },
];

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Settings" />
      <Tabs defaultValue={tabsNavItems[0]?.key || "default"}>
        <TabsList className="w-full justify-start rounded-t-lg border-b bg-transparent p-0">
          {tabsNavItems.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="relative rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 data-[state=active]:border-primary data-[state=active]:text-foreground"
            >
              {tab.icon}
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabsNavItems.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-6">
            <div className="px-2 pt-4 sm:px-6 sm:pt-6">{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    </PageContainer>
  );
}
