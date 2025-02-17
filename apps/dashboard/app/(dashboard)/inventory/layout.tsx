import { CardLayout } from "@ui/layouts/content/card-layout";
import { AddInventoryDialog } from "@ui/dialog/add-inventory-dialog";
import { Package } from "lucide-react";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actions = (
    <>
     <AddInventoryDialog />
    </>
  );

  return (
    <CardLayout
      title="Inventory"
      description="Manage your inventory and track stock levels."
      icon={<Package strokeWidth={1} />}
      actions={actions}
    >
      {children}
    </CardLayout>
  );
}
