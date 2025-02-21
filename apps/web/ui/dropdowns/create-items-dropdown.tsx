"use client";
// TODO: This is a mockup component, it has to be implemented
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@synq/ui/dialog";
import { Button } from "@synq/ui/button";
import { Input } from "@synq/ui/input";
import { CirclePlus, Plus, Search } from "lucide-react";
import Image from "next/image";
import { CreateItemForm } from "@ui/forms/inventory/create-item-form";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@synq/ui/dropdown-menu";
import { UserAcquisitionBatch } from "@synq/supabase/models/inventory";

const tcgCollections = [
  {
    id: "mtg",
    title: "Magic: The Gathering",
    image: "/tcg/mtg.png",
  },
  {
    id: "pokemon",
    title: "Pokémon",
    image: "/tcg/pokemon.png",
  },
  {
    id: "dbz",
    title: "Dragon Ball Z",
    image: "/tcg/dbz.png",
  },
  // Add more as needed...
];

export const AddDatabaseInventoryDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" className="flex items-center">
        <Search className="mr-2 h-4 w-4" />
        Search from database
      </Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Import from Synq Database
        </DialogTitle>
        <DialogDescription>
          Choose which TCG collection you want to import:
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {tcgCollections.map((collection) => (
            <Button
              key={collection.id}
              variant="outline"
              className="justify-start"
            >
              <Image
                width={42}
                height={42}
                src={collection.image}
                alt={collection.title}
                className="object-contain"
              />
              <span className="font-medium">{collection.title}</span>
            </Button>
          ))}
        </div>

        {/* Step 2: Search / Import Specific Sets or Cards */}
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Search or filter by set/card name:
          </p>
          <Input placeholder="Search sets or cards..." className="mt-2" />
        </div>

        {/* Step 3: (Optional) Show a preview or list of sets/cards to import */}
        <div className="pt-4 space-y-2">
          {/* For demonstration, a placeholder list or table of cards */}
          <p className="text-sm text-muted-foreground">
            (Optional) Display results here for the user to select specific
            cards, sets, etc.
          </p>
          {/* You could add checkboxes, quantity inputs, etc. */}
        </div>

        {/* Step 4: Action buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary">Cancel</Button>
          <Button>Import Selected</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export const AddManualInventoryDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" className="flex items-center">
        <CirclePlus className="h-3 w-3 mr-1" />
        Add custom item
      </Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          Add New Item
        </DialogTitle>
      </DialogHeader>

      {/* Tabs Container */}
      <CreateItemForm />
    </DialogContent>
  </Dialog>
);

export const CreateItemsDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm">
          <Plus className="h-3 w-3 mr-1" />
          Add Item
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <AddManualInventoryDialog />
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <AddDatabaseInventoryDialog />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
