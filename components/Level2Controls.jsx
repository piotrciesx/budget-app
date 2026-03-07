export default function Level2Controls({
  sortModeLevel2,
  setSortModeLevel2,
  setOpenLevel2,
  setOpenLevel3,
  resetLevel2Order
}) {
  return (
    <div className="flex gap-2 text-xs mb-2 items-center">

      <select
        value={sortModeLevel2}
        onChange={(e) => {
          const value = e.target.value;

          setSortModeLevel2(value);

          if (value === "manual") {
            setOpenLevel2(null);
            setOpenLevel3(null);
          }
        }}
        className="border rounded px-2 py-1"
      >
        <option value="manual">Ręczne</option>
        <option value="usage-desc">Najczęściej używane</option>
        <option value="usage-asc">Najrzadziej używane</option>
        <option value="amount-desc">Największe kwoty</option>
        <option value="amount-asc">Najmniejsze kwoty</option>
      </select>

      <button
        onClick={() => {
          setOpenLevel2(null);
          setOpenLevel3(null);
        }}
        className="px-2 py-1 border rounded bg-gray-200 dark:bg-gray-700"
      >
        Zwiń
      </button>

      <button
        onClick={resetLevel2Order}
        className="px-2 py-1 border rounded bg-gray-200 dark:bg-gray-700"
      >
        Resetuj układ
      </button>

    </div>
  );
}