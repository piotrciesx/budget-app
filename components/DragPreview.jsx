import React from "react";
import CategoryRow from "./CategoryRow";

export default function DragPreview({ category }) {
  if (!category) return null;

  return (
  <div className="shadow-2xl scale-[1.02] pointer-events-none">
    <CategoryRow category={category} />
  </div>
);
}