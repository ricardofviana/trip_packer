import { PackingItem, ItemStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MinusIcon, PlusIcon } from "lucide-react";

interface TripPackingListDisplayProps {
  packingList: PackingItem[];
  onQuantityChange: (packingItemId: number, newQuantity: number) => void;
  onRemoveItem: (packingItemId: number) => void;
}

export function TripPackingListDisplay({ packingList, onQuantityChange, onRemoveItem }: TripPackingListDisplayProps) {
  return (
    <div className="space-y-4">
      {packingList.length === 0 ? (
        <p className="text-muted-foreground">No items in the packing list yet.</p>
      ) : (
        packingList.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
            <div className="flex-grow">
              <p className="font-semibold">{item.item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.item.category.replace(/_/g, ' ')}
                {item.bag && ` · Bag: ${item.bag.name}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value))}
                className="w-16 text-center"
                min="1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                className="ml-4"
              >
                Remove
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}