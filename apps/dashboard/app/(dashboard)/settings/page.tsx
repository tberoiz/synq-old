import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { AccountForm } from "@ui/forms/settings/account-form";
import { Card, CardHeader, CardDescription, CardContent } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { NotificationsForm } from "@ui/forms/settings/notifications-form";

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
  },
  {
    key: "notifications",
    title: "Notifications",
    description: "Manage your notifications.",
    content: <NotificationsForm />,
  },
];

export default function SettingsPage() {
  return (
    <Card className="w-full h-full">
      <Tabs
        defaultValue={
          tabsNavItems.length > 0 && tabsNavItems[0]?.key
            ? tabsNavItems[0].key
            : "default"
        }
      >
        <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
          <TabsList className="bg-transparent">
            <CardDescription>
              {tabsNavItems.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} variant={"none"}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </CardDescription>
          </TabsList>
        </CardHeader>
        <Separator className="w-full" />
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 w-1/4">
          {tabsNavItems.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">{tab.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tab.description}
                  </p>
                </div>
                <Separator />
                {tab.content}
              </div>
            </TabsContent>
          ))}
        </CardContent>
      </Tabs>
    </Card>
  );
}
