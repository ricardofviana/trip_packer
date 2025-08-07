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
import { listTripLuggage, addTripLuggage, removeTripLuggage } from "@/services/repos/tripLuggageRepo";
import { listLuggageItems, addLuggageItem, updateLuggageItemStatus, deleteLuggageItem, moveLuggageItem } from "@/services/repos/packingRepo";
import type { Bag, Item, ItemStatus, Trip } from "@/types";

const STATUS_OPTIONS: ItemStatus[] = ["UNPACKED", "PACKED", "TO_BUY"];

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | undefined>();
  const [bags, setBags] = useState<Bag[]>([]);
  const [filter, setFilter] = useState<ItemStatus | "ALL">("ALL");

  const refresh = () => {
    if (!tripId) return;
    setTrip(getTrip(tripId));
    setBags(listTripLuggage(tripId));
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

  const overview = useMemo(() => (tripId ? getTripOverview(tripId) : undefined), [tripId, bags]);

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
  const [bags, setBags] = useState<Bag[]>(listTripLuggage(tripId));
  const [newBag, setNewBag] = useState("");

  const refresh = () => {
    setBags(listTripLuggage(tripId));
    onChange();
  };

  const addBag = () => {
    const name = newBag.trim();
    if (!name) return;
    addTripLuggage(tripId, name);
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
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [status, setStatus] = useState<ItemStatus>("UNPACKED");

  const refresh = () => setItems(listLuggageItems(bag.id));

  useEffect(() => { refresh(); }, [bag.id]);

  const addItem = () => {
    const n = name.trim();
    if (!n) return;
    addLuggageItem(bag.id, { name: n, quantity: qty || 1, status });
    setName("");
    setQty(1);
    setStatus("UNPACKED");
    refresh();
    onChange();
  };

  const visible = items.filter((i) => filter === "ALL" ? true : i.status === filter);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{bag.name}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{items.length} items</Badge>
            <Button variant="ghost" onClick={() => { if (confirm("Delete this bag and its items?")) { removeTripLuggage(bag.trip_id, bag.id); onChange(); } }}>Delete</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-2 text-left">
          <div className="col-span-12">
            <Label htmlFor={`item-${bag.id}`}>Add item</Label>
          </div>
          <div className="col-span-6">
            <Input id={`item-${bag.id}`} placeholder="T-shirt" value={name} onChange={(e) => setName(e.target.value)} />
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
                <span className="font-medium">{it.name}</span>
                <span className="text-muted-foreground">×{it.quantity}</span>
              </div>
              <div className="flex items-center gap-2">
                <Select value={it.status} onValueChange={(v) => { updateLuggageItemStatus(bag.id, it.id, v as ItemStatus); refresh(); onChange(); }}>
                  <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={it.luggage_id} onValueChange={(v) => { if (v !== it.luggage_id) { moveLuggageItem(it.id, it.luggage_id, v); refresh(); onChange(); } }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Move to" /></SelectTrigger>
                  <SelectContent>
                    {allBags.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={() => { if (confirm("Delete item?")) { deleteLuggageItem(bag.id, it.id); refresh(); onChange(); } }}>Delete</Button>
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
