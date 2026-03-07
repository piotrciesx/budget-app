import React, { useState, useRef, useEffect } from "react"

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

    const saveEdit = () => {
  setTransactions(prev =>
    prev.map(item =>
      item.id === t.id
        ? {
            ...item,
            amount: Number(editedAmount),
            day: editedDay,
            note: editedNote
          }
        : item
    )
  )

  setEditingTransactionId(null)
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
    value={editedDay}
                            onChange={(e) => setEditedDay(e.target.value)}
                            onKeyDown={(e) => {
  if (e.key === "Enter") saveEdit()
}}
                            className="border rounded px-1 text-xs w-14"
                            placeholder="dzień"
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

                            {t.day && (
                                <span className="text-[10px] text-gray-400">
                                    {t.day}.{monthIndex + 1}
                                </span>
                            )}

                            {t.note && (
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                    {t.note}
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
                    onClick={() =>
                        setTransactions?.(prev =>
                            prev.filter(item => item.id !== t.id)
                        )
                    }
                    className="text-red-500"
                >
                    x
                </button>

                <button
                    onClick={() => {
  setEditingTransactionId(t.id)
  setEditedAmount(t.amount ?? "")
  setEditedDay(t.day ?? "")
  setEditedNote(t.note ?? "")
}}
                    className="text-blue-500"
                >
                    ✏️
                </button>
{movingTransactionId === t.id && (
  <div ref={moveRef}>
    <select
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
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
        } else {
          moveTransaction(t.id, value)
        }

        setMovingTransactionId(null)
      }}
      className="border rounded px-1 text-xs"
      defaultValue=""
    >
      <option value="" disabled>
        Wybierz kategorię
      </option>

      {getAllowedCategories(t.categoryId).map((cat) => (
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