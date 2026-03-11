"use client";
import React from "react";

import Level3Transactions from "./Level3Transactions";

import TransactionRow from "./TransactionRow";

export default function Level3Block({
    level3,
    transactions,
    monthKey,
    monthIndex,
    year,
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
    .filter((t) => {
        const d = new Date(t.date);

        return (
            t.categoryId === level3.id &&
            d.getFullYear() === year &&
            d.getMonth() === monthIndex
        );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

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