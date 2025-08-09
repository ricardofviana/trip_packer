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

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | undefined>();
  const [bags, setBags] = useState<Bag[]>([]);
  const [overview, setOverview] = useState<{ total: number; PACKED: number; UNPACKED: number; TO_BUY: number } | undefined>();
  const [allLuggageTemplates, setAllLuggageTemplates] = useState<LuggageTemplate[]>([]);
  const [allItemsTemplates, setAllItemsTemplates] = useState<ItemTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    if (!tripId) return;
    setIsLoading(true);
    try {
      const tripResponse = await tripsRepo.getTrip(tripId);
      setTrip(tripResponse.data);
      const bagsResponse = await tripsRepo.getTripLuggage(tripId);
      setBags(bagsResponse.data);
      const overviewResponse = await tripsRepo.getTripOverview(tripId);
      setOverview(overviewResponse.data);
      const allLuggageResponse = await luggageRepo.listLuggage();
      setAllLuggageTemplates(allLuggageResponse.data);
      const allItemsResponse = await itemsRepo.listItems();
      setAllItemsTemplates(allItemsResponse.data);
    } catch (error) {
      console.error("Failed to fetch trip details:", error);
      toast.error("Failed to load trip details.");
    } finally {
      setIsLoading(false);
    }
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
          <Button variant="secondary" onClick={() => navigate("/trips")} disabled={isLoading}>All trips</Button>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">All Available Luggage Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allLuggageTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Type: {template.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">All Available Item Templates</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allItemsTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Category: {template.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}





