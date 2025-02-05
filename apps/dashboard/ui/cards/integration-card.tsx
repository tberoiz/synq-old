import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@refrom/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@refrom/ui/drawer";
import { Button } from "@refrom/ui/button";
import { CheckCircle, Blocks } from "lucide-react";
import { Badge } from "@refrom/ui/badge";

export default function IntegrationCard({
  name,
  description,
  isComingSoon = false,
}: {
  name: string;
  description: string;
  isComingSoon?: boolean;
}) {
  return (
    <Card className="w-full max-w-md relative overflow-hidden">
      {isComingSoon && (
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-2 rotate-45 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium shadow-md">
          Coming Soon
        </div>
      )}
      <CardHeader className="flex flex-row items-center space-x-4 pb-4">
        <Blocks className="h-8 w-8 text-primary" strokeWidth={1} />
        <div className="flex flex-col">
          <CardTitle>{name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex space-x-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="flex-1" disabled={isComingSoon}>
                See Details
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle className="text-xl">
                    {name} Details
                  </DrawerTitle>
                  <DrawerDescription>
                    {isComingSoon
                      ? "This integration is coming soon. Stay tuned!"
                      : "Enhance your experience with seamless integration."}
                  </DrawerDescription>
                </DrawerHeader>
                {!isComingSoon && (
                  <div className="p-4 pb-0">
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <CheckCircle className="mt-1 mr-8 h-5 w-5 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          Sync your Integration inventory with ease.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mt-1 mr-8 h-5 w-5 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          Track orders automatically and update stock in
                          real-time.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mt-1 mr-8 h-5 w-5 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          Manage listings directly from your dashboard.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="mt-1 mr-8 h-5 w-5 flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          View detailed sales data and analytics.
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <DrawerFooter>
                <Button variant="default" className="w-full" disabled={isComingSoon}>
                  {isComingSoon ? "Coming Soon" : "Get Started"}
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Button variant="default" className="flex-1" disabled={isComingSoon}>
            {isComingSoon ? "Coming Soon" : "Install"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
