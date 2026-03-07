import TransactionRow from "./TransactionRow";

export default function Level3Transactions({
    level3Transactions,
    monthIndex,
    formatAmount,

    setTransactions,
    editingTransactionId,
    setEditingTransactionId,
    movingTransactionId,
    setMovingTransactionId,

    categories,
    moveRef,
    createLevel3Category,
    moveTransaction,
    getAllowedCategories,

    selectedTransactions,
    toggleTransactionSelection
}) {
    return (
        <>
            {level3Transactions.map((t) => (
                <TransactionRow
                    key={t.id}
                    t={t}
                    monthIndex={monthIndex}

                    setTransactions={setTransactions}
                    editingTransactionId={editingTransactionId}
                    setEditingTransactionId={setEditingTransactionId}
                    movingTransactionId={movingTransactionId}
                    setMovingTransactionId={setMovingTransactionId}

                    categories={categories}
                    moveRef={moveRef}
                    createLevel3Category={createLevel3Category}
                    moveTransaction={moveTransaction}
                    getAllowedCategories={getAllowedCategories}

                    formatAmount={formatAmount}

                    selectedTransactions={selectedTransactions}
                    toggleTransactionSelection={toggleTransactionSelection}
                />
            ))}
        </>
    );
}