import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getTrip, getTripOverview } from "@/services/repos/tripsRepo";
import { tripsRepo } from "@/services/repos/tripsRepo";
import { luggageRepo } from "@/services/repos/luggageRepo";
import { packingRepo } from "@/services/repos/packingRepo";
import { tripLuggageRepo } from "@/services/repos/tripLuggageRepo";
import type { Bag, Item, ItemStatus, Trip } from "@/types";

const STATUS_OPTIONS: ItemStatus[] = ["UNPACKED", "PACKED", "TO_BUY"];

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | undefined>();
  const [bags, setBags] = useState<Bag[]>([]);
  const [filter, setFilter] = useState<ItemStatus | "ALL">("ALL");

  const [overview, setOverview] = useState<{ total: number; PACKED: number; UNPACKED: number; TO_BUY: number } | undefined>();

  const refresh = async () => {
    if (!tripId) return;
    const tripResponse = await tripsRepo.getTrip(tripId);
    setTrip(tripResponse.data);
    const bagsResponse = await tripsRepo.getTripLuggage(tripId);
    setBags(bagsResponse.data);
    const overviewResponse = await tripsRepo.getTripOverview(tripId);
    setOverview(overviewResponse.data);
  };

  useEffect(() => {
    if (!tripId) return;
    refresh();
  }, [tripId]);

  useEffect(() => {
    document.title = trip ? `${trip.name} — Trip Packer` : "Trip — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Pack items across luggage, track statuses, and review before you go.");
  }, [trip]);

  if (!trip || !tripId) {
    return (
      <main className="container py-10">
        <p className="text-muted-foreground">Trip not found.</p>
        <Button variant="secondary" onClick={() => navigate("/trips")}>Back to trips</Button>
      </main>
    );
  }

  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          {overview && (
            <p className="text-sm text-muted-foreground mt-1">Total {overview.total} · Packed {overview.PACKED} · Unpacked {overview.UNPACKED} · To buy {overview.TO_BUY}</p>
          )}
        </div>
        <div className="flex gap-3">
          <StatusFilter value={filter} onChange={setFilter} />
          <Button variant="secondary" onClick={() => navigate("/trips")}>All trips</Button>
        </div>
      </header>

      <LuggageBoard tripId={tripId} filter={filter} onChange={refresh} />
    </main>
  );
}

function StatusFilter({ value, onChange }: { value: ItemStatus | "ALL"; onChange: (v: ItemStatus | "ALL") => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as any)}>
      <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All items</SelectItem>
        <SelectItem value="UNPACKED">Unpacked</SelectItem>
        <SelectItem value="PACKED">Packed</SelectItem>
        <SelectItem value="TO_BUY">To buy</SelectItem>
      </SelectContent>
    </Select>
  );
}

function LuggageBoard({ tripId, filter, onChange }: { tripId: string; filter: ItemStatus | "ALL"; onChange: () => void }) {
  const [bags, setBags] = useState<Bag[]>([]);
  const [newBag, setNewBag] = useState("");

  const refresh = async () => {
    const response = await tripsRepo.getTripLuggage(tripId);
    setBags(response.data);
    onChange();
  };

  useEffect(() => { refresh(); }, [tripId]);

  const addBag = async () => {
    const name = newBag.trim();
    if (!name) return;
    const newLuggageResponse = await luggageRepo.createLuggage({ name, type: "" }); // Assuming type is not critical for now
    await tripLuggageRepo.addTripLuggage(tripId, newLuggageResponse.data.id);
    setNewBag("");
    refresh();
  };

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Add luggage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="bag">Bag name</Label>
            <Input id="bag" placeholder="Carry-on" value={newBag} onChange={(e) => setNewBag(e.target.value)} />
          </div>
          <Button onClick={addBag} className="w-full">Add bag</Button>
        </CardContent>
      </Card>

      {bags.map((b) => (
        <BagColumn key={b.id} bag={b} filter={filter} allBags={bags} onChange={refresh} />
      ))}
    </section>
  );
}

