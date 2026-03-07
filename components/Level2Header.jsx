"use client";

export default function Level2Header({
  level2,
  attributes,
  listeners,
  monthKey,
  transactions,
  categories,
  openLevel2,
  setOpenLevel2,
  closeCategory,
  reopenCategory,
  deleteCategory,
  renameCategory,
  isCategoryActiveInMonth,
  formatAmount,
  getCategorySum,
  disableDragLevel2
}) {

  const isOpenLevel2 = openLevel2 === level2.id;

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 font-medium">

      {!disableDragLevel2 && (
  <span
    {...attributes}
    {...listeners}
    className="cursor-grab mr-2"
  >
    ⠿
  </span>
)}

      <button
        type="button"
        onClick={() => {
          const newValue = isOpenLevel2 ? null : level2.id;
          setOpenLevel2(newValue);
        }}
        className="text-left flex-1"
      >
        {level2.name} — {formatAmount(
          getCategorySum(level2.id, transactions, categories, monthKey)
        )} zł
      </button>

      {isCategoryActiveInMonth(level2, monthKey) ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeCategory(level2.id);
          }}
          className="ml-2 text-sm"
        >
          🔒
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            reopenCategory(level2.id);
          }}
          className="ml-2 text-sm"
        >
          🔓
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteCategory(level2.id);
        }}
        className="ml-2 text-sm"
      >
        🗑
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          renameCategory(level2.id);
        }}
        className="ml-2 text-sm"
      >
        ✏
      </button>

    </div>
  );
}