import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useTransactions(user, year, monthIndex) {
  const [transactions, setTransactions] = useState([]);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [movingTransactionId, setMovingTransactionId] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const loadTransactions = async () => {
      const safeYear = year ?? new Date().getFullYear();
      const safeMonth = monthIndex ?? new Date().getMonth();

      const startOfMonth = new Date(safeYear, safeMonth, 1);
      const endOfMonth = new Date(safeYear, safeMonth + 1, 1);

      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startOfMonth.toISOString())
        .lt("date", endOfMonth.toISOString())
        .order("date", { ascending: true });

      if (error) {
        console.error("Błąd pobierania transakcji:", error);
        return;
      }

      setTransactions(
        (data || []).map(t => ({
          ...t,
          categoryId: t.category_id
        }))
      );
    };

    loadTransactions();
  }, [user?.id, year, monthIndex]);

  const addExpense = async (categoryId, amount, note = null, day = null) => {
  if (!amount || amount.trim() === "") {
    alert("Kwota jest wymagana.");
    return false;
  }

  const cleanedAmount = String(amount).replace(",", ".").trim();
  const parsedAmount = parseFloat(cleanedAmount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    alert("Kwota musi być większa od zera.");
    return false;
  }

  const safeYear = year ?? new Date().getFullYear();
  const safeMonth = monthIndex ?? new Date().getMonth();
  const normalizedDay = String(day ?? "").trim();

  let effectiveDay = 1;

  if (normalizedDay !== "") {
    const parsedDay = Number(normalizedDay);
    const maxDay = new Date(safeYear, safeMonth + 1, 0).getDate();

    if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > maxDay) {
      alert(`Dzień musi być z zakresu 1-${maxDay}.`);
      return false;
    }

    effectiveDay = parsedDay;
  }

  const newDate = new Date(safeYear, safeMonth, effectiveDay, 12).toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        user_id: user.id,
        category_id: categoryId,
        amount: parsedAmount,
        description: note,
        date: newDate,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    alert("Nie udało się zapisać transakcji.");
    return false;
  }

  setTransactions((prev) => [
    ...prev,
    {
      ...data,
      categoryId: data.category_id,
    },
  ]);

  return true;
};

    const moveTransaction = (transactionId, newCategoryId) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === transactionId
          ? { ...t, category_id: newCategoryId, categoryId: newCategoryId }
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

  const deleteSelectedTransactions = async () => {

    const { error } = await supabase
      .from("transactions")
      .delete()
      .in("id", selectedTransactions);

    if (error) {
      console.error("Błąd usuwania:", error);
      alert("Nie udało się usunąć transakcji.");
      return;
    }

    setTransactions(prev =>
      prev.filter(t => !selectedTransactions.includes(t.id))
    );

    setSelectedTransactions([]);
  };

  const clearMonth = async () => {

    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex + 1, 1);

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", user.id)
      .gte("date", startOfMonth.toISOString())
      .lt("date", endOfMonth.toISOString());

    if (error) {
      console.error("Błąd usuwania miesiąca:", error);
      alert("Nie udało się usunąć transakcji.");
      return;
    }

    setTransactions([]);
  };

  const clearAllHistory = async () => {

    const confirmReset = window.confirm(
      "To usunie CAŁĄ historię transakcji. Kontynuować?"
    );

    if (!confirmReset) return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Błąd czyszczenia historii:", error);
      alert("Nie udało się usunąć historii.");
      return;
    }

    setTransactions([]);
    setSelectedTransactions([]);
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