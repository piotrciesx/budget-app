import { useState, useEffect } from "react";

export default function useTransactions(monthKey) {

  const [transactions, setTransactions] = useState([]);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [movingTransactionId, setMovingTransactionId] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions");

    if (savedTransactions) {
      const parsed = JSON.parse(savedTransactions);

      const fixed = parsed.map(t => {
        if (!t.monthKey || !t.monthKey.includes("-")) return t;

        const [y, m] = t.monthKey.split("-");

        return {
          ...t,
          monthKey: `${y}-${m.padStart(2, "0")}`
        };
      });

      setTransactions(fixed);

      localStorage.setItem("transactions", JSON.stringify(fixed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addExpense = (categoryId, amount, note = null, day = null) => {

    if (!amount || amount.trim() === "") {
      alert("Kwota jest wymagana.");
      return false;
    }

    const cleaned = amount.replace(",", ".").trim();
    const parsedAmount = parseFloat(cleaned);

    if (isNaN(parsedAmount)) {
      alert("Podaj poprawną kwotę.");
      return false;
    }

    const newTransaction = {
      id: Date.now(),
      monthKey,
      categoryId,
      amount: parsedAmount,
      note: note && note.trim() !== "" ? note.trim() : null,
      day: day ? Number(day) : null,
    };

    setTransactions(prev => [...prev, newTransaction]);

    return true;
  };

  const moveTransaction = (transactionId, newCategoryId) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? { ...t, categoryId: newCategoryId }
          : t
      )
    );
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev =>
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const deleteSelectedTransactions = () => {
    if (selectedTransactions.length === 0) return;

    const confirmDelete = window.confirm(
      `Usunąć ${selectedTransactions.length} zaznaczonych wpisów?`
    );

    if (!confirmDelete) return;

    setTransactions(prev =>
      prev.filter(t => !selectedTransactions.includes(t.id))
    );

    setSelectedTransactions([]);
  };

  const clearMonth = () => {
    setTransactions(prev =>
      prev.filter(t => t.monthKey !== monthKey)
    );
  };

  const clearAllHistory = () => {
    const confirmReset = window.confirm(
      "To usunie CAŁĄ historię transakcji. Kontynuować?"
    );

    if (!confirmReset) return;

    setTransactions([]);
    setSelectedTransactions([]);
    localStorage.removeItem("transactions");
  };

  return {
    transactions,
    setTransactions,

    editingTransactionId,
    setEditingTransactionId,

    movingTransactionId,
    setMovingTransactionId,

    selectedTransactions,
    setSelectedTransactions,

    addExpense,
    moveTransaction,
    toggleTransactionSelection,
    deleteSelectedTransactions,
    clearMonth,
    clearAllHistory
  };
}