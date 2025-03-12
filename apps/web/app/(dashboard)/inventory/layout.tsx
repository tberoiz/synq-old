import { PageContainer } from "@ui/shared/layouts/server/page-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inventory | Synq",
  description: "Manage your inventory items, categories, and stock levels.",
  openGraph: {
    title: "Inventory Management | Synq",
    description:
      "Efficiently manage your inventory with real-time tracking and insights.",
  },
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageContainer>{children}</PageContainer>;
}
