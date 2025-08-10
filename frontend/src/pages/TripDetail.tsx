import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { tripsRepo } from "@/services/repos/tripsRepo";
import { packingRepo } from "@/services/repos/packingRepo";
import { itemsRepo } from "@/services/repos/itemsRepo";
import { TripDetail as TripDetailType, ItemStatus } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TripBagsDisplay } from "@/components/TripBagsDisplay";
import { TripPackingListDisplay } from "@/components/TripPackingListDisplay";

export default function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripDetailType | undefined>();
  const [allItems, setAllItems] = useState<ItemTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTripDetails = useCallback(async () => {
    if (!tripId) return;
    setIsLoading(true);
    try {
      const tripResponse = await tripsRepo.getTrip(tripId);
      setTrip(tripResponse.data);

      const itemsResponse = await itemsRepo.listItems();
      setAllItems(itemsResponse.data);
    } catch (error) {
      console.error("Failed to fetch trip details or items:", error);
      toast.error("Failed to load trip details or items.");
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  const handleQuantityChange = useCallback(async (packingItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1
    try {
      await packingRepo.updatePackingItem(packingItemId, { quantity: newQuantity });
      toast.success("Item quantity updated.");
      refreshTripDetails(); // Refresh to get updated data
    } catch (error) {
      console.error("Failed to update item quantity:", error);
      toast.error("Failed to update item quantity.");
    }
  }, [refreshTripDetails]);

  const handleRemoveItem = useCallback(async (packingItemId: number) => {
    if (!tripId) return;
    try {
      await packingRepo.removeItemFromPackingList(parseInt(tripId), packingItemId);
      toast.success("Item removed from packing list.");
      refreshTripDetails(); // Refresh to get updated data
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item.");
    }
  }, [tripId, refreshTripDetails]);

  const handleAddItem = useCallback(async (itemId: number) => {
    if (!tripId) return;
    try {
      await packingRepo.addItemToPackingList(parseInt(tripId), { item_id: itemId, quantity: 1 }); // Default quantity to 1
      toast.success("Item added to packing list.");
      refreshTripDetails(); // Refresh to get updated data
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item.");
    }
  }, [tripId, refreshTripDetails]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Bags Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Bags for this Trip</h2>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <TripBagsDisplay bags={trip.bags} />
          </ScrollArea>
        </section>

        {/* Packing List Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Items for this Trip</h2>
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <TripPackingListDisplay
              packingList={trip.packing_list}
              allItems={allItems}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onAddItem={handleAddItem}
            />
          </ScrollArea>
        </section>
      </div>
    </main>
  );
}