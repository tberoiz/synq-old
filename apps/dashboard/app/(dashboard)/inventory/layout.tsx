import { CardLayout } from "@ui/layouts/content/card-layout";
import { AddInventoryDialog } from "@ui/dialog/add-inventory-dialog";
import { Package } from "lucide-react";
import { AddItemDialog } from "@ui/dialog/add-items-dialog";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actions = (
    <>
      <AddItemDialog />
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
