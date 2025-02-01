import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@repo/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui/drawer";
import { Button } from "@repo/ui/button";
import { CheckCircle, Blocks } from "lucide-react";

export default function IntegrationCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center space-x-4 pb-4">
        <Blocks className="h-8 w-8 text-primary" strokeWidth={1} />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex space-x-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="flex-1">
                See Details
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle className="text-xl">
                    Integration Details
                  </DrawerTitle>
                  <DrawerDescription>
                    Enhance your experience with seamless integration.
                  </DrawerDescription>
                </DrawerHeader>
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
              </div>
              <DrawerFooter>
                <Button variant="default" className="w-full">
                  Get Started
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Button variant="default" className="flex-1">
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
