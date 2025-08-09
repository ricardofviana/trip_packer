import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { luggageRepo, type LuggageTemplate } from "@/services/repos/luggageRepo";
import { LuggageType } from "@/types";

export default function LuggageTemplatesPage() {
  const [bag, setLuggage] = useState<LuggageTemplate[]>([]);
  const [category, setCategory] = useState(LuggageType.BACKPACK);
  const [name, setName] = useState("");
  const [editingLuggageId, setEditingLuggageId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchLuggage = async () => {
    const response = await luggageRepo.listLuggage();
    console.log("LuggageTemplatesPage: API response data", response.data);
    setLuggage(response.data);
  };

  useEffect(() => {
    document.title = "Bag Templates — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage reusable bag templates to quickly build trips.");
    fetchLuggage();
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0, [name]);
  const canSave = useMemo(() => editedName.trim().length > 0, [editedName]);

  const add = async () => {
    if (!canCreate) return;
    await luggageRepo.createLuggage({ name: name.trim(), type: category as LuggageType });
    setName("");
    fetchLuggage();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this bag template?")) return;
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
        <h1 className="text-3xl font-bold">Bag templates</h1>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create bag template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Backpack" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="category">Category</Label>
              <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as LuggageType)}
                    disabled={isLoading}
                  >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(LuggageType).map((cat: LuggageType) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={add} disabled={!canCreate} className="w-full">Create</Button>
          </CardContent>
        </Card>

        {Array.isArray(bag) && bag.map((lg) => (
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
              <p className="text-sm text-muted-foreground">Reusable bag template</p>
              <Separator className="my-3" />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
