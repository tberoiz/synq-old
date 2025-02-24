import { NewSalesBatchDialog } from "@ui/dialogs/create-sales-batch-dialog";
import { CardLayout } from "@ui/layouts/content/card-layout";
import { WalletCards } from "lucide-react";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actions = <>{/* <CreateSalesBatchDialog /> */}</>;
  return <>{children}</>;
}
