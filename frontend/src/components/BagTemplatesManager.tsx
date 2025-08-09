import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BagTemplate, ID } from "@/types";
import { bagTemplatesRepo } from "@/services/repos/bagTemplatesRepo";
import { tripsRepo } from "@/services/repos/tripsRepo";

interface BagTemplatesManagerProps {
  tripId: ID;
  bags: BagTemplate[];
  refreshTripDetails: () => void;
}

export function BagTemplatesManager({ tripId, bags, refreshTripDetails }: BagTemplatesManagerProps) {
  const [allBagTemplates, setAllBagTemplates] = useState<BagTemplate[]>([]);
  const [selectedBagTemplateId, setSelectedBagTemplateId] = useState<ID | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllBagTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await bagTemplatesRepo.listBags();
      setAllBagTemplates(response.data);
    } catch (error) {
      console.error("Failed to fetch all bag templates:", error);
      toast.error("Failed to load available bag templates.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBagTemplates();
  }, []);

  const handleAddBagToTrip = async () => {
    if (selectedBagTemplateId === "") return;
    setIsLoading(true);
    try {
      await tripsRepo.addBagToTrip(tripId, selectedBagTemplateId as ID);
      toast.success("Bag added to trip successfully!");
      setSelectedBagTemplateId("");
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
      await tripsRepo.removeBagFromTrip(tripId, bagId);
      toast.success("Bag removed from trip successfully!");
      refreshTripDetails();
    } catch (error) {
      console.error("Failed to remove bag from trip:", error);
      toast.error("Failed to remove bag from trip.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableBagTemplates = allBagTemplates.filter(
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
            value={selectedBagTemplateId.toString()}
            onValueChange={(value) => setSelectedBagTemplateId(parseInt(value))}
            disabled={isLoading || availableBagTemplates.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a bag template" />
            </SelectTrigger>
            <SelectContent>
              {availableBagTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name} ({template.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddBagToTrip}
            disabled={isLoading || selectedBagTemplateId === ""}
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
