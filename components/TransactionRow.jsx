import React, { useState, useRef, useEffect } from "react"

import { supabase } from "../lib/supabaseClient";

function TransactionRow({
  t,
  monthIndex,
  selectedTransactions,
  toggleTransactionSelection,
  editingTransactionId,
  setEditingTransactionId,
  movingTransactionId,
  setMovingTransactionId,
  setTransactions,
  categories,
  moveRef,
  createLevel3Category,
  moveTransaction,
  getAllowedCategories,
  formatAmount
}) {

  const [editedAmount, setEditedAmount] = useState("")
  const [editedDay, setEditedDay] = useState("")
  const [editedNote, setEditedNote] = useState("")

  const editRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        editingTransactionId === t.id &&
        editRef.current &&
        !editRef.current.contains(e.target)
      ) {
        saveEdit()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editingTransactionId, editedAmount, editedDay, editedNote])

  const saveEdit = async () => {
  const parsedAmount = Number(editedAmount);
  const currentDate = t.date ? new Date(t.date) : new Date();
  const currentYear = currentDate.getFullYear();
  const maxDay = new Date(currentYear, monthIndex + 1, 0).getDate();
  const parsedDay = Number(editedDay);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    alert("Kwota musi być większa od zera.");
    setEditedAmount(t.amount ?? "");
    setEditedDay(t.date ? new Date(t.date).getDate() : "");
    setEditedNote(t.description ?? "");
    setEditingTransactionId(null);
    return;
  }

  if (!isNaN(parsedDay) && (parsedDay < 1 || parsedDay > maxDay)) {
    alert(`Dzień musi być z zakresu 1-${maxDay}.`);
    setEditedAmount(t.amount ?? "");
    setEditedDay(t.date ? new Date(t.date).getDate() : "");
    setEditedNote(t.description ?? "");
    setEditingTransactionId(null);
    return;
  }

  const nextDate = editedDay
    ? new Date(currentYear, monthIndex, parsedDay, 12).toISOString()
    : null;

  const { error } = await supabase
    .from("transactions")
    .update({
      amount: parsedAmount,
      description: editedNote,
      date: nextDate
    })
    .eq("id", t.id);

  if (error) {
    console.error("BĹ‚Ä…d edycji:", error);
    alert("Nie udaĹ‚o siÄ™ zapisaÄ‡ zmian.");
    return;
  }

  setTransactions(prev =>
    prev.map(item =>
      item.id === t.id
        ? {
            ...item,
            amount: parsedAmount,
            description: editedNote,
            date: nextDate
          }
        : item
    )
  );

  setEditingTransactionId(null);
}

  return (
    <div className="flex items-center justify-between text-xs text-gray-500">

      {/* LEWA STRONA */}
      <div className="flex items-center gap-2">

        <input
          type="checkbox"
          checked={selectedTransactions?.includes(t.id) || false}
          onChange={() => toggleTransactionSelection?.(t.id)}
        />

        {editingTransactionId === t.id ? (

          <div ref={editRef} className="flex gap-1">

            <input
  autoFocus
  type="number"
  min="1"
  max={new Date(t.date ? new Date(t.date).getFullYear() : new Date().getFullYear(), monthIndex + 1, 0).getDate()}
  step="1"
  value={editedDay}
  onChange={(e) => setEditedDay(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") saveEdit()
  }}
  className="border rounded px-1 text-xs w-14"
  placeholder="dzieĹ„"
/>

            <input
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit()
              }}
              className="border rounded px-1 text-xs w-28"
              placeholder="opis"
            />

            <input
  type="number"
  step="0.01"
  min="0.01"
  value={editedAmount}
  onChange={(e) => setEditedAmount(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") saveEdit()
  }}
  onBlur={saveEdit}
  className="border rounded px-1 text-xs w-20"
  placeholder="kwota"
/>

          </div>

        ) : (

          <div className="flex justify-between items-center w-full">

            <div className="flex flex-col items-start">

              {t.date && (
  <span className="text-[10px] text-gray-400">
    {new Date(t.date).getDate()}.{monthIndex + 1}
  </span>
)}

              {t.description && (
  <span className="text-xs text-gray-600 dark:text-gray-300">
    {t.description}
  </span>
)}

            </div>

            <span className="font-medium">
              {formatAmount(t.amount)} zł
            </span>

          </div>

        )}

      </div>

      {/* PRAWA STRONA */}
      <div className="flex items-center gap-2">

        <button
          onClick={async () => {

            const { error } = await supabase
              .from("transactions")
              .delete()
              .eq("id", t.id);

            if (error) {
              console.error("Błąd usuwania:", error);
              alert("Nie udało się usunąć transakcji.");
              return;
            }

            setTransactions(prev =>
              prev.filter(item => item.id !== t.id)
            );
          }}
          className="text-red-500"
        >
          x
        </button>

        <button
          onClick={() => {
            setEditingTransactionId(t.id)
            setEditedAmount(t.amount ?? "")
            setEditedDay(t.date ? new Date(t.date).getDate() : "")
            setEditedNote(t.description ?? "")
          }}
          className="text-blue-500"
        >
          ✏️
        </button>
        {movingTransactionId === t.id && (
          <div ref={moveRef}>
            <select
              onClick={(e) => e.stopPropagation()}
              onChange={async (e) => {
                const value = e.target.value

                if (value === "__new__") {
                  const name = prompt("Nazwa nowej podkategorii:")
                  if (!name) return

                  const currentCategory = categories.find(
                    (c) => c.id === t.categoryId
                  )

                  if (!currentCategory.parentId) {
                    alert("Najpierw utwórz sekcję (Level 2).")
                    setMovingTransactionId(null)
                    return
                  }

                  const newCategoryId = createLevel3Category(
                    name,
                    currentCategory.parentId,
                    currentCategory.type
                  )

                                    moveTransaction(t.id, newCategoryId)
                  setMovingTransactionId(null)
                } else {

                  const { error } = await supabase
                    .from("transactions")
                    .update({ category_id: value })
                    .eq("id", t.id);

                  if (error) {
                    console.error("Błąd przenoszenia transakcji:", error);
                    alert("Nie udało się przenieść transakcji.");
                    return;
                  }

                  moveTransaction(t.id, value);
                  setMovingTransactionId(null)

                }
              }}
              className="border rounded px-1 text-xs"
              defaultValue=""
            >
              <option value="" disabled>
                Wybierz kategorię
              </option>

              {[
  ...getAllowedCategories(t.categoryId)
].sort((a, b) => {
  const currentCategory = categories.find(c => c.id === t.categoryId);
  const currentParentId = currentCategory?.parentId || null;

  const aSameParent = a.parentId === currentParentId ? 0 : 1;
  const bSameParent = b.parentId === currentParentId ? 0 : 1;

  if (aSameParent !== bSameParent) {
    return aSameParent - bSameParent;
  }

  return a.name.localeCompare(b.name, "pl");
}).map((cat) => (
  <option key={cat.id} value={cat.id}>
    {categories.find(c => c.id === cat.parentId)?.name
      ? categories.find(c => c.id === cat.parentId)?.name + " → "
      : ""}
    {cat.name}
  </option>
))}

              <option value="__new__">
                + Nowa podkategoria
              </option>
            </select>
          </div>
        )}
        <button
          onClick={(e) => {

            e.stopPropagation()

            setMovingTransactionId?.(
              movingTransactionId === t.id ? null : t.id
            )

            setEditingTransactionId?.(null)

          }}
          className="text-purple-500"
        >
          ↪
        </button>

      </div>

    </div>
  )
}

export default React.memo(TransactionRow)