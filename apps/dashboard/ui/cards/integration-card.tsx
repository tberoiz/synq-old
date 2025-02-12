import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@decko/ui/card";
import { Button } from "@decko/ui/button";
import Image from "next/image";
import { Badge } from "@decko/ui/badge";

export default function IntegrationCard({
  name,
  description,
  icon_url,
  isComingSoon = false,
  isInstalled = false,
}: {
  name: string;
  description: string;
  icon_url: string;
  isComingSoon?: boolean;
  isInstalled?: boolean;
}) {
  return (
    <Card className="w-full max-w-sm relative overflow-hidden">
      {isComingSoon && (
        <Badge className="absolute top-0 right-0 transform translate-x-8 rotate-45 px-4 py-1">
          Coming Soon
        </Badge>
      )}
      <CardHeader className="flex flex-row items-center space-x-3 pb-2">
        <Image
          src={icon_url}
          width={32}
          height={32}
          alt={`${name} icon`}
          className="h-6 w-6"
        />
        <CardTitle className="text-base flex flex-col">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
        <Button
          variant="default"
          className="flex-1 text-xs h-8 w-full"
          disabled={isComingSoon || isInstalled}
        >
          {isInstalled ? "Synced" : "Sync"}
        </Button>
      </CardContent>
    </Card>
  );
}
