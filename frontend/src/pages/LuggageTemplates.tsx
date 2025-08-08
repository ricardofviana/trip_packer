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
  const [editingLuggageId, setEditingLuggageId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  const fetchLuggage = async () => {
    const response = await luggageRepo.listLuggage();
    console.log("LuggageTemplatesPage: API response data", response.data);
    setLuggage(response.data);
  };

  useEffect(() => {
    document.title = "Luggage Templates — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage reusable luggage templates to quickly build trips.");
    fetchLuggage();
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0, [name]);
  const canSave = useMemo(() => editedName.trim().length > 0, [editedName]);

  const add = async () => {
    if (!canCreate) return;
    await luggageRepo.createLuggage({ name: name.trim(), type: "" }); // Assuming type is not critical for now
    setName("");
    fetchLuggage();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this luggage template?")) return;
    await luggageRepo.deleteLuggage(id);
    fetchLuggage();
  };

  const startEditing = (lg: LuggageTemplate) => {
    setEditingLuggageId(lg.id);
    setEditedName(lg.name);
  };

  const saveEdit = async (id: number) => {
    if (!canSave) return;
    await luggageRepo.updateLuggage(id, { name: editedName.trim() });
    setEditingLuggageId(null);
    fetchLuggage();
  };

  const cancelEdit = () => {
    setEditingLuggageId(null);
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

        {Array.isArray(luggage) && luggage.map((lg) => (
          <Card key={lg.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingLuggageId === lg.id ? (
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                ) : (
                  <span>{lg.name}</span>
                )}
                <div className="flex gap-2">
                  {editingLuggageId === lg.id ? (
                    <>
                      <Button variant="outline" onClick={() => saveEdit(lg.id)} disabled={!canSave}>Save</Button>
                      <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => startEditing(lg)}>Edit</Button>
                  )}
                  <Button variant="ghost" onClick={() => remove(lg.id)}>Delete</Button>
                </div>
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
