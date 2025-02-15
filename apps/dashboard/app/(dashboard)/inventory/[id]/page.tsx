"use client";
import { Button } from "@synq/ui/button";
import ItemCard from "@ui/cards/item-card";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// TODO: Fetch data from the db
const data = [
  {
    id: 1,
    name: "Black Lotus",
    sku: "MTG-ALPHA-BL",
    stock: 2,
    platforms: ["tcgplayer", "ebay"],
    listingsCount: 3,
    lastSold: new Date("2024-03-15"),
    lastSynced: new Date(),
    priceHistory: [
      { date: "2024-01-01", price: 25000 },
      { date: "2024-03-01", price: 27500 },
    ],
  },
  {
    id: 2,
    name: "Charizard (1st Ed.)",
    sku: "POKE-BS-4",
    stock: 5,
    platforms: ["ebay", "shopify"],
    listingsCount: 2,
    lastSold: new Date("2024-03-14"),
    lastSynced: new Date(),
  },
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
        {data.map((item) => (
          <ItemCard key={item.id} name={item.name} stock={item.stock} />
        ))}
      </div>
    </div>
  );
}
