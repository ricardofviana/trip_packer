import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { tripItemsRepo } from "@/services/repos/tripItemsRepo";
import { tripLuggageRepo } from "@/services/repos/tripLuggageRepo";
import { BagTemplate, ItemStatus, TripItem } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ManageItemBagsDialog } from "@/components/ManageItemBagsDialog"; // New import
import * as api from "@/services/api"; // Import api


function badgeVariant(status: ItemStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case ItemStatus.PACKED:
      return "default";
    case ItemStatus.UNPACKED:
      return "secondary";
    case ItemStatus.TO_BUY:
      return "destructive";
    default:
      return "outline";
  }
}

export default function TripsPacking() {
  const { tripId } = useParams();

  const [isManageBagsDialogOpen, setIsManageBagsDialogOpen] = useState(false); // New state
  const [itemToManageBagsFor, setItemToManageBagsFor] = useState<TripItem | null>(null); // New state

  const [bags, setBags] = useState<BagTemplate[]>([]);
  const [isLoadingBags, setIsLoadingBags] = useState(false); // Renamed to avoid conflict
  const [selectedBagId, setSelectedBagId] = useState<string | undefined>(undefined);

  const [allPackingItems, setAllPackingItems] = useState<TripItem[]>([]);
  const [isLoadingAllPackingItems, setIsLoadingAllPackingItems] = useState(false); // New loading state


  const fetchBags = useCallback(async () => {
    if (!tripId) return;
    setIsLoadingBags(true);
    try {
      const response = await tripLuggageRepo.listTripLuggage(tripId);
      setBags(response.data);
      if (response.data.length > 0 && !selectedBagId) {
        setSelectedBagId(response.data[0].id.toString()); // Select the first bag by default
      }
    } catch (error) {
      console.error("Failed to fetch bags:", error);
      toast.error("Failed to load bags.");
    } finally {
      setIsLoadingBags(false);
    }
  }, [tripId, selectedBagId]);

  const fetchAllPackingItems = useCallback(async () => {
    if (!tripId) return;
    setIsLoadingAllPackingItems(true);
    try {
      const response = await tripItemsRepo.getTripItems(parseInt(tripId));
      setAllPackingItems(response.data);
    } catch (error) {
      console.error("Failed to fetch all packing items:", error);
      toast.error("Failed to load all packing items.");
    } finally {
      setIsLoadingAllPackingItems(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchBags();
    fetchAllPackingItems(); // Fetch all packing items when tripId changes
  }, [tripId, fetchBags, fetchAllPackingItems]);

  // const handleMoveItemInAllItems = async (itemId: number, newBagId: string) => {
  //   setIsLoadingAllPackingItems(true);
  //   try {
  //     await packingRepo.updatePackingListItem(tripId, itemId, { bag_id: parseInt(newBagId) });
  //     toast.success("Item moved successfully!");
  //     fetchAllPackingItems(); // Refresh the list of all packing items
  //     fetchBags(); // Refresh bags to update counts
  //   } catch (error) {
  //     console.error("Failed to move item:", error);
  //     toast.error("Failed to move item.");
  //   } finally {
  //     setIsLoadingAllPackingItems(false);
  //   }
  // };

  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Trip Packing</h1>
      </header>

      <div className="flex gap-6">
        {/* Left Column: ScrollArea for all items */}
        <div className="w-1/4">
          <h2 className="text-xl font-bold mb-4">All Trip Items</h2>
          {isLoadingAllPackingItems ? (
            <p>Loading all items...</p>
          ) : allPackingItems.length === 0 ? (
            <p>No items in this trip.</p>
          ) : (
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <div className="p-4">
                {allPackingItems.map((item) => (
                  item.item && (
                    <React.Fragment key={item.item_id}>
                      <Card className="mb-2">
                        <CardHeader className="p-2">
                          <CardTitle className="text-sm">{item.item.name} (x{item.quantity})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-0">
                          <Badge variant={badgeVariant(item.status)}>{item.status.replace("_", " ")}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setItemToManageBagsFor(item);
                              setIsManageBagsDialogOpen(true);
                            }}
                          >
                            Manage Bags
                          </Button>
                        </CardContent>
                      </Card>
                      <Separator className="my-2" />
                    </React.Fragment>
                  )
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Right Column: Tabs for bags */}
        <div className="w-3/4">
          {isLoadingBags ? (
            <p>Loading bags...</p>
          ) : bags.length === 0 ? (
            <p>No bags found for this trip.</p>
          ) : (
            <Tabs value={selectedBagId} onValueChange={setSelectedBagId} className="w-full">
              <TabsList>
                {bags.map((bag) => (
                  <TabsTrigger key={bag.id} value={bag.id.toString()}>{bag.name}</TabsTrigger>
                ))}
              </TabsList>
              {bags.map((bag) => (
                <TabsContent key={bag.id} value={bag.id.toString()}>
                  <BagColumn
                    bag={bag}
                    filter="ALL"
                    onChange={fetchBags}
                    isLoading={isLoadingBags}
                    tripId={tripId!}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
      {itemToManageBagsFor && (
        <ManageItemBagsDialog
          isOpen={isManageBagsDialogOpen}
          onClose={() => setIsManageBagsDialogOpen(false)}
          tripItem={itemToManageBagsFor}
          tripId={tripId!}
          onSave={() => {
            fetchAllPackingItems(); // Refresh all items
            fetchBags(); // Refresh bags (to update counts if needed)
          }}
        />
      )}
    </main>
  );
}

function BagColumn({ bag, filter, onChange, isLoading: boardLoading, tripId }: { bag: BagTemplate; filter: ItemStatus | "ALL"; onChange: () => void; isLoading: boolean; tripId: string }) {
  const [items, setItems] = useState<TripItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getPackingList(parseInt(tripId)); // Use packing list endpoint
      // Filter items by the current bag's ID and map status
      const filteredItems = response.data
        .filter(packingItem => packingItem.item && packingItem.bag.id === bag.id) // Filter by bag.id from packingItem
        .map(packingItem => ({
          // Map PackingItem to TripItem structure
          trip_id: packingItem.trip_id,
          item_id: packingItem.item_id,
          quantity: packingItem.quantity,
          status: packingItem.status,
          bag_ids: [packingItem.bag.id], // Assuming for display, an item in this bag has this bag_id
          created_at: packingItem.created_at,
          updated_at: packingItem.updated_at,
          item: packingItem.item,
        }));
      setItems(filteredItems);
    } catch (error) {
      console.error(`Failed to fetch items for bag ${bag.name}:`, error);
      toast.error(`Failed to load items for ${bag.name}.`);
      setItems([]); // Ensure items is always an array on error
    } finally {
      setIsLoading(false);
    }
  }, [tripId, bag.name, bag.id]);

  useEffect(() => { refresh(); }, [bag.id, refresh]);

  const startEditing = (item: TripItem) => {
    setEditingItemId(item.id);
    setEditedQuantity(item.quantity);
  };

  const saveEdit = async (itemId: number) => {
    setIsLoading(true);
    try {
      await tripItemsRepo.updateTripItem(parseInt(tripId), itemId, { quantity: editedQuantity });
      toast.success("Item quantity updated!");
      setEditingItemId(null);
      onChange();
    } catch (error) {
      console.error("Failed to update item quantity:", error);
      toast.error("Failed to update item quantity.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  const handleStatusChange = async (itemId: number, newStatus: ItemStatus) => {
    setIsLoading(true);
    try {
      await tripItemsRepo.updateTripItem(parseInt(tripId), itemId, { status: newStatus });
      toast.success("Item status updated!");
      refresh(); // Refresh to get updated data
      onChange(); // Refresh overview
    } catch (error) {
      console.error("Failed to update item status:", error);
      toast.error("Failed to update item status.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleMoveItem = async (itemId: number, newLuggageId: string) => {
  //   setIsLoading(true);
  //   try {
  //     await packingRepo.updateLuggageItem(bag.id, itemId, { luggage_id: parseInt(newLuggageId) });
  //     setItems((prev) => prev.filter((item) => item.id !== itemId)); // Remove from current bag
  //     toast.success("Item moved successfully!");
  //     onChange(); // Trigger full refresh to update all bags
  //   } catch (error) {
  //     console.error("Failed to move item:", error);
  //     toast.error("Failed to move item.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleDeleteItem = async (itemId: number) => {
    setIsLoading(true);
    try {
      await tripItemsRepo.removeTripItem(parseInt(tripId), itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Item deleted!");
      onChange();
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDeleteBag = async () => {
  //   setIsLoading(true);
  //   try {
  //     await tripLuggageRepo.removeTripLuggage(bag.trip_id, bag.id);
  //     toast.success("Bag deleted!");
  //     onChange(); // Trigger full refresh to remove bag from UI
  //   } catch (error) {
  //     console.error("Failed to delete bag:", error);
  //     toast.error("Failed to delete bag.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const visibleItems = items.filter((it) => {
    if (filter === "ALL") return true;
    return (it.status === ItemStatus.PACKED && filter === ItemStatus.PACKED) || (it.status === ItemStatus.UNPACKED && filter === ItemStatus.UNPACKED);
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{bag.name}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{items.length} items</Badge>
            {/* <Button variant="ghost" onClick={handleDeleteBag} disabled={isLoading || boardLoading}>Delete</Button> */}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {visibleItems.map((it) => (
            <li key={it.id} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center gap-3">
                <Badge variant={badgeVariant(it.status)}>{it.status.replace("_", " ")}</Badge>
                <span className="font-medium">{it.name}</span>
                {editingItemId === it.id ? (
                  <Input type="number" min={1} value={editedQuantity} onChange={(e) => setEditedQuantity(Number(e.target.value))} className="w-16" disabled={isLoading || boardLoading} />
                ) : (
                  <span className="text-muted-foreground">×{it.quantity}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingItemId === it.id ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => saveEdit(it.id)} disabled={isLoading || boardLoading || editedQuantity < 1}>
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isLoading || boardLoading}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => startEditing(it)} disabled={isLoading || boardLoading}>
                    Edit
                  </Button>
                )}
                <Select value={it.status} onValueChange={(v) => handleStatusChange(it.id, v as ItemStatus)} disabled={isLoading || boardLoading}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ItemStatus.UNPACKED}>UNPACKED</SelectItem>
                    <SelectItem value={ItemStatus.PACKED}>PACKED</SelectItem>
                    <SelectItem value={ItemStatus.TO_BUY}>TO BUY</SelectItem>
                  </SelectContent>
                </Select>
                {/* <Select value={it.luggage_id?.toString() || ""} onValueChange={(v) => handleMoveItem(it.id, v)} disabled={isLoading || boardLoading}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Move to" /></SelectTrigger>
                  <SelectContent>
                    {allBags.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
                <Button variant="ghost" onClick={() => handleDeleteItem(it.id)} disabled={isLoading || boardLoading}>Delete</Button>
              </div>
            </li>
          ))}
          {visibleItems.length === 0 && (
            <li className="text-sm text-muted-foreground">No items match this filter.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

