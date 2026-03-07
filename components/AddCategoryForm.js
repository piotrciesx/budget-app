"use client";
import { useState } from "react";

export default function AddCategoryForm({ onAdd, placeholder }) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
        placeholder={placeholder}
        className="flex-1 px-2 py-1 border rounded"
      />

      <button
        onClick={handleSubmit}
        className="px-3 py-1 bg-gray-600 text-white rounded"
      >
        +
      </button>
    </div>
  );
}