import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { bagTemplatesRepo } from "@/services/repos/bagTemplatesRepo";
import { BagType, BagTemplate } from "@/types";

export default function BagTemplatesPage() {
  const [bags, setBags] = useState<BagTemplate[]>([]);
  const [type, setType] = useState(BagType.BACKPACK);
  const [name, setName] = useState("");
  const [editingBagId, setEditingBagId] = useState<ID | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedType, setEditedType] = useState(BagType.BACKPACK);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBags = async () => {
    setIsLoading(true);
    try {
      const response = await bagTemplatesRepo.listBags();
      setBags(response.data);
    } catch (error) {
      console.error("Failed to fetch bags:", error);
      toast.error("Failed to load bag templates.");
      setBags([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Bag Templates — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage reusable bag templates to quickly build trips.");
    fetchBags();
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0, [name]);
  const canSave = useMemo(() => editedName.trim().length > 0, [editedName]);

  const add = async () => {
    if (!canCreate) return;
    setIsLoading(true);
    try {
      const newBag = { name: name.trim(), type };
      const response = await bagTemplatesRepo.createBag(newBag);
      setBags((prevBags) => [...prevBags, response.data]);
      setName("");
      setType(BagType.BACKPACK);
      toast.success("Bag template created successfully!");
    } catch (error) {
      console.error("Failed to create bag:", error);
      toast.error("Failed to create bag template.");
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: ID) => {
    if (!confirm("Delete this bag template? This action cannot be undone.")) return;
    setIsLoading(true);
    try {
      await bagTemplatesRepo.deleteBag(id);
      setBags((prevBags) => prevBags.filter((bag) => bag.id !== id));
      toast.success("Bag template deleted.");
    } catch (error) {
      console.error("Failed to delete bag:", error);
      toast.error("Failed to delete bag template.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (bag: BagTemplate) => {
    setEditingBagId(bag.id);
    setEditedName(bag.name);
    setEditedType(bag.type);
  };

  const saveEdit = async (id: ID) => {
    if (!canSave) return;
    setIsLoading(true);
    try {
      const updatedBag = { name: editedName.trim(), type: editedType };
      const response = await bagTemplatesRepo.updateBag(id, updatedBag);
      setBags((prevBags) =>
        prevBags.map((bag) => (bag.id === id ? response.data : bag))
      );
      setEditingBagId(null);
      toast.success("Bag template updated.");
    } catch (error) {
      console.error("Failed to save bag:", error);
      toast.error("Failed to save bag template.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingBagId(null);
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
              <Input id="name" placeholder="Backpack" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as BagType)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BagType).map((t: BagType) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={add} disabled={!canCreate || isLoading} className="w-full">{isLoading ? "Creating..." : "Create"}</Button>
          </CardContent>
        </Card>

        {Array.isArray(bags) && bags.map((bg) => (
          <Card key={bg.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingBagId === bg.id ? (
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} disabled={isLoading} />
                ) : (
                  <span>{bg.name}</span>
                )}
                <div className="flex gap-2">
                  {editingBagId === bg.id ? (
                    <>
                      <Button variant="outline" onClick={() => saveEdit(bg.id)} disabled={!canSave || isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
                      <Button variant="ghost" onClick={cancelEdit} disabled={isLoading}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => startEditing(bg)} disabled={isLoading}>Edit</Button>
                  )}
                  <Button variant="ghost" onClick={() => remove(bg.id)} disabled={isLoading}>Delete</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingBagId === bg.id ? (
                <div className="space-y-2 text-left">
                  <Label htmlFor={`type-edit-${bg.id}`}>Type</Label>
                  <Select
                    value={editedType}
                    onValueChange={(value) => setEditedType(value as BagType)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id={`type-edit-${bg.id}`}>
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(BagType).map((t: BagType) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Type: {bg.type}</p>
              )}
              <Separator className="my-3" />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}