import { cn } from "@/lib/utils";
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
import { tripItemsRepo, tripsRepo, packingRepo } from "@/services/repos";
import { Bag, ItemStatus, TripItem, Packing } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ManageItemBagsDialog } from "@/components/ManageItemBagsDialog";

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

  const [isManageBagsDialogOpen, setIsManageBagsDialogOpen] = useState(false);
  const [itemToManageBagsFor, setItemToManageBagsFor] = useState<TripItem | null>(null);

  const [bags, setBags] = useState<Bag[]>([]);
  const [isLoadingBags, setIsLoadingBags] = useState(false);
  const [selectedBagId, setSelectedBagId] = useState<string | undefined>(undefined);

  const [allPackingItems, setAllPackingItems] = useState<TripItem[]>([]);
  const [isLoadingAllPackingItems, setIsLoadingAllPackingItems] = useState(false);
  const [packingList, setPackingList] = useState<Packing[]>([]);


  const fetchBags = useCallback(async () => {
    if (!tripId) return;
    setIsLoadingBags(true);
    try {
      const response = await tripsRepo.listTripBags(tripId);
      setBags(response);
      if (response.length > 0 && !selectedBagId) {
        setSelectedBagId(response[0].id.toString());
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
      const response = await tripItemsRepo.listTripItems(tripId);
      setAllPackingItems(response);
    } catch (error) {
      console.error("Failed to fetch all packing items:", error);
      toast.error("Failed to load all packing items.");
    } finally {
      setIsLoadingAllPackingItems(false);
    }
  }, [tripId]);

  const fetchPackingList = useCallback(async () => {
    if (!tripId) return;
    try {
      const response = await packingRepo.listPacking(tripId);
      setPackingList(response);
    } catch (error) {
      console.error("Failed to fetch packing list:", error);
      toast.error("Failed to load packing list.");
    }
  }, [tripId]);

  useEffect(() => {
    fetchBags();
    fetchAllPackingItems();
    fetchPackingList();
  }, [tripId, fetchBags, fetchAllPackingItems, fetchPackingList]);



  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Trip Packing</h1>
      </header>

      <div className="flex gap-6">
        <div className="w-1/4">
          <h2 className="text-xl font-bold mb-4">All Trip Items</h2>
          {isLoadingAllPackingItems ? (
            <p>Loading all items...</p>
          ) : allPackingItems.length === 0 ? (
            <p>No items in this trip.</p>
          ) : (
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <div className="p-4">
                {allPackingItems.map((item) => {
                  const isAssociated = packingList.some(p => p.item_id === item.item_id);
                  return (
                    item.item && (
                      <React.Fragment key={item.item_id}>
                        <Card className={`mb-2 ${isAssociated ? 'bg-green-100' : ''}`}>
                          <CardHeader className="p-2">
                            <CardTitle className="text-sm">{item.item.name} (x{item.quantity})</CardTitle>
                          </CardHeader>
                          <CardContent className="p-2 pt-0">
                            <Button
                              variant={isAssociated ? "default" : "outline"} // Keep variant based on association
                              size="sm"
                              className={cn("mt-2 text-black", isAssociated && "bg-green-100" )}
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
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </div>

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
            fetchAllPackingItems();
            fetchBags();
            fetchPackingList();
          }}
        />
      )}
    </main>
  );
}

function BagColumn({ bag, filter, onChange, isLoading: boardLoading, tripId }: { bag: Bag; filter: ItemStatus | "ALL"; onChange: () => void; isLoading: boolean; tripId: string }) {
  const [items, setItems] = useState<Packing[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await packingRepo.listPacking(tripId);
      const filteredItems = response.filter(packingItem => packingItem.item && packingItem.bag.id === bag.id);
      setItems(filteredItems);
    } catch (error) {
      console.error(`Failed to fetch items for bag ${bag.name}:`, error);
      toast.error(`Failed to load items for ${bag.name}.`);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [tripId, bag.name, bag.id]);

  useEffect(() => { refresh(); }, [bag.id, refresh]);

  const startEditing = (item: Packing) => {
    setEditingItemId(item.item_id);
    setEditedQuantity(item.quantity);
  };

  const saveEdit = async (itemId: number, bagId: number) => {
    setIsLoading(true);
    try {
      await packingRepo.updatePacking(tripId, itemId, bagId, { quantity: editedQuantity });
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

  const handleStatusChange = async (itemId: number, bagId: number, newStatus: ItemStatus) => {
    setIsLoading(true);
    try {
      await packingRepo.updatePacking(tripId, itemId, bagId, { status: newStatus });
      toast.success("Item status updated!");
      refresh();
      onChange();
    } catch (error) {
      console.error("Failed to update item status:", error);
      toast.error("Failed to update item status.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteItem = async (itemId: number, bagId: number) => {
    setIsLoading(true);
    try {
      await packingRepo.deletePacking(tripId, itemId, bagId);
      setItems((prev) => prev.filter((item) => item.item_id !== itemId));
      toast.success("Item deleted!");
      onChange();
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item.");
    } finally {
      setIsLoading(false);
    }
  };


  const visibleItems = items.filter((it) => {
    if (filter === "ALL") return true;
    return (it.status === ItemStatus.PACKED && filter === ItemStatus.PACKED) || (it.status === ItemStatus.UNPACKED && filter === ItemStatus.UNPACKED);
  });

  return (
    <Card className="flex flex-col">
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {visibleItems.map((it) => (
            <li key={it.item.id} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center gap-3">
                <Badge variant={badgeVariant(it.status)}>{it.status.replace("_", " ")}</Badge>
                <span className="font-medium">{it.item.name}</span>
                {editingItemId === it.item_id ? (
                  <Input type="number" min={1} value={editedQuantity} onChange={(e) => setEditedQuantity(Number(e.target.value))} className="w-16" disabled={isLoading || boardLoading} />
                ) : (
                  <span className="text-muted-foreground">×{it.quantity}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingItemId === it.item_id ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => saveEdit(it.item_id, it.bag_id)} disabled={isLoading || boardLoading || editedQuantity < 1}>
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
                <Select value={it.status} onValueChange={(v) => handleStatusChange(it.item_id, it.bag_id, v as ItemStatus)} disabled={isLoading || boardLoading}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ItemStatus.UNPACKED}>UNPACKED</SelectItem>
                    <SelectItem value={ItemStatus.PACKED}>PACKED</SelectItem>
                    <SelectItem value={ItemStatus.TO_BUY}>TO BUY</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={() => handleDeleteItem(it.item_id, it.bag_id)} disabled={isLoading || boardLoading}>Delete</Button>
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

