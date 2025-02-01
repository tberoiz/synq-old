import { CardLayout } from "@ui/layouts/content/card-layout";
import { WalletCards } from "lucide-react";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CardLayout
      title="Orders"
      description="Manage and track your orders efficiently."
      icon={<WalletCards strokeWidth={1} />}
    >
      {children}
    </CardLayout>
  );
}
