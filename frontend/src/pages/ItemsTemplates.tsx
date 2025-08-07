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
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    document.title = "Item Templates — Trip Packer";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Manage reusable item templates for faster packing.");
    setItems(itemsRepo.listItems());
  }, []);

  const canCreate = useMemo(() => name.trim().length > 0 && qty > 0, [name, qty]);

  const add = () => {
    if (!canCreate) return;
    itemsRepo.createItem({ name: name.trim(), default_quantity: qty });
    setName("");
    setQty(1);
    setItems(itemsRepo.listItems());
  };

  const remove = (id: string) => {
    if (!confirm("Delete this template?")) return;
    itemsRepo.deleteItem(id);
    setItems(itemsRepo.listItems());
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

        {items.map((it) => (
          <Card key={it.id} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{it.name}</span>
                <Button variant="ghost" onClick={() => remove(it.id)}>Delete</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Default quantity ×{it.default_quantity}</p>
              <Separator className="my-3" />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
