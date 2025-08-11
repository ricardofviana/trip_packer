import { BagTemplate, ID } from "@/types";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { addBagToTrip, removeBagFromTrip } from "@/services/api";

interface TripBagsDisplayProps {
  tripBags: BagTemplate[];
  allBags: BagTemplate[];
  tripId: ID;
  refreshTripDetails: () => void;
}

export function TripBagsDisplay({ tripBags, allBags, tripId, refreshTripDetails }: TripBagsDisplayProps) {
  const handleAddBag = async (bagId: ID) => {
    try {
      await addBagToTrip(tripId, bagId);
      toast.success("Bag added to trip.");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to add bag to trip:", error);
      toast.error("Failed to add bag to trip.");
    }
  };

  const handleRemoveBag = async (bagId: ID) => {
    try {
      await removeBagFromTrip(tripId, bagId);
      toast.success("Bag removed from trip.");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to remove bag from trip:", error);
      toast.error("Failed to remove bag from trip.");
    }
  };

  return (
    <div className="space-y-4">
      {allBags.length === 0 ? (
        <p className="text-muted-foreground">No bags available to add.</p>
      ) : (
        allBags.map((bag) => {
          const isAssociated = tripBags.some((tripBag) => tripBag.id === bag.id);
          return (
            <div key={bag.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-semibold">{bag.name}</p>
                <p className="text-sm text-muted-foreground">{bag.type.replace(/_/g, ' ')}</p>
              </div>
              <div>
                {isAssociated ? (
                  <Button variant="destructive" onClick={() => handleRemoveBag(bag.id)}>
                    Remove
                  </Button>
                ) : (
                  <Button onClick={() => handleAddBag(bag.id)}>
                    Add
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}