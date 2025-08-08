import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { itemsRepo, type ItemTemplate } from "@/services/repos/itemsRepo";

export default function ItemsTemplatesPage() {
  const [items, setItems] = useState<ItemTemplate[]>([]);
  const [name, setName] = useState("");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");

  const fetchItems = async () => {
    const response = await itemsRepo.listItems();
    console.log("ItemsTemplatesPage: API response data", response.data);
    setItems(response.data);
  };

  useEffect(() => {
    document.title = "Item Templates — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage reusable item templates for faster packing.");
    fetchItems();
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0 && qty > 0, [name, qty]);
  const canSave = useMemo(() => editedName.trim().length > 0 && editedQty > 0, [editedName, editedQty]);

  const add = async () => {
    if (!canCreate) return;
    await itemsRepo.createItem({ name: name.trim(), category: "" }); // Assuming category is not critical for now
    setName("");
    setQty(1);
    fetchItems();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await itemsRepo.deleteItem(id);
    fetchItems();
  };

  const startEditing = (item: ItemTemplate) => {
    setEditingItemId(item.id);
    setEditedName(item.name);
    setEditedQty(item.default_quantity);
  };

  const saveEdit = async (id: string) => {
    if (!canSave) return;
    await itemsRepo.updateItem(id, { name: editedName.trim(), default_quantity: editedQty });
    setEditingItemId(null);
    fetchItems();
  };

  const cancelEdit = () => {
    setEditingItemId(null);
  };

  return (
    <main className="container py-10">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Item templates</h1>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create item template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="T-shirt" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="qty">Default quantity</Label>
              <Input id="qty" type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </div>
            <Button onClick={add} disabled={!canCreate} className="w-full">Create</Button>
          </CardContent>
        </Card>

        {Array.isArray(items) && items.map((it) => (
          <Card key={it.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingItemId === it.id ? (
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                ) : (
                  <span>{it.name}</span>
                )}
                <div className="flex gap-2">
                  {editingItemId === it.id ? (
                    <>
                      <Button variant="outline" onClick={() => saveEdit(it.id)} disabled={!canSave}>Save</Button>
                      <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => startEditing(it)}>Edit</Button>
                  )}
                  <Button variant="ghost" onClick={() => remove(it.id)}>Delete</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingItemId === it.id ? (
              {editingItemId === it.id ? (
                null
              ) : (                <p className="text-sm text-muted-foreground">Default quantity ×{it.default_quantity}</p>
              )}
              <Separator className="my-3" />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
