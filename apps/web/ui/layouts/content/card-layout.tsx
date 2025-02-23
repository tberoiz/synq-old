import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@synq/ui/card";
import { ReactNode } from "react";

interface CardLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function CardLayout({
  title,
  description,
  children,
  actions,
  icon,
}: CardLayoutProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-4 border-b py-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </div>
        {actions && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {children}
      </CardContent>
    </Card>
  );
}
