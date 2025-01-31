import { Card, CardHeader, CardContent } from "@repo/ui/card";
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
import { CheckCircle } from "lucide-react";

export default function IntegrationCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-start space-y-2 space-x-2 pb-2">
        <h3 className="text-2xl font-extralight">Integration A</h3>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          Sync your inventory, track orders, and update stock levels in
          real-time by connecting your Integration A account. Manage listings and view
          sales data seamlessly.
        </p>
        <div className="mt-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button className="mr-2" variant="outline">
                See Details
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Integration A Details</DrawerTitle>
                  <DrawerDescription>
                    Enhance your Integration A experience with seamless integration.
                  </DrawerDescription>
                </DrawerHeader>
              </div>
              <div className="p-4 pb-0">
                <div className="flex items-center justify-center space-x-2">
                  <ul className="list-none space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2" />
                      Sync your Integration A inventory with ease.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2" />
                      Track orders automatically and update stock in real-time.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2" />
                      Manage listings directly from your dashboard.
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2" />
                      View detailed sales data and analytics.
                    </li>
                  </ul>
                </div>
              </div>
              <DrawerFooter>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Button variant="default">Install</Button>
        </div>
      </CardContent>
    </Card>
  );
}
