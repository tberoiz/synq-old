import { Button } from "@repo/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import { RequestIntegrationButton } from "@ui/buttons/request-integration-button";
import IntegrationCard from "@ui/cards/integration-card";

export default function IntegrationsPage() {
  return (
    <>
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Connect your favorite tools and services to streamline your
              workflow.
            </CardDescription>
          </div>
          <RequestIntegrationButton />
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <IntegrationCard
              title="Integration A"
              description="Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings
          and view sales data seamlessly."
            />
            <IntegrationCard
              title="Integration B"
              description="Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings
          and view sales data seamlessly."
            />
            <IntegrationCard
              title="Integration C"
              description="Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings
          and view sales data seamlessly."
            />
            <IntegrationCard
              title="Integration D"
              description="Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings
          and view sales data seamlessly."
            />
            <IntegrationCard
              title="Integration E"
              description="Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings
          and view sales data seamlessly."
            />
            <IntegrationCard
              title="Integration F"
              description="Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings
          and view sales data seamlessly."
            />
            <IntegrationCard
              title="Integration H"
              description="Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings
          and view sales data seamlessly."
            />
            <IntegrationCard
              title="Integration I"
              description="Sync your inventory, track orders, and update stock levels in real-time by connecting your Integration A account. Manage listings
          and view sales data seamlessly."
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
