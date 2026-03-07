"use client";
import React from "react";

import Level3Transactions from "./Level3Transactions";

import TransactionRow from "./TransactionRow";

export default function Level3Block({
    level3,
    transactions,
    monthKey,
    monthIndex,
    setTransactions,
    selectedTransactions,
    toggleTransactionSelection,
    editingTransactionId,
    setEditingTransactionId,
    movingTransactionId,
    setMovingTransactionId,
    moveRef,
    categories,
    formatAmount,
    createLevel3Category,
    moveTransaction,
    getAllowedCategories,
    children
}) {

    const level3Transactions = transactions
        .filter(
            (t) =>
                t.categoryId === level3.id &&
                t.monthKey === monthKey
        )
        .sort((a, b) => {
            if (a.day && b.day) return a.day - b.day
            if (a.day && !b.day) return -1
            if (!a.day && b.day) return 1
            return 0
        })

    const deleteTransaction = (id) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };
    return (
        <div className="space-y-2">
            {children}
            <Level3Transactions
                level3Transactions={level3Transactions}
                monthIndex={monthIndex}
                formatAmount={formatAmount}

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

                selectedTransactions={selectedTransactions}
                toggleTransactionSelection={toggleTransactionSelection}
            />
        </div>
    );
}