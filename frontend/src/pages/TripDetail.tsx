import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { tripsRepo } from "@/services/repos/tripsRepo";
import { TripDetail as TripDetailType, ItemStatus } from "@/types";
import { BagTemplatesManager } from "@/components/BagTemplatesManager";
import { PackingListManager } from "@/components/PackingListManager";

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripDetailType | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const refreshTripDetails = useCallback(async () => {
    if (!tripId) return;
    setIsLoading(true);
    try {
      const response = await tripsRepo.getTrip(tripId);
      setTrip(response.data);
    } catch (error) {
      console.error("Failed to fetch trip details:", error);
      toast.error("Failed to load trip details.");
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refreshTripDetails();
  }, [tripId, refreshTripDetails]);

  useEffect(() => {
    document.title = trip ? `${trip.name} — Trip Packer` : "Trip — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Pack items across bag, track statuses, and review before you go.");
  }, [trip]);

  if (!trip || !tripId) {
    return (
      <main className="container py-10">
        <p className="text-muted-foreground">Trip not found.</p>
        <Button variant="secondary" onClick={() => navigate("/trips")}>Back to trips</Button>
      </main>
    );
  }

  const totalItems = trip.packing_list.length;
  const packedItems = trip.packing_list.filter(item => item.status === ItemStatus.PACKED).length;
  const unpackedItems = trip.packing_list.filter(item => item.status === ItemStatus.UNPACKED).length;
  const toBuyItems = trip.packing_list.filter(item => item.status === ItemStatus.TO_BUY).length;

  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total {totalItems} · Packed {packedItems} · Unpacked {unpackedItems} · To buy {toBuyItems}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/trips/${tripId}/packing`)} disabled={isLoading}>Go to Packing</Button>
          <Button variant="secondary" onClick={() => navigate("/trips")} disabled={isLoading}>All trips</Button>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Bags for this Trip</h2>
        <BagTemplatesManager tripId={trip.id} bags={trip.bags} refreshTripDetails={refreshTripDetails} />
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Packing List</h2>
        <PackingListManager tripId={trip.id} packingList={trip.packing_list} refreshTripDetails={refreshTripDetails} />
      </section>
    </main>
  );
}