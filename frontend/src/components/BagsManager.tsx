import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bag, ID } from "@/types";
import { bagsRepo, tripsRepo } from "@/services/repos";

interface BagsManagerProps {
  tripId: ID;
  bags: Bag[];
  refreshTripDetails: () => void;
}

export function BagsManager({ tripId, bags, refreshTripDetails }: BagsManagerProps) {
  const [allBags, setAllBags] = useState<Bag[]>([]);
  const [selectedBagId, setSelectedBagId] = useState<ID | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllBags = async () => {
    setIsLoading(true);
    try {
      const response = await bagsRepo.listBags();
      setAllBags(response);
    } catch (error) {
      console.error("Failed to fetch all bags:", error);
      toast.error("Failed to load available bags.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBags();
  }, []);

  const handleAddBagToTrip = async () => {
    if (selectedBagId === "") return;
    setIsLoading(true);
    try {
      await tripsRepo.addTripBag(tripId, selectedBagId as ID);
      toast.success("Bag added to trip successfully!");
      setSelectedBagId("");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to add bag to trip:", error);
      toast.error("Failed to add bag to trip.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBagFromTrip = async (bagId: ID) => {
    if (!confirm("Remove this bag from the trip?")) return;
    setIsLoading(true);
    try {
      await tripsRepo.removeTripBag(tripId, bagId);
      toast.success("Bag removed from trip successfully!");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to remove bag from trip:", error);
      toast.error("Failed to remove bag from trip.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableBags = allBags.filter(
    (template) => !bags.some((bag) => bag.id === template.id)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Add Bag to Trip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedBagId.toString()}
            onValueChange={(value) => setSelectedBagId(parseInt(value))}
            disabled={isLoading || availableBags.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a bag" />
            </SelectTrigger>
            <SelectContent>
              {availableBags.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name} ({template.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddBagToTrip}
            disabled={isLoading || selectedBagId === ""}
            className="w-full"
          >
            {isLoading ? "Adding..." : "Add Bag"}
          </Button>
        </CardContent>
      </Card>

      {bags.map((bag) => (
        <Card key={bag.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{bag.name}</span>
              <Button
                variant="ghost"
                onClick={() => handleRemoveBagFromTrip(bag.id)}
                disabled={isLoading}
              >
                Remove
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Type: {bag.type}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
