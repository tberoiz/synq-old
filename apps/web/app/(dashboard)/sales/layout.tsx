import { CardLayout } from "@ui/layouts/content/card-layout";
import { WalletCards } from "lucide-react";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CardLayout
      title="Sales"
      icon={<WalletCards strokeWidth={1} />}
      description="Manage and track your orders efficiently."
    >
      {children}
    </CardLayout>
  );
}
