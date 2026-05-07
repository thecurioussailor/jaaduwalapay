"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, QrCode, Trash2, Download, X } from "lucide-react";
import QRCode from "qrcode";
import { getToken } from "../../../lib/auth";

const API = "http://localhost:3001";
const BASE_URL = "http://localhost:3000";

type Table = {
  id: string;
  tableNumber: number;
  label?: string;
  isActive: boolean;
};

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

// ── QR Modal ─────────────────────────────────────────────────────
function QRModal({ table, slug, onClose }: { table: Table; slug: string; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const url = `${BASE_URL}/r/${slug}/${table.id}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 240,
        margin: 2,
        color: { dark: "#0a0a0a", light: "#ffffff" }
      });
    }
  }, [url]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `table-${table.tableNumber}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-950">
            Table {table.tableNumber}{table.label ? ` — ${table.label}` : ""}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        <div className="px-6 py-6 flex flex-col items-center gap-5">
          <canvas ref={canvasRef} className="rounded-xl" />
          <p className="text-xs text-gray-400 text-center break-all">{url}</p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 w-full justify-center bg-gray-950 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            <Download size={15} /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add Table Modal ───────────────────────────────────────────────
function AddTableModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ tableNumber: "", label: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/merchant/tables`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          tableNumber: parseInt(form.tableNumber),
          label: form.label || undefined
        })
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
          <h2 className="text-base font-semibold text-gray-950">Add table</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-28 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Number *</label>
              <input
                required
                type="number"
                min="1"
                value={form.tableNumber}
                onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))}
                placeholder="1"
                className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-950 transition"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Label</label>
              <input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Window seat"
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
              {loading ? "Adding…" : "Add table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [qrTable, setQrTable] = useState<Table | null>(null);

  async function fetchData() {
    try {
      const [tablesRes, meRes] = await Promise.all([
        fetch(`${API}/merchant/tables`, { headers: authHeaders() }),
        fetch(`${API}/merchant/me`, { headers: authHeaders() })
      ]);
      const tablesData = await tablesRes.json();
      const meData = await meRes.json();
      setTables(tablesData.tables ?? []);
      setSlug(meData.merchant?.slug ?? "");
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleDelete(tableId: string, tableNumber: number) {
    if (!confirm(`Delete Table ${tableNumber}?`)) return;
    await fetch(`${API}/merchant/tables/${tableId}`, { method: "DELETE", headers: authHeaders() });
    fetchData();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Tables</h1>
          <p className="text-sm text-gray-400 mt-1">Generate QR codes for each table. Customers scan to order.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gray-950 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus size={15} /> Add table
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : tables.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <QrCode size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-400">No tables yet</p>
          <p className="text-xs text-gray-300 mt-1">Add a table to generate its QR code</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-5 flex items-center gap-2 bg-gray-950 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus size={15} /> Add table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {tables.map(table => (
            <div key={table.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-950">Table {table.tableNumber}</p>
                  {table.label && <p className="text-xs text-gray-400 mt-0.5">{table.label}</p>}
                </div>
                <button
                  onClick={() => handleDelete(table.id, table.tableNumber)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <button
                onClick={() => setQrTable(table)}
                className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <QrCode size={14} /> View QR
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddTableModal
          onClose={() => setShowAddModal(false)}
          onSaved={fetchData}
        />
      )}

      {qrTable && slug && (
        <QRModal
          table={qrTable}
          slug={slug}
          onClose={() => setQrTable(null)}
        />
      )}
    </div>
  );
}
