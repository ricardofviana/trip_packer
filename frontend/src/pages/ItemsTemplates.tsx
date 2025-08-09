import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { itemsRepo, type ItemTemplate } from "@/services/repos/itemsRepo";
import { ItemCategory } from "@/types";

export default function ItemsTemplatesPage() {
  const [items, setItems] = useState<ItemTemplate[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(ItemCategory.CLOTHING);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedCategory, setEditedCategory] = useState(ItemCategory.CLOTHING);
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await itemsRepo.listItems();
      setItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast.error("Failed to load item templates.");
      setItems([]); // Ensure items is always an array
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Item Templates — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage reusable item templates for faster packing.");
    fetchItems();
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0, [name]);
  const canSave = useMemo(() => editedName.trim().length > 0, [editedName]);

  const add = async () => {
    if (!canCreate) return;
    setIsLoading(true);
    try {
      const newItem = { name: name.trim(), category };
      const response = await itemsRepo.createItem(newItem);
      setItems((prevItems) => [...prevItems, response.data]);
      setName("");
      setCategory(ItemCategory.CLOTHING);
      toast.success("Item template created successfully!");
    } catch (error) {
      console.error("Failed to create item:", error);
      toast.error("Failed to create item template.");
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template? This action cannot be undone.")) return;
    setIsLoading(true);
    try {
      await itemsRepo.deleteItem(id);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
      toast.success("Item template deleted.");
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item template.");
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (item: ItemTemplate) => {
    setEditingItemId(item.id);
    setEditedName(item.name);
    setEditedCategory(item.category);
  };

  const saveEdit = async (id: string) => {
    if (!canSave) return;
    setIsLoading(true);
    try {
      const updatedItem = { name: editedName.trim(), category: editedCategory };
      const response = await itemsRepo.updateItem(id, updatedItem);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? response.data : item))
      );
      setEditingItemId(null);
      toast.success("Item template updated.");
    } catch (error) {
      console.error("Failed to save item:", error);
      toast.error("Failed to save item template.");
    } finally {
      setIsLoading(false);
    }
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
              <Input
                id="name"
                placeholder="T-shirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as ItemCategory)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ItemCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={add} disabled={!canCreate || isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </CardContent>
        </Card>

        {Array.isArray(items) && items.map((it) => (
          <Card key={it.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingItemId === it.id ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={isLoading}
                  />
                ) : (
                  <span>{it.name}</span>
                )}
                <div className="flex gap-2">
                  {editingItemId === it.id ? (
                    <>
                      <Button variant="outline" onClick={() => saveEdit(it.id)} disabled={!canSave || isLoading}>
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="ghost" onClick={cancelEdit} disabled={isLoading}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => startEditing(it)} disabled={isLoading}>
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => remove(it.id)} disabled={isLoading}>
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingItemId === it.id ? (
                <div className="space-y-2 text-left">
                  <Label htmlFor={`category-edit-${it.id}`}>Category</Label>
                  <Select
                    value={editedCategory}
                    onValueChange={(value) => setEditedCategory(value as ItemCategory)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id={`category-edit-${it.id}`}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ItemCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Category: {it.category}</p>
              )}
              <Separator className="my-3" />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
