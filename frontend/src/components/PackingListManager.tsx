import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemTemplate, PackingItem, ID, ItemStatus } from "@/types";
import { itemsRepo } from "@/services/repos/itemsRepo";
import { packingRepo } from "@/services/repos/packingRepo";

interface PackingListManagerProps {
  tripId: ID;
  packingList: PackingItem[];
  refreshTripDetails: () => void;
}

export function PackingListManager({ tripId, packingList, refreshTripDetails }: PackingListManagerProps) {
  const [allItemsTemplates, setAllItemsTemplates] = useState<ItemTemplate[]>([]);
  const [selectedItemTemplateId, setSelectedItemTemplateId] = useState<ID | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllItemsTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await itemsRepo.listItems();
      setAllItemsTemplates(response.data);
    } catch (error) {
      console.error("Failed to fetch all item templates:", error);
      toast.error("Failed to load available item templates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllItemsTemplates();
  }, []);

  const handleAddItemToPackingList = async () => {
    if (selectedItemTemplateId === "") return;
    setIsLoading(true);
    try {
      await packingRepo.addItemToPackingList(tripId, { item_id: selectedItemTemplateId as ID });
      toast.success("Item added to packing list successfully!");
      setSelectedItemTemplateId("");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to add item to packing list:", error);
      toast.error("Failed to add item to packing list.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePackingItem = async (itemId: ID) => {
    if (!confirm("Remove this item from the packing list?")) return;
    setIsLoading(true);
    try {
      await packingRepo.removeItemFromPackingList(tripId, itemId);
      toast.success("Item removed from packing list successfully!");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to remove item from packing list:", error);
      toast.error("Failed to remove item from packing list.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePackingItemStatus = async (item: PackingItem, newStatus: ItemStatus) => {
    setIsLoading(true);
    try {
      await packingRepo.updatePackingListItem(tripId, item.item.id, { status: newStatus });
      toast.success("Packing item status updated!");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to update packing item status:", error);
      toast.error("Failed to update packing item status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePackingItemQuantity = async (item: PackingItem, newQuantity: number) => {
    setIsLoading(true);
    try {
      await packingRepo.updatePackingListItem(tripId, item.item.id, { quantity: newQuantity });
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
  }, {} as Record<string, PackingItem[]>);

  


  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Item to Packing List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedItemTemplateId.toString()}
            onValueChange={(value) => setSelectedItemTemplateId(parseInt(value))}
            disabled={isLoading || allItemsTemplates.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an item template" />
            </SelectTrigger>
            <SelectContent>
              {allItemsTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name} ({template.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddItemToPackingList}
            disabled={isLoading || selectedItemTemplateId === ""}
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
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
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
                  </Select>
                  <Button
                    variant="ghost"
                    onClick={() => handleRemovePackingItem(item.item.id)}
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
