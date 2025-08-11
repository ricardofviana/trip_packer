import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BagTemplate, TripItem, ID } from "@/types";
import { bagsRepo } from "@/services/repos/bagsRepo";
import * as api from "@/services/api"; // Import all from api
import { toast } from "@/components/ui/sonner";
import { PackingCreate } from "@/types"; // Import PackingCreate

interface ManageItemBagsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripItem: TripItem | null;
  tripId: string;
  onSave: () => void; // Callback to refresh parent data
}

export function ManageItemBagsDialog({
  isOpen,
  onClose,
  tripItem,
  tripId,
  onSave,
}: ManageItemBagsDialogProps) {
  const [allBags, setAllBags] = useState<BagTemplate[]>([]);
  const [selectedBagIds, setSelectedBagIds] = useState<Set<ID>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBags = async () => {
      try {
        const response = await bagsRepo.listBags();
        setAllBags(response.data);
      } catch (error) {
        console.error("Failed to fetch bags:", error);
        toast.error("Failed to load bags for association.");
      }
    };
    fetchBags();
  }, []);

  useEffect(() => {
    if (tripItem) {
      setSelectedBagIds(new Set(tripItem.bag_ids));
    }
  }, [tripItem]);

  const handleCheckboxChange = (bagId: ID, checked: boolean) => {
    setSelectedBagIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(bagId);
      } else {
        newSet.delete(bagId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!tripItem) return;

    setIsLoading(true);
    try {
      const currentBagIds = new Set(tripItem.bag_ids);
      const newBagIds = selectedBagIds;

      const addedBagIds = Array.from(newBagIds).filter(
        (bagId) => !currentBagIds.has(bagId)
      );
      const removedBagIds = Array.from(currentBagIds).filter(
        (bagId) => !newBagIds.has(bagId)
      );

      const promises: Promise<PackingItem>[] = [];

      for (const bagId of addedBagIds) {
        promises.push(
          api.addItemToPackingList(parseInt(tripId), {
            item_id: tripItem.item_id,
            bag_id: bagId,
            quantity: tripItem.quantity,
            status: tripItem.status,
          } as PackingCreate) // Cast to PackingCreate
        );
      }

      for (const bagId of removedBagIds) {
        promises.push(
          api.deletePacking(parseInt(tripId), tripItem.item_id, bagId)
        );
      }

      await Promise.all(promises);

      toast.success("Item bag associations updated!");
      onSave(); // Refresh parent component
      onClose();
    } catch (error) {
      console.error("Failed to update item bag associations:", error);
      toast.error("Failed to update item bag associations.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!tripItem) return null; // Don't render if no tripItem is provided

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Bags for "{tripItem.item.name}"</DialogTitle>
          <DialogDescription>
            Select the bags this item should be associated with.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {allBags.length === 0 ? (
              <p className="text-muted-foreground">No bags available.</p>
            ) : (
              allBags.map((bag) => (
                <div key={bag.id} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`bag-${bag.id}`}
                    checked={selectedBagIds.has(bag.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(bag.id, checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor={`bag-${bag.id}`}>{bag.name}</Label>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
