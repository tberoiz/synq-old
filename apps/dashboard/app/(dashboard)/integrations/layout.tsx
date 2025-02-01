import { RequestIntegrationButton } from "@ui/buttons/request-integration-button";
import { CardLayout } from "@ui/layouts/content/card-layout";
import { Blocks } from "lucide-react";

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actions = (
    <>
       <RequestIntegrationButton />
    </>
  );
  return (
    <CardLayout title="Integrations" description="Connect your favorite tools and services to streamline your workflow." icon={<Blocks strokeWidth={1} />} actions={actions}>
      {children}
    </CardLayout>
  );
}
