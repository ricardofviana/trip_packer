import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { listTrips, createTrip, deleteTrip } from "@/services/tripPacker";
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
  const [trips, setTrips] = useState<Trip[]>([]);
  const [name, setName] = useState("");
  const [start, setStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState<string>(new Date().toISOString().slice(0, 10));
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Trips — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage trips and get a quick overview of packing.");
    setTrips(listTrips());
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0 && start <= end, [name, start, end]);

  const handleCreate = () => {
    if (!canCreate) return;
    const trip = createTrip({ name: name.trim(), start_date: start, end_date: end });
    setTrips(listTrips());
    navigate(`/trips/${trip.id}`);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this trip? This also removes its luggage and items.")) return;
    deleteTrip(id);
    setTrips(listTrips());
  };

  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Trips</h1>
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

        {trips.map((t) => (
          <Card key={t.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.name}</span>
                <Button variant="ghost" onClick={() => handleDelete(t.id)}>Delete</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{formatRange(t.start_date, t.end_date)} · {durationDays(t.start_date, t.end_date)} days</p>
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
