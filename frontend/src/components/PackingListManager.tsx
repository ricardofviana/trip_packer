import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Item, Packing, ID, ItemStatus } from "@/types";
import { itemsRepo, packingRepo, bagsRepo } from "@/services/repos";

interface PackingListManagerProps {
  tripId: ID;
  packingList: Packing[];
  refreshTripDetails: () => void;
}

export function PackingListManager({ tripId, packingList, refreshTripDetails }: PackingListManagerProps) {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<ID | "">("");
  const [defaultBagId, setDefaultBagId] = useState<ID | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllItems = async () => {
    setIsLoading(true);
    try {
      const response = await itemsRepo.listItems();
      setAllItems(response);
    } catch (error) {
      console.error("Failed to fetch all items:", error);
      toast.error("Failed to load available items.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDefaultBag = async () => {
    try {
      const response = await bagsRepo.listBags();
      const defaultBag = response.find(bag => bag.name === "Default Bag");
      if (defaultBag) {
        setDefaultBagId(defaultBag.id);
      } else {
        const newBagResponse = await bagsRepo.createBag({ name: "Default Bag", type: "BACKPACK" });
        setDefaultBagId(newBagResponse.id);
      }
    } catch (error) {
      console.error("Failed to fetch or create default bag:", error);
      toast.error("Failed to set up default bag.");
    }
  };

  useEffect(() => {
    fetchAllItems();
    fetchDefaultBag();
  }, []);

  const handleAddItemToPackingList = async () => {
    if (selectedItemId === "" || defaultBagId === null) return;
    setIsLoading(true);
    try {
      await packingRepo.createPacking(tripId, { item_id: selectedItemId as ID, bag_id: defaultBagId, quantity: 1, status: ItemStatus.UNPACKED });
      toast.success("Item added to packing list successfully!");
      setSelectedItemId("");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to add item to packing list:", error);
      toast.error("Failed to add item to packing list.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePackingItem = async (item: Packing) => {
    if (!confirm("Remove this item from the packing list?")) return;
    setIsLoading(true);
    try {
      await packingRepo.deletePacking(tripId, item.item_id, item.bag_id);
      toast.success("Item removed from packing list successfully!");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to remove item from packing list:", error);
      toast.error("Failed to remove item from packing list.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePackingItemStatus = async (item: Packing, newStatus: ItemStatus) => {
    setIsLoading(true);
    try {
      await packingRepo.updatePacking(tripId, item.item_id, item.bag_id, { status: newStatus });
      toast.success("Packing item status updated!");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to update packing item status:", error);
      toast.error("Failed to update packing item status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePackingItemQuantity = async (item: Packing, newQuantity: number) => {
    setIsLoading(true);
    try {
      await packingRepo.updatePacking(tripId, item.item_id, item.bag_id, { quantity: newQuantity });
      toast.success("Packing item quantity updated!");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to update packing item quantity:", error);
      toast.error("Failed to update packing item quantity.");
    } finally {
      setIsLoading(false);
    }
  };

  const groupedPackingList = packingList.reduce((acc, item) => {
    const bagName = item.bag ? item.bag.name : "Unassigned Items";
    if (!acc[bagName]) {
      acc[bagName] = [];
    }
    acc[bagName].push(item);
    return acc;
  }, {} as Record<string, Packing[]>);

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Item to Packing List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedItemId.toString()}
            onValueChange={(value) => setSelectedItemId(parseInt(value))}
            disabled={isLoading || allItems.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an item" />
            </SelectTrigger>
            <SelectContent>
              {allItems.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name} ({template.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddItemToPackingList}
            disabled={isLoading || selectedItemId === "" || defaultBagId === null}
            className="w-full"
          >
            {isLoading ? "Adding..." : "Add Item"}
          </Button>
        </CardContent>
      </Card>

      {Object.entries(groupedPackingList).map(([bagName, itemsInBag]) => (
        <Card key={bagName}>
          <CardHeader>
            <CardTitle>{bagName}</CardTitle>
          </CardHeader>
          <CardContent>
            {itemsInBag.map((item) => (
              <div key={`${item.item_id}-${item.bag_id}`} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                  <span>{item.item.name}</span>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdatePackingItemQuantity(item, parseInt(e.target.value))}
                    className="w-16 text-center"
                    min="1"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={item.status}
                    onValueChange={(value) => handleUpdatePackingItemStatus(item, value as ItemStatus)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ItemStatus.UNPACKED}>Unpacked</SelectItem>
                      <SelectItem value={ItemStatus.PACKED}>Packed</SelectItem>
                      <SelectItem value={ItemStatus.TO_BUY}>To Buy</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    onClick={() => handleRemovePackingItem(item)}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
