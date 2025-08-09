import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { tripsRepo } from "@/services/repos/tripsRepo";
import { luggageRepo } from "@/services/repos/luggageRepo";
import { packingRepo } from "@/services/repos/packingRepo";
import { tripLuggageRepo } from "@/services/repos/tripLuggageRepo";
import { itemsRepo } from "@/services/repos/itemsRepo";
import type { Bag, Item, ItemStatus, Trip, ItemTemplate, LuggageType } from "@/types";

export default function TripsPackingPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const response = await tripsRepo.listTrips();
      setTrips(response.data);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
      toast.error("Failed to load trips.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Trip Packing</h1>
        <div className="flex gap-3">
          <Select value={selectedTripId} onValueChange={setSelectedTripId} disabled={isLoading}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select a trip" /></SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id.toString()}>{trip.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {selectedTripId && (
        <LuggageBoard tripId={selectedTripId} filter="ALL" onChange={() => {}} isLoading={isLoading} />
      )}
    </main>
  );
}

function LuggageBoard({ tripId, filter, onChange, isLoading: pageLoading }: { tripId: string; filter: ItemStatus | "ALL"; onChange: () => void; isLoading: boolean }) {
  const [bags, setBags] = useState<Bag[]>([]);
  const [newBag, setNewBag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const response = await tripsRepo.getTripLuggage(tripId);
      setBags(response.data);
      onChange(); // Notify parent to refresh overview
    } catch (error) {
      console.error("Failed to fetch bags:", error);
      toast.error("Failed to load bag.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [tripId]);

  const addBag = async () => {
    const name = newBag.trim();
    if (!name) return;
    setIsLoading(true);
    try {
      // Assuming a default LuggageType for now, or add a select for it
      const newLuggageResponse = await luggageRepo.createLuggage({ name, type: LuggageType.CARRY_ON });
      await tripLuggageRepo.addTripLuggage(tripId, newLuggageResponse.data.id);
      setBags((prev) => [...prev, { ...newLuggageResponse.data, trip_id: parseInt(tripId) }]);
      setNewBag("");
      toast.success("Bag added successfully!");
      onChange(); // Notify parent to refresh overview
    } catch (error) {
      console.error("Failed to add bag:", error);
      toast.error("Failed to add bag.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Add bag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="bag">Bag name</Label>
            <Input id="bag" placeholder="Carry-on" value={newBag} onChange={(e) => setNewBag(e.target.value)} disabled={isLoading || pageLoading} />
          </div>
          <Button onClick={addBag} className="w-full" disabled={isLoading || pageLoading || !newBag.trim()}>
            {isLoading ? "Adding..." : "Add bag"}
          </Button>
        </CardContent>
      </Card>

      {bags.map((b) => (
        <BagColumn key={b.id} bag={b} filter={filter} allBags={bags} onChange={onChange} isLoading={pageLoading || isLoading} />
      ))}
    </section>
  );
}

function BagColumn({ bag, filter, allBags, onChange, isLoading: boardLoading }: { bag: Bag; filter: ItemStatus | "ALL"; allBags: Bag[]; onChange: () => void; isLoading: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [itemTemplates, setItemTemplates] = useState<ItemTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | "">(""); // Changed to string for Select value
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [isPacked, setIsPacked] = useState<boolean>(false);

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedQty, setEditedQty] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const response = await packingRepo.listLuggageItems(bag.id);
      // Ensure is_packed is correctly mapped from backend response
      setItems(response.data.map(item => ({ ...item, status: item.is_packed ? ItemStatus.PACKED : ItemStatus.UNPACKED })));
      const templatesResponse = await itemsRepo.listItems();
      setItemTemplates(templatesResponse.data);
    } catch (error) {
      console.error(`Failed to fetch items for bag ${bag.name}:`, error);
      toast.error(`Failed to load items for ${bag.name}.`);
      setItems([]); // Ensure items is always an array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [bag.id]);

  const addItem = async () => {
    setIsLoading(true);
    try {
      let finalItemId: number;
      let finalItemName: string;

      if (selectedTemplateId) {
        finalItemId = parseInt(selectedTemplateId);
        finalItemName = itemTemplates.find(t => t.id === finalItemId)?.name || "";
      } else {
        const n = name.trim();
        if (!n) {
          toast.error("Item name cannot be empty.");
          return;
        }
        const newItemTemplate = await itemsRepo.createItem({ name: n, category: "OTHER" }); // Default category
        finalItemId = newItemTemplate.data.id;
        finalItemName = newItemTemplate.data.name;
      }

      const response = await packingRepo.addLuggageItem(bag.id, { item_id: finalItemId, quantity: qty || 1, is_packed: isPacked });
      setItems((prev) => [...prev, { ...response.data, status: response.data.is_packed ? ItemStatus.PACKED : ItemStatus.UNPACKED }]);
      setName("");
      setQty(1);
      setIsPacked(false);
      setSelectedTemplateId("");
      toast.success("Item added to bag!");
      onChange(); // Notify parent to refresh overview
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item to bag.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (item: Item) => {
    setEditingItemId(item.id);
    setEditedName(item.name);
    setEditedQty(item.quantity);
  };

  const saveEdit = async (itemId: number) => {
    if (!editedName.trim()) {
      toast.error("Item name cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await packingRepo.updateLuggageItem(bag.id, itemId, { name: editedName.trim(), quantity: editedQty });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...response.data, status: response.data.is_packed ? ItemStatus.PACKED : ItemStatus.UNPACKED } : item
        )
      );
      setEditingItemId(null);
      toast.success("Item updated!");
      onChange();
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  const handleStatusChange = async (itemId: number, newStatus: boolean) => {
    setIsLoading(true);
    try {
      const response = await packingRepo.updateLuggageItemStatus(bag.id, itemId, { is_packed: newStatus });
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...response.data, status: response.data.is_packed ? ItemStatus.PACKED : ItemStatus.UNPACKED } : item
        )
      );
      toast.success("Item status updated!");
      onChange(); // Refresh overview
    } catch (error) {
      console.error("Failed to update item status:", error);
      toast.error("Failed to update item status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveItem = async (itemId: number, newLuggageId: string) => {
    setIsLoading(true);
    try {
      await packingRepo.updateLuggageItem(bag.id, itemId, { luggage_id: parseInt(newLuggageId) });
      setItems((prev) => prev.filter((item) => item.id !== itemId)); // Remove from current bag
      toast.success("Item moved successfully!");
      onChange(); // Trigger full refresh to update all bags
    } catch (error) {
      console.error("Failed to move item:", error);
      toast.error("Failed to move item.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    setIsLoading(true);
    try {
      await packingRepo.deleteLuggageItem(bag.id, itemId);
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

  const handleDeleteBag = async () => {
    setIsLoading(true);
    try {
      await tripLuggageRepo.removeTripLuggage(bag.trip_id, bag.id);
      toast.success("Bag deleted!");
      onChange(); // Trigger full refresh to remove bag from UI
    } catch (error) {
      console.error("Failed to delete bag:", error);
      toast.error("Failed to delete bag.");
    } finally {
      setIsLoading(false);
    }
  };

  const visibleItems = items.filter((it) => {
    if (filter === "ALL") return true;
    return (it.is_packed && filter === ItemStatus.PACKED) || (!it.is_packed && filter === ItemStatus.UNPACKED);
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{bag.name}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{items.length} items</Badge>
            <Button variant="ghost" onClick={handleDeleteBag} disabled={isLoading || boardLoading}>Delete</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-2 text-left">
          <div className="col-span-12">
            <Label htmlFor={`item-${bag.id}`}>Add item</Label>
          </div>
          <div className="col-span-12">
            <Select value={selectedTemplateId} onValueChange={(v) => setSelectedTemplateId(v)} disabled={isLoading || boardLoading}>
              <SelectTrigger><SelectValue placeholder="Select from templates" /></SelectTrigger>
              <SelectContent>
                {itemTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-6">
            <Input id={`item-${bag.id}`} placeholder="T-shirt" value={name} onChange={(e) => setName(e.target.value)} disabled={!!selectedTemplateId || isLoading || boardLoading} />
          </div>
          <div className="col-span-3">
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={isLoading || boardLoading} />
          </div>
          <div className="col-span-3">
            <Select value={isPacked ? "PACKED" : "UNPACKED"} onValueChange={(v) => setIsPacked(v === "PACKED")} disabled={isLoading || boardLoading}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UNPACKED">UNPACKED</SelectItem>
                <SelectItem value="PACKED">PACKED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12">
            <Button className="w-full" onClick={addItem} disabled={isLoading || boardLoading || (!selectedTemplateId && !name.trim())}>
              {isLoading ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>

        <Separator className="my-2" />

        <ul className="space-y-2">
          {visibleItems.map((it) => (
            <li key={it.id} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center gap-3">
                <Badge variant={badgeVariant(it.is_packed)}>{it.status.replace("_", " ")}</Badge>
                {editingItemId === it.id ? (
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-32" disabled={isLoading || boardLoading} />
                ) : (
                  <span className="font-medium">{it.name}</span>
                )}
                {editingItemId === it.id ? (
                  <Input type="number" min={1} value={editedQty} onChange={(e) => setEditedQty(Number(e.target.value))} className="w-16" disabled={isLoading || boardLoading} />
                ) : (
                  <span className="text-muted-foreground">×{it.quantity}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingItemId === it.id ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => saveEdit(it.id)} disabled={isLoading || boardLoading || !editedName.trim()}>
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
                <Select value={it.is_packed ? "PACKED" : "UNPACKED"} onValueChange={(v) => handleStatusChange(it.id, v === "PACKED")} disabled={isLoading || boardLoading}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNPACKED">UNPACKED</SelectItem>
                    <SelectItem value="PACKED">PACKED</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={it.luggage_id?.toString() || ""} onValueChange={(v) => handleMoveItem(it.id, v)} disabled={isLoading || boardLoading}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Move to" /></SelectTrigger>
                  <SelectContent>
                    {allBags.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={() => handleDeleteItem(it.id)} disabled={isLoading || boardLoading}>Delete</Button>
              </div>
            </li>
          ))}
          {visibleItems.length === 0 && ( // Changed from 'visible' to 'visibleItems'
            <li className="text-sm text-muted-foreground">No items match this filter.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function badgeVariant(status: ItemStatus): "secondary" | "default" | "destructive" {
  switch (status) {
    case ItemStatus.PACKED:
      return "secondary";
    case ItemStatus.UNPACKED:
      return "default";
    case ItemStatus.TO_BUY:
      return "destructive";
    default:
      return "secondary";
  }
}

