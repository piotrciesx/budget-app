import React from "react";

import TransactionRow from "./TransactionRow";

function Level1Transactions({
  level1,
  transactions,
  monthKey,
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

  const level1Transactions = transactions
    .filter(
      (t) =>
        t.categoryId === level1.id &&
        t.monthKey === monthKey
    )
    .sort((a, b) => {
      if (a.day && b.day) return a.day - b.day
      if (a.day && !b.day) return -1
      if (!a.day && b.day) return 1
      return 0
    })

  return (
    <>
      {level1Transactions.map((t) => (
  <TransactionRow
    key={t.id}
    t={t}
    monthIndex={monthIndex}
    selectedTransactions={selectedTransactions}
    toggleTransactionSelection={toggleTransactionSelection}
    editingTransactionId={editingTransactionId}
    setEditingTransactionId={setEditingTransactionId}
    movingTransactionId={movingTransactionId}
    setMovingTransactionId={setMovingTransactionId}
    setTransactions={setTransactions}
    categories={categories}
    moveRef={moveRef}
    createLevel3Category={createLevel3Category}
    moveTransaction={moveTransaction}
    getAllowedCategories={getAllowedCategories}
    formatAmount={formatAmount}
  />
))}
    </>
  )
}

export default React.memo(Level1Transactions);