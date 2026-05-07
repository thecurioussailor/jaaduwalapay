"use client";

import { useEffect, useState } from "react";
import { Plus, UtensilsCrossed, Pencil, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";
import { getToken } from "../../../lib/auth";

const API = "http://localhost:3001";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  priceUsdc: number;
  isAvailable: boolean;
  imageUrl?: string;
  categoryId?: string;
};

type Category = {
  id: string;
  name: string;
  emoji?: string;
  menuItems: MenuItem[];
};

type MenuData = {
  categories: Category[];
  uncategorized: MenuItem[];
};

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

// ── Item Form Modal ──────────────────────────────────────────────
function ItemModal({
  categories,
  item,
  onClose,
  onSaved,
}: {
  categories: Category[];
  item?: MenuItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = !!item;
  const [form, setForm] = useState({
    name: item?.name ?? "",
    description: item?.description ?? "",
    priceUsdc: item?.priceUsdc?.toString() ?? "",
    categoryId: item?.categoryId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      name: form.name,
      description: form.description || undefined,
      priceUsdc: parseFloat(form.priceUsdc),
      categoryId: form.categoryId || undefined,
    };

    try {
      const res = await fetch(
        editing ? `${API}/merchant/menu/items/${item.id}` : `${API}/merchant/menu/items`,
        {
          method: editing ? "PATCH" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      onSaved();
      onClose();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-950">{editing ? "Edit item" : "Add item"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Name *</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Margherita Pizza"
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
              rows={2}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950 transition resize-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Price (USDC) *</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.priceUsdc}
                onChange={e => setForm(f => ({ ...f, priceUsdc: e.target.value }))}
                placeholder="0.00"
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950 transition"
              />
            </div>

            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950 transition bg-white"
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-gray-950 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? "Saving…" : editing ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Category Form Modal ──────────────────────────────────────────
function CategoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", emoji: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/merchant/menu/categories`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: form.name, emoji: form.emoji || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      onSaved();
      onClose();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-950">Add category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-20 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Emoji</label>
              <input
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                placeholder="🍕"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950 transition text-center"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Starters"
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950 transition"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-gray-950 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? "Saving…" : "Add category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Menu Item Row ────────────────────────────────────────────────
function ItemRow({ item, onEdit, onDelete, onToggle }: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 group">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${item.isAvailable ? "text-gray-950" : "text-gray-400 line-through"}`}>
          {item.name}
        </p>
        {item.description && <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>}
      </div>
      <span className="text-sm font-medium text-gray-950 tabular-nums">${item.priceUsdc.toFixed(2)}</span>
      <button
        onClick={onToggle}
        className={`text-xs font-medium px-2.5 py-1 rounded-full transition ${
          item.isAvailable ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
        }`}
      >
        {item.isAvailable ? "Available" : "Hidden"}
      </button>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function MenuPage() {
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  async function fetchMenu() {
    try {
      const res = await fetch(`${API}/merchant/menu`, { headers: authHeaders() });
      const data = await res.json();
      setMenu(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMenu() }, []);

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`${API}/merchant/menu/items/${itemId}`, { method: "DELETE", headers: authHeaders() });
    fetchMenu();
  }

  async function handleToggleItem(item: MenuItem) {
    await fetch(`${API}/merchant/menu/items/${item.id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    fetchMenu();
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!confirm("Delete category? Items will become uncategorized.")) return;
    await fetch(`${API}/merchant/menu/categories/${categoryId}`, { method: "DELETE", headers: authHeaders() });
    fetchMenu();
  }

  const allItems = menu ? [...(menu.uncategorized ?? []), ...(menu.categories?.flatMap(c => c.menuItems) ?? [])] : [];
  const isEmpty = allItems.length === 0 && (menu?.categories?.length ?? 0) === 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Menu</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your items and categories.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <Plus size={15} /> Category
          </button>
          <button
            onClick={() => { setEditingItem(undefined); setShowItemModal(true); }}
            className="flex items-center gap-2 bg-gray-950 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus size={15} /> Add item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : isEmpty ? (
        <div className="bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <UtensilsCrossed size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-400">No menu items yet</p>
          <p className="text-xs text-gray-300 mt-1">Add your first item to get started</p>
          <button
            onClick={() => setShowItemModal(true)}
            className="mt-5 flex items-center gap-2 bg-gray-950 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus size={15} /> Add item
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {menu?.categories?.map(category => (
            <div key={category.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setCollapsed(c => ({ ...c, [category.id]: !c[category.id] }))}
              >
                <div className="flex items-center gap-2">
                  {category.emoji && <span className="text-lg">{category.emoji}</span>}
                  <span className="text-sm font-semibold text-gray-950">{category.name}</span>
                  <span className="text-xs text-gray-400">({category.menuItems.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                  {collapsed[category.id] ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                </div>
              </div>

              {!collapsed[category.id] && (
                category.menuItems.length === 0 ? (
                  <p className="px-5 py-4 text-xs text-gray-400">No items in this category yet.</p>
                ) : (
                  category.menuItems.map(item => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onEdit={() => { setEditingItem(item); setShowItemModal(true); }}
                      onDelete={() => handleDeleteItem(item.id)}
                      onToggle={() => handleToggleItem(item)}
                    />
                  ))
                )
              )}
            </div>
          ))}

          {(menu?.uncategorized?.length ?? 0) > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-950">Uncategorized</span>
              </div>
              {menu?.uncategorized?.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onEdit={() => { setEditingItem(item); setShowItemModal(true); }}
                  onDelete={() => handleDeleteItem(item.id)}
                  onToggle={() => handleToggleItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showItemModal && (
        <ItemModal
          categories={menu?.categories ?? []}
          item={editingItem}
          onClose={() => { setShowItemModal(false); setEditingItem(undefined); }}
          onSaved={fetchMenu}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSaved={fetchMenu}
        />
      )}
    </div>
  );
}
