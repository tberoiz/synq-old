import { OrdersTable } from "@ui/tables/orders-table";

export default function OrdersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <OrdersTable />
    </div>
  );
}
