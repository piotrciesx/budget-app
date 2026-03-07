export default function Level1Header({
  level1,
  attributes,
  listeners,
  disableDragLevel1,
  formatAmount,
  getCategorySum,
  transactions,
  categories,
  monthKey
}) {
  return (
    <div className="flex items-center w-full">

      {!disableDragLevel1 && (
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab mr-3"
        >
          ⠿
        </span>
      )}

      <span className="flex-1">
        {level1.name} — {formatAmount(
          getCategorySum(level1.id, transactions, categories, monthKey)
        )} zł
      </span>

    </div>
  );
}