import { TripItem, ItemTemplate, ItemStatus, ID } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusIcon, PlusIcon } from "lucide-react";

interface TripPackingListDisplayProps {
  packingList: TripItem[];
  allItems: ItemTemplate[];
  onQuantityChange: (itemId: ID, newQuantity: number) => void;
  onRemoveItem: (itemId: ID) => void;
  onAddItem: (itemId: ID) => void;
}

export function TripPackingListDisplay({ packingList, allItems, onQuantityChange, onRemoveItem, onAddItem }: TripPackingListDisplayProps) {
  const packingListItemIds = new Set(packingList.map(item => item.item.id));
  const availableItems = allItems.filter(item => !packingListItemIds.has(item.id));

  return (
    <div className="space-y-6">
      {/* Items in Trip */}
      <div>
        <h3 className="text-xl font-semibold mb-3">Items in Trip</h3>
        <div className="space-y-4">
          {packingList.length === 0 ? (
            <p className="text-muted-foreground">No items in the packing list yet.</p>
          ) : (
            packingList.map((item) => (
              <div key={item.item_id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex-grow">
                  <p className="font-semibold">{item.item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Category: {item.item.category.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onQuantityChange(item.item_id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(item.item_id, parseInt(e.target.value))}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onQuantityChange(item.item_id, item.quantity + 1)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveItem(item.item_id)}
                    className="ml-4"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Available Items */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Available Items to Add</h3>
        <div className="space-y-4">
          {availableItems.length === 0 ? (
            <p className="text-muted-foreground">No more items to add.</p>
          ) : (
            availableItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Category: {item.category.replace(/_/g, ' ')}</p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAddItem(item.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Add
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}