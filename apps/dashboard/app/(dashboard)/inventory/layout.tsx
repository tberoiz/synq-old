import { CardLayout } from "@ui/layouts/content/card-layout";
import { Package } from "lucide-react";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CardLayout
      title="Inventory"
      description="Manage your inventory and track stock levels."
      icon={<Package strokeWidth={1} />}
    >
      {children}
    </CardLayout>
  );
}
