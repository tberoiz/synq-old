"use client"
import { Button } from "@repo/ui/button";
import InventoryCard from "@ui/cards/inventory-card";
import ItemCard from "@ui/cards/item-card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// TODO: Fetch data from the db
const data = [
 {
    id: 1,
    name: "Item A",
    stock: 200
  },
  {
    id: 2,
    name: "Item B",
    stock: 300
  },
  {
    id: 3,
    name: "Item C",
    stock: 400
  },
  {
    id: 4,
    name: "Item D",
    stock: 100
  },
  {
    id: 5,
    name: "Item E",
    stock: 250
 }
];

export default function InventoryPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Button
        onClick={() => router.back()}
        variant={"outline"}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition max-w-24"
      >
        <ArrowLeft size={20} />
        Back
      </Button>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InventoryCard name="Inventory 1" items={150} stock={200} />
        {data.map((item) => (
          <ItemCard key={item.id} name={item.name} stock={item.stock} />
        ))}
      </div>
    </div>
  );
}