function BagColumn({ bag, filter, allBags, onChange }: { bag: Bag; filter: ItemStatus | "ALL"; allBags: Bag[]; onChange: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [itemTemplates, setItemTemplates] = useState<ItemTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [status, setStatus] = useState<ItemStatus>("UNPACKED");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedQty, setEditedQty] = useState<number>(1);

  const refresh = async () => {
    const response = await packingRepo.listLuggageItems(bag.id);
    setItems(response.data);
    const templatesResponse = await itemsRepo.listItems();
    setItemTemplates(templatesResponse.data);
  };

  useEffect(() => { refresh(); }, [bag.id]);

  const addItem = async () => {
    if (selectedTemplateId) {
      await packingRepo.addLuggageItem(bag.id, { item_id: selectedTemplateId, quantity: qty || 1 });
    } else {
      const n = name.trim();
      if (!n) return;
      const newItemTemplate = await itemsRepo.createItem({ name: n, category: "" });
      await packingRepo.addLuggageItem(bag.id, { item_id: newItemTemplate.data.id, quantity: qty || 1 });
    }
    setName("");
    setQty(1);
    setStatus("UNPACKED");
    setSelectedTemplateId("");
    refresh();
    onChange();
  };

  const startEditing = (item: Item) => {
    setEditingItemId(item.id);
    setEditedName(item.name);
    setEditedQty(item.quantity);
  };

  const saveEdit = async (itemId: string) => {
    if (!editedName.trim()) return;
    await packingRepo.updateLuggageItem(bag.id, itemId, { name: editedName.trim(), quantity: editedQty });
    setEditingItemId(null);
    refresh();
    onChange();
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  const visible = items.filter((i) => filter === "ALL" ? true : i.status === filter);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{bag.name}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{items.length} items</Badge>
            <Button variant="ghost" onClick={async () => { if (confirm("Delete this bag and its items?")) { await tripLuggageRepo.removeTripLuggage(bag.trip_id, bag.id); onChange(); } }}>Delete</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-2 text-left">
          <div className="col-span-12">
            <Label htmlFor={`item-${bag.id}`}>Add item</Label>
          </div>
          <div className="col-span-12">
            <Select value={selectedTemplateId} onValueChange={(v) => setSelectedTemplateId(v)}>
              <SelectTrigger><SelectValue placeholder="Select from templates" /></SelectTrigger>
              <SelectContent>
                {itemTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-6">
            <Input id={`item-${bag.id}`} placeholder="T-shirt" value={name} onChange={(e) => setName(e.target.value)} disabled={!!selectedTemplateId} />
          </div>
          <div className="col-span-3">
            <Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
          </div>
          <div className="col-span-3">
            <Select value={status} onValueChange={(v) => setStatus(v as ItemStatus)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12">
            <Button className="w-full" onClick={addItem}>Add</Button>
          </div>
        </div>

        <Separator className="my-2" />

        <ul className="space-y-2">
          {visible.map((it) => (
            <li key={it.id} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center gap-3">
                <Badge variant={badgeVariant(it.status)}>{it.status.replace("_", " ")}</Badge>
                {editingItemId === it.id ? (
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-32" />
                ) : (
                  <span className="font-medium">{it.name}</span>
                )}
                {editingItemId === it.id ? (
                  <Input type="number" min={1} value={editedQty} onChange={(e) => setEditedQty(Number(e.target.value))} className="w-16" />
                ) : (
                  <span className="text-muted-foreground">×{it.quantity}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingItemId === it.id ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => saveEdit(it.id)}>Save</Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                  </>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => startEditing(it)}>Edit</Button>
                )}
                <Select value={it.status} onValueChange={async (v) => { await packingRepo.updateLuggageItemStatus(bag.id, it.id, { is_packed: v === "PACKED" }); refresh(); onChange(); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={it.luggage_id} onValueChange={async (v) => { if (v !== it.luggage_id) { await packingRepo.updateLuggageItem(bag.id, it.id, { luggage_id: v }); refresh(); onChange(); } }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Move to" /></SelectTrigger>
                  <SelectContent>
                    {allBags.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={async () => { if (confirm("Delete item?")) { await packingRepo.deleteLuggageItem(bag.id, it.id); refresh(); onChange(); } }}>Delete</Button>
              </div>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="text-sm text-muted-foreground">No items match this filter.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function badgeVariant(status: ItemStatus): "secondary" | "default" | "destructive" {
  if (status === "PACKED") return "default";
  if (status === "TO_BUY") return "destructive";
  return "secondary";
}
