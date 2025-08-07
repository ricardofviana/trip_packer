import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { luggageRepo, type LuggageTemplate } from "@/services/repos/luggageRepo";

export default function LuggageTemplatesPage() {
  const [luggage, setLuggage] = useState<LuggageTemplate[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    document.title = "Luggage Templates — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage reusable luggage templates to quickly build trips.");
    setLuggage(luggageRepo.listLuggage());
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0, [name]);

  const add = () => {
    if (!canCreate) return;
    luggageRepo.createLuggage({ name: name.trim() });
    setName("");
    setLuggage(luggageRepo.listLuggage());
  };

  const remove = (id: string) => {
    if (!confirm("Delete this luggage template?")) return;
    luggageRepo.deleteLuggage(id);
    setLuggage(luggageRepo.listLuggage());
  };

  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Luggage templates</h1>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create luggage template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Carry-on" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button onClick={add} disabled={!canCreate} className="w-full">Create</Button>
          </CardContent>
        </Card>

        {luggage.map((lg) => (
          <Card key={lg.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{lg.name}</span>
                <Button variant="ghost" onClick={() => remove(lg.id)}>Delete</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Reusable luggage template</p>
              <Separator className="my-3" />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
