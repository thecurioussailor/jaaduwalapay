"use client";

import { Plus, QrCode } from "lucide-react";

export default function TablesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Tables</h1>
          <p className="text-sm text-gray-400 mt-1">Generate QR codes for each table in your restaurant.</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-950 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={15} />
          Add table
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <QrCode size={32} className="text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-400">No tables yet</p>
          <p className="text-xs text-gray-300 mt-1">Add a table to generate its QR code</p>
          <button className="mt-5 flex items-center gap-2 bg-gray-950 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
            <Plus size={15} />
            Add table
          </button>
        </div>
      </div>
    </div>
  );
}
