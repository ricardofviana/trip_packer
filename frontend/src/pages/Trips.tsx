import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Luggage } from "lucide-react";
import { tripsRepo } from "@/services/repos/tripsRepo";
import type { Trip } from "@/types";

function durationDays(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

export default function TripsPage() {
  console.log("TripsPage: Component rendering");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [name, setName] = useState("");
  const [start, setStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState<string>(new Date().toISOString().slice(0, 10));
  const navigate = useNavigate();

  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedStart, setEditedStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [editedEnd, setEditedEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  const fetchTrips = async () => {
    const response = await tripsRepo.listTrips();
    console.log("TripsPage: API response data", response.data);
    setTrips(response.data);
  };

  useEffect(() => {
    document.title = "Trips — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage trips and get a quick overview of packing.");
    fetchTrips();
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0 && start <= end, [name, start, end]);
  const canSave = useMemo(() => editedName.trim().length > 0 && editedStart <= editedEnd, [editedName, editedStart, editedEnd]);

  const handleCreate = async () => {
    if (!canCreate) return;
    const response = await tripsRepo.createTrip({ name: name.trim(), start_date: start, end_date: end });
    fetchTrips();
    navigate(`/trips/${response.data.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip? This also removes its luggage and items.")) return;
    await tripsRepo.deleteTrip(id);
    fetchTrips();
  };

  const startEditing = (trip: Trip) => {
    setEditingTripId(trip.id);
    setEditedName(trip.name);
    setEditedStart(trip.start_date);
    setEditedEnd(trip.end_date);
  };

  const saveEdit = async (id: string) => {
    if (!canSave) return;
    await tripsRepo.updateTrip(id, { name: editedName.trim(), start_date: editedStart, end_date: editedEnd });
    setEditingTripId(null);
    fetchTrips();
  };

  const cancelEdit = () => {
    setEditingTripId(null);
  };

  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Luggage className="w-8 h-8" /> Your Trips
        </h1>
        <Button asChild variant="secondary">
          <Link to="/">Home</Link>
        </Button>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create a trip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Summer in Italy" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="start">Start</Label>
                <Input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End</Label>
                <Input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={!canCreate} className="w-full">Create & start packing</Button>
          </CardContent>
        </Card>

        {Array.isArray(trips) && trips.map((t) => (
          <Card key={t.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingTripId === t.id ? (
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                ) : (
                  <span>{t.name}</span>
                )}
                <div className="flex gap-2">
                  {editingTripId === t.id ? (
                    <>
                      <Button variant="outline" onClick={() => saveEdit(t.id)} disabled={!canSave}>Save</Button>
                      <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => startEditing(t)}>Edit</Button>
                  )}
                  <Button variant="ghost" onClick={() => handleDelete(t.id)}>Delete</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingTripId === t.id ? (
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="editedStart">Start</Label>
                    <Input id="editedStart" type="date" value={editedStart} onChange={(e) => setEditedStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editedEnd">End</Label>
                    <Input id="editedEnd" type="date" value={editedEnd} onChange={(e) => setEditedEnd(e.target.value)} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-2">{formatRange(t.start_date, t.end_date)} · {durationDays(t.start_date, t.end_date)} days</p>
              )}
              <Separator className="my-3" />
              <Button asChild variant="secondary" className="w-full"> 
                <Link to={`/trips/${t.id}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
