"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus, X, Loader2 } from "lucide-react";

const API = "http://localhost:3001";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  priceUsdc: number;
};

type Category = {
  id: string;
  name: string;
  emoji?: string;
  menuItems: MenuItem[];
};

type PageData = {
  merchant: { id: string; name: string; logoUrl?: string; cuisineType?: string };
  table: { id: string; tableNumber: number; label?: string };
  categories: Category[];
  uncategorized: MenuItem[];
};

type CartItem = MenuItem & { quantity: number };

export default function CustomerPage({
  params,
}: {
  params: Promise<{ slug: string; tableId: string }>;
}) {
  const [slug, setSlug] = useState("");
  const [tableId, setTableId] = useState("");
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    params.then(({ slug, tableId }) => {
      setSlug(slug);
      setTableId(tableId);
    });
  }, [params]);

  useEffect(() => {
    if (!slug || !tableId) return;
    fetch(`${API}/public/r/${slug}/${tableId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
      })
      .catch(() => setError("Could not load menu."))
      .finally(() => setLoading(false));
  }, [slug, tableId]);

  function addToCart(item: MenuItem) {
    setCart((c) => ({
      ...c,
      [item.id]: c[item.id]
        ? { ...c[item.id]!, quantity: c[item.id]!.quantity + 1 }
        : { id: item.id, name: item.name, description: item.description, priceUsdc: item.priceUsdc, quantity: 1 },
    }));
  }

  function removeFromCart(itemId: string) {
    setCart((c) => {
      const cur = c[itemId];
      if (!cur) return c;
      if (cur.quantity <= 1) {
        const next = { ...c };
        delete next[itemId];
        return next;
      }
      return { ...c, [itemId]: { ...cur, quantity: cur.quantity - 1 } };
    });
  }

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.priceUsdc * i.quantity, 0);

  const allItems: MenuItem[] = data
    ? [...(data.uncategorized ?? []), ...(data.categories?.flatMap((c) => c.menuItems) ?? [])]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-2xl mb-2">🍽️</p>
          <p className="text-sm font-medium text-gray-700">{error || "Restaurant not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-gray-950">{data.merchant.name}</p>
            <p className="text-xs text-gray-400">
              Table {data.table.tableNumber}
              {data.table.label ? ` · ${data.table.label}` : ""}
            </p>
          </div>
          {cartCount > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 bg-gray-950 text-white text-sm font-medium px-4 py-2 rounded-full"
            >
              <ShoppingCart size={15} />
              <span>{cartCount}</span>
              <span className="text-gray-300">·</span>
              <span>${cartTotal.toFixed(2)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-6">
        {data.categories?.map((category) =>
          category.menuItems.length === 0 ? null : (
            <div key={category.id}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {category.emoji} {category.name}
              </p>
              <div className="flex flex-col gap-2">
                {category.menuItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    quantity={cart[item.id]?.quantity ?? 0}
                    onAdd={() => addToCart(item)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {data.uncategorized?.length > 0 && (
          <div>
            {data.categories?.length > 0 && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                More items
              </p>
            )}
            <div className="flex flex-col gap-2">
              {data.uncategorized.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  quantity={cart[item.id]?.quantity ?? 0}
                  onAdd={() => addToCart(item)}
                  onRemove={() => removeFromCart(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {allItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl mb-2">🍽️</p>
            <p className="text-sm text-gray-400">Menu is being set up. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      {cartCount > 0 && !showCart && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setShowCart(true)}
              className="w-full bg-gray-950 text-white font-medium py-3.5 rounded-xl flex items-center justify-between px-5"
            >
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
              <span>View order</span>
              <span>${cartTotal.toFixed(2)} USDC</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Sheet */}
      {showCart && (
        <CartSheet
          items={cartItems}
          total={cartTotal}
          merchantId={data.merchant.id}
          tableId={data.table.id}
          onClose={() => setShowCart(false)}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}

// ── Item Card ─────────────────────────────────────────────────────
function ItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-950">{item.name}</p>
        {item.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
        )}
        <p className="text-sm font-semibold text-gray-950 mt-1">${item.priceUsdc.toFixed(2)}</p>
      </div>

      {quantity === 0 ? (
        <button
          onClick={onAdd}
          className="w-8 h-8 bg-gray-950 text-white rounded-full flex items-center justify-center shrink-0"
        >
          <Plus size={16} />
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRemove}
            className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-600"
          >
            <Minus size={13} />
          </button>
          <span className="text-sm font-semibold w-4 text-center">{quantity}</span>
          <button
            onClick={onAdd}
            className="w-7 h-7 bg-gray-950 text-white rounded-full flex items-center justify-center"
          >
            <Plus size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Cart Sheet ────────────────────────────────────────────────────
function CartSheet({
  items,
  total,
  merchantId: _merchantId,
  tableId: _tableId,
  onClose,
  onAdd,
  onRemove,
}: {
  items: CartItem[];
  total: number;
  merchantId: string;
  tableId: string;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
      <div className="bg-white rounded-t-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-950">Your order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-950">{item.name}</p>
                <p className="text-xs text-gray-400">${item.priceUsdc.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRemove(item.id)}
                  className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-600"
                >
                  <Minus size={13} />
                </button>
                <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => onAdd(item)}
                  className="w-7 h-7 bg-gray-950 text-white rounded-full flex items-center justify-center"
                >
                  <Plus size={13} />
                </button>
              </div>
              <p className="text-sm font-semibold text-gray-950 w-14 text-right">
                ${(item.priceUsdc * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total</span>
            <span className="text-base font-bold text-gray-950">${total.toFixed(2)} USDC</span>
          </div>
          <button
            className="w-full bg-gray-950 text-white font-medium py-3.5 rounded-xl text-sm"
            onClick={() => alert("Payment flow coming next!")}
          >
            Pay ${total.toFixed(2)} USDC
          </button>
          <p className="text-xs text-center text-gray-400">
            Powered by Jaaduwalapay · Gasless on Solana
          </p>
        </div>
      </div>
    </div>
  );
}
