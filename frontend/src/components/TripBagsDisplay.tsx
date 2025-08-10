import { BagTemplate } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TripBagsDisplayProps {
  bags: BagTemplate[];
}

export function TripBagsDisplay({ bags }: TripBagsDisplayProps) {
  return (
    <div className="space-y-4">
      {bags.length === 0 ? (
        <p className="text-muted-foreground">No bags added to this trip yet.</p>
      ) : (
        bags.map((bag) => (
          <div key={bag.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-semibold">{bag.name}</p>
              <p className="text-sm text-muted-foreground">{bag.type.replace(/_/g, ' ')}</p>
            </div>
            {/* ToggleGroup for selection - assuming single selection for now */}
            <ToggleGroup type="single" variant="outline" className="flex-wrap">
              <ToggleGroupItem value={bag.id.toString()} aria-label={`Toggle ${bag.name}`}>
                Select
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        ))
      )}
    </div>
  );
}