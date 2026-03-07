import React, { memo } from "react";

function CategoryRow({ category, children }) {
  if (!category) return null;

  const isIncome = category.type === "income";

  return (
    <div
      className={`border rounded font-semibold
      ${
        !category.parentId
          ? isIncome
            ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-6 py-4"
            : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 px-6 py-4"
          : category.parentId === "expense" || category.parentId === "income"
          ? "bg-gray-100 dark:bg-gray-700 px-4 py-3"
          : "bg-white dark:bg-gray-800 px-3 py-2"
      }`}
    >
      {children || category.name}
    </div>
  );
}
export default memo(CategoryRow);