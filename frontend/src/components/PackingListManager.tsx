import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ItemTemplate, PackingItem, ID, ItemStatus, BagTemplate } from "@/types";
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

  const handleAssignBagToPackingItem = async (item: PackingItem, bagId: ID | undefined) => {
    setIsLoading(true);
    try {
      await packingRepo.updatePackingListItem(tripId, item.item.id, { bag_id: bagId });
      toast.success("Packing item assigned to bag!");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to assign bag to packing item:", error);
      toast.error("Failed to assign bag to packing item.");
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

  const tripBags = packingList.reduce((acc, item) => {
    if (item.bag && !acc.some(bag => bag.id === item.bag?.id)) {
      acc.push(item.bag);
    }
    return acc;
  }, [] as BagTemplate[]);

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
                  <Checkbox
                    checked={item.status === ItemStatus.PACKED}
                    onCheckedChange={(checked) =>
                      handleUpdatePackingItemStatus(
                        item,
                        checked ? ItemStatus.PACKED : ItemStatus.UNPACKED
                      )
                    }
                    disabled={isLoading}
                  />
                  <span>{item.item.name}</span>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdatePackingItemQuantity(item, parseInt(e.target.value))}
                    className="w-16 text-center"
                    min="1"
                    disabled={isLoading}
                  />
                  <Label>x</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={item.status}
                    onValueChange={(value) => handleUpdatePackingItemStatus(item, value as ItemStatus)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ItemStatus).map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={item.bag_id?.toString() || "unassigned"}
                    onValueChange={(value) =>
                      handleAssignBagToPackingItem(item, value === "unassigned" ? undefined : parseInt(value))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign to Bag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {tripBags.map((bag) => (
                        <SelectItem key={bag.id} value={bag.id.toString()}>
                          {bag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
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
