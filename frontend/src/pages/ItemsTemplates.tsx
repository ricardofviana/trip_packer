import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { itemsRepo, type ItemTemplate } from "@/services/repos/itemsRepo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemCategory } from "@/types";

const ItemCategoryEnum = {
  CLOTHING: "CLOTHING",
  ELECTRONICS: "ELECTRONICS",
  TOILETRIES: "TOILETRIES",
  DOCUMENTS: "DOCUMENTS",
  MEDICATION: "MEDICATION",
  ACCESSORIES: "ACCESSORIES",
  OTHER: "OTHER",
} as const;

export default function ItemsTemplatesPage() {
  const [items, setItems] = useState<ItemTemplate[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>(ItemCategoryEnum.CLOTHING);
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

  const canCreate = useMemo(() => name.trim().length > 0, [name, category]);
  const canSave = useMemo(() => editedName.trim().length > 0, [editedName, category]);

  const add = async () => {
    if (!canCreate) return;
    await itemsRepo.createItem({ name: name.trim(), category});
    setName("");
    setCategory(ItemCategoryEnum.CLOTHING);
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
    setCategory(item.category);
  };

  const saveEdit = async (id: string) => {
    if (!canSave) return;
    await itemsRepo.updateItem(id, { name: editedName.trim(), category});
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
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as ItemCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ItemCategoryEnum).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                null
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Category: {it.category}</p>
                </>
              )}
              <Separator className="my-3" />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}