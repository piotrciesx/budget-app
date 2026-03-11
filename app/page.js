"use client";
import dynamic from "next/dynamic";

const Level1Block = dynamic(
  () => import("../components/Level1Block").then((mod) => mod.default),
  { ssr: false }
);

import { useState, useEffect, useRef, useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import useTransactions from "../hooks/useTransactions";

import {
  getCategorySum,
  formatAmount,
  getSuggestions,
  getTopCategories,
  sortCategories
} from "../utils/categorySelectors";

import AddCategoryForm from "../components/AddCategoryForm";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { DragOverlay } from "@dnd-kit/core";

import DragPreview from "../components/DragPreview";

import useCategories from "../hooks/useCategories";

import useHeatmap from "../hooks/useHeatmap";

import { BudgetProvider } from "../context/BudgetContext";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { supabase } from "../lib/supabaseClient";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts";

export default function Home() {
  const [user, setUser] = useState(null);
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");

    if (saved === "true") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }

    setIsMounted(true);
  }, []);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === monthIndex &&
    today.getFullYear() === year;

  const {
    heatmapMode,
    setHeatmapMode,
    isEditingThresholds,
    setIsEditingThresholds,
    heatmapSettings,
    setHeatmapSettings,
    tempThresholds,
    setTempThresholds,
    activeThresholds
  } = useHeatmap();

  const [openLevel1, setOpenLevel1] = useState(null);
  const [openLevel2, setOpenLevel2] = useState(null);
  const [openLevel3, setOpenLevel3] = useState(null);
  const [sortModeLevel2, setSortModeLevel2] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sortModeLevel2") || "manual";
    }
    return "manual";
  });

  const [sortModeLevel3, setSortModeLevel3] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sortModeLevel3") || "manual";
    }
    return "manual";
  });
  const [showArchived, setShowArchived] = useState({});
  const [activeId, setActiveId] = useState(null);
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const isTransactionInMonth = (txDate, targetYear = year, targetMonthIndex = monthIndex) => {
    const d = new Date(txDate);

    return (
      d.getFullYear() === targetYear &&
      d.getMonth() === targetMonthIndex
    );
  };
  const previousMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const previousYear = monthIndex === 0 ? year - 1 : year;

  const previousMonthKey = `${previousYear}-${String(previousMonthIndex + 1).padStart(2, "0")}`;
  const {
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
  } = useTransactions(user, year, monthIndex);

  const moveRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        moveRef.current &&
        !moveRef.current.contains(event.target)
      ) {
        setMovingTransactionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const {
    categories,
    setCategories,
    categoriesById,
    getChildren,
    getLowestCategories,
    getCategoryLevel,
    getAllowedCategories,
    renameCategory,
    deleteCategory,
    closeCategory,
    reopenCategory,
    addCategoryLevel2,
    addCategoryLevel3
  } = useCategories();

  const activeCategory = categoriesById[activeId];

  const initialLevel2OrderRef = useRef(
    categories
      .filter(c => c.parentId === "expense")
      .map(c => c.id)
  );

  const [categorySettings, setCategorySettings] = useState({});

  const [activeSuggestionCategory, setActiveSuggestionCategory] = useState(null);
  const [suggestionBlacklist, setSuggestionBlacklist] = useState({});
  const [justAutofilled, setJustAutofilled] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("suggestionBlacklist");
    if (saved) {
      setSuggestionBlacklist(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (data?.user) {
        setUser(data.user);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "suggestionBlacklist",
      JSON.stringify(suggestionBlacklist)
    );
  }, [suggestionBlacklist]);

  useEffect(() => {
    const savedHeatmap = localStorage.getItem("heatmapSettings");

    if (savedHeatmap) {
      setHeatmapSettings(JSON.parse(savedHeatmap));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sortModeLevel2", sortModeLevel2);
  }, [sortModeLevel2]);

  useEffect(() => {
    localStorage.setItem("sortModeLevel3", sortModeLevel3);
  }, [sortModeLevel3]);

  useEffect(() => {
    localStorage.setItem("categorySettings", JSON.stringify(categorySettings));
  }, [categorySettings]);

  useEffect(() => {
    localStorage.setItem(
      "heatmapSettings",
      JSON.stringify(heatmapSettings)
    );
  }, [heatmapSettings]);

  useEffect(() => {
    if (!isMounted) return;

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode, isMounted]);

  const months = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];
  const getMaxDaysInMonth = (year, monthIndex) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };
  const isCategoryActiveInMonth = (category, monthKey) => {

    if (category.activePeriods) {
      return category.activePeriods.some(period => {
        const afterStart = monthKey >= period.start;
        const beforeEnd = !period.end || monthKey <= period.end;
        return afterStart && beforeEnd;
      });
    }

    if (category.startMonth && monthKey < category.startMonth) {
      return false;
    }

    if (category.endMonth && monthKey > category.endMonth) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    setSelectedTransactions([]);
  }, [monthIndex]);

  useEffect(() => {
    const createProfile = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      await supabase.from("profiles").upsert({
        id: user.id,
        user_id: user.id
      });
    };

    createProfile();
  }, []);

  const level1Categories = categories.filter(
    (cat) =>
      cat.parentId === null &&
      isCategoryActiveInMonth(cat, year, monthIndex)
  );

  const level1Ids = useMemo(
    () => level1Categories.map((c) => c.id),
    [level1Categories]
  );

  const previousMonth = () => {
    if (monthIndex === 0) {
      setMonthIndex(11);
      setYear(year - 1);
    } else {
      setMonthIndex(monthIndex - 1);
    }
  };

  const nextMonth = () => {
    if (monthIndex === 11) {
      setMonthIndex(0);
      setYear(year + 1);
    } else {
      setMonthIndex(monthIndex + 1);
    }
  };

  const getSuggestionsSelector = (categoryId, inputValue) => {
    return getSuggestions(
      categoryId,
      inputValue,
      transactions,
      suggestionBlacklist
    );
  };

  const handleAdd = (categoryId, amount, note, day) => {
    const success = addExpense(
      categoryId,
      amount,
      note,
      day
    );

    return success;
  };

  const addCategoryLevel2Income = (name) => {
    if (!name || !name.trim()) return;

    const newCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      parentId: "income",
      type: "income",
      activePeriods: [
        { start: monthKey, end: null }
      ],
    };

    setCategories((prev) => [...prev, newCategory]);
  };

  const createLevel3Category = (name, parentLevel2Id, type) => {
    const newCategory = {
      id: crypto.randomUUID(),
      name,
      parentId: parentLevel2Id,
      type,
      activePeriods: [
        { start: monthKey, end: null }
      ],
    };

    setCategories((prev) => [...prev, newCategory]);

    return newCategory.id;
  };

  const totalExpense = transactions
    .filter(
      (t) =>
        isTransactionInMonth(t.date) &&
        categories.find((c) => c.id === t.categoryId)?.type === "expense"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthExpense = transactions
    .filter((t) => {
      const d = new Date(t.date);

      return (
        d.getMonth() === previousMonthIndex &&
        d.getFullYear() === previousYear &&
        categories.find((c) => c.id === t.categoryId)?.type === "expense"
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthIncome = transactions
    .filter(
      (t) =>
        isTransactionInMonth(t.date, previousYear, previousMonthIndex) &&
        categories.find((c) => c.id === t.categoryId)?.type === "income"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeDifference =
    getCategorySum("income", transactions, categories) -
    previousMonthIncome;

  const incomePercentChange =
    previousMonthIncome === 0
      ? 0
      : (incomeDifference / previousMonthIncome) * 100;

  const previousMonthBalance =
    previousMonthIncome - previousMonthExpense;

  const currentBalance =
    getCategorySum("income", transactions, categories) -
    totalExpense;

  const balanceDifference =
    currentBalance - previousMonthBalance;

  const balancePercentChange =
    previousMonthBalance === 0
      ? 0
      : (balanceDifference / Math.abs(previousMonthBalance)) * 100;

  const expenseDifference = totalExpense - previousMonthExpense;

  const expensePercentChange =
    previousMonthExpense === 0
      ? 0
      : (expenseDifference / previousMonthExpense) * 100;

  const topExpenseCategories = (() => {
    const expenses = transactions.filter(
      t =>
        isTransactionInMonth(t.date) &&
        categories.find(c => c.id === t.categoryId)?.type === "expense"
    );

    const sums = {};

    expenses.forEach(t => {
      sums[t.categoryId] = (sums[t.categoryId] || 0) + t.amount;
    });

    return Object.entries(sums)
      .map(([categoryId, amount]) => ({
        category: categories.find(c => c.id === categoryId),
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  })();

  const balance =
    getCategorySum("income", transactions, categories) - totalExpense;

  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, monthIndex - i, 1);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const label = months[d.getMonth()].slice(0, 3);

    const expense = transactions
      .filter(
        (t) =>
          t.date === key &&
          categories.find((c) => c.id === t.categoryId)?.type === "expense"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    last6Months.push({
      name: label,
      value: expense,
    });
  }

  const last6MonthsIncome = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, monthIndex - i, 1);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const label = months[d.getMonth()].slice(0, 3);

    const income = transactions
      .filter(
        (t) =>
          t.date === key &&
          categories.find((c) => c.id === t.categoryId)?.type === "income"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    last6MonthsIncome.push({
      name: label,
      value: income,
    });
  }

  const last6MonthsBalance = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(year, monthIndex - i, 1);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const label = months[d.getMonth()].slice(0, 3);

    const income = transactions
      .filter(
        (t) =>
          t.date === key &&
          categories.find((c) => c.id === t.categoryId)?.type === "income"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(
        (t) =>
          t.date === key &&
          categories.find((c) => c.id === t.categoryId)?.type === "expense"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    last6MonthsBalance.push({
      name: label,
      value: income - expense,
    });
  }

  const pieData = [
    {
      name: "Przychody",
      value: getCategorySum("income", transactions, categories),
    },
    {
      name: "Wydatki",
      value: totalExpense,
    },
  ];

  const incomeCategory = categories.find(c => c.id === "income");
  const expenseCategory = categories.find(c => c.id === "expense");

  const getSelectedLevel1Types = () => {
    const selected = transactions.filter((t) =>
      selectedTransactions.includes(t.id)
    );

    const level1Types = selected.map((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      if (!category) return null;

      const level1 = category.parentId
        ? categories.find((c) => c.id === category.parentId)
        : category;

      return level1?.type;
    });

    return [...new Set(level1Types)];
  };

  const getCategorySetting = (categoryId) => {
    return categorySettings[categoryId] || {
      useDescription: true,
      useDay: true,
    };
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const level = getCategoryLevel(active.id);

    if (level === 2 && sortModeLevel2 !== "manual") {
      setSortModeLevel2("manual");
    }

    if (level === 3 && sortModeLevel3 !== "manual") {
      setSortModeLevel3("manual");
    }

    setCategories((prev) => {
      const activeItem = prev.find(c => c.id === active.id);
      const overItem = prev.find(c => c.id === over.id);

      if (!activeItem || !overItem) return prev;

      if (activeItem.parentId !== overItem.parentId) return prev;

      const siblings = prev.filter(c => c.parentId === activeItem.parentId);

      const oldIndex = siblings.findIndex(c => c.id === active.id);
      const newIndex = siblings.findIndex(c => c.id === over.id);

      const reorderedSiblings = [...siblings];
      const [moved] = reorderedSiblings.splice(oldIndex, 1);
      reorderedSiblings.splice(newIndex, 0, moved);

      let siblingIndex = 0;

      return prev.map(cat => {
        if (cat.parentId === activeItem.parentId) {
          return reorderedSiblings[siblingIndex++];
        }
        return cat;
      });
    });
  };

  const resetLevel2Order = () => {
    const initialOrder = initialLevel2OrderRef.current;

    setCategories((prev) => {
      const level2 = prev.filter(c => c.parentId === "expense");
      const others = prev.filter(c => c.parentId !== "expense");

      const reorderedLevel2 = initialOrder
        .map(id => level2.find(c => c.id === id))
        .filter(Boolean);

      return [...others, ...reorderedLevel2];
    });

    setSortModeLevel2("manual");
  };

  return (
    <BudgetProvider
      value={{
        categories,
        setCategories,
        categoriesById,
        getChildren,
        getLowestCategories,
        getCategoryLevel,
        getAllowedCategories,
        renameCategory,
        deleteCategory,
        closeCategory,
        reopenCategory,
        addCategoryLevel2,
        addCategoryLevel3,
        heatmapMode,
        setHeatmapMode,
        heatmapSettings,
        setHeatmapSettings,
        tempThresholds,
        setTempThresholds,
        activeThresholds,
        transactions,
        setTransactions
      }}
    >
      <main className="h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 transition-colors">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <div className="grid grid-cols-[80px_1fr_auto] items-center">

              {/* LEWA STRZAŁKA */}
              <div className="flex justify-start">
                <button
                  onClick={previousMonth}
                  className="group w-11 h-11 flex items-center justify-center rounded-full
           bg-gradient-to-br from-gray-100 to-gray-200
           dark:from-gray-700 dark:to-gray-600
           shadow-md hover:shadow-lg
           active:scale-95
           transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover:-translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* ŚRODEK */}
              <h1 className="text-xl font-semibold text-center">
                {months[monthIndex]} {year}
              </h1>

              {/* PRAWA STRONA */}
              <div className="flex justify-end items-center gap-3">
                <button
                  onClick={nextMonth}
                  className="group w-11 h-11 flex items-center justify-center rounded-full
           bg-gradient-to-br from-gray-100 to-gray-200
           dark:from-gray-700 dark:to-gray-600
           shadow-md hover:shadow-lg
           active:scale-95
           transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button onClick={loginWithGoogle}>
                  🔑 Zaloguj się przez Google
                </button>

                <button
                  onClick={() => {
                    if (confirm("Na pewno wyczyścić cały miesiąc?")) {
                      clearMonth();
                    }
                  }}
                  className="w-11 h-11 flex items-center justify-center rounded-full
             bg-red-100 hover:bg-red-200
             dark:bg-red-900 dark:hover:bg-red-800
             transition-all duration-200 active:scale-95"
                >
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 7h12M9 7V5h6v2m-7 0v12m4-12v12m4-12v12M5 7h14l-1 14H6L5 7z"
                    />
                  </svg>
                </button>
                <button
                  onClick={clearAllHistory}
                  className="ml-3 px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Reset całości
                </button>
                {isMounted && (
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="ml-2 px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
                  >
                    {darkMode ? "☀️" : "🌙"}
                  </button>
                )}
              </div>

            </div>
          </div>
          {/* DASHBOARD */}
          <h2 className="text-xl font-semibold mb-2">
            Dashboard
          </h2>
          <div className="grid grid-cols-2 gap-4 auto-rows-fr">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm opacity-70">
                <div className="flex justify-between items-center">
                  <span>Liczba transakcji</span>
                  <span>
                    {
                      transactions.filter(t => isTransactionInMonth(t.date)).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Największy wydatek</span>
                  <span>
                    {
                      Math.max(
                        0,
                        ...transactions
                          .filter(
                            t =>
                              isTransactionInMonth(t.date) &&
                              categories.find(c => c.id === t.categoryId)?.type === "expense"
                          )
                          .map(t => t.amount)
                      ).toFixed(2)
                    } zł
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Średni wydatek</span>
                  <span>
                    {
                      (() => {
                        const expenses = transactions.filter(
                          t =>
                            isTransactionInMonth(t.date) &&
                            categories.find(c => c.id === t.categoryId)?.type === "expense"
                        );

                        if (expenses.length === 0) return "0.00";

                        const sum = expenses.reduce((s, t) => s + t.amount, 0);
                        return (sum / expenses.length).toFixed(2);
                      })()
                    } zł
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Największa kategoria</span>
                  <span>
                    {
                      (() => {
                        const expenses = transactions.filter(
                          t =>
                            isTransactionInMonth(t.date) &&
                            categories.find(c => c.id === t.categoryId)?.type === "expense"
                        );

                        if (expenses.length === 0) return "-";

                        const sums = {};

                        expenses.forEach(t => {
                          sums[t.categoryId] = (sums[t.categoryId] || 0) + t.amount;
                        });

                        const top = Object.entries(sums).sort((a, b) => b[1] - a[1])[0];

                        const cat = categories.find(c => c.id === top[0]);

                        return cat?.name || "-";
                      })()
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold opacity-70 mt-4">
                Top kategorie wydatków
              </h3>

              <div className="mt-2 space-y-1 text-sm">
                {topExpenseCategories.map((item, index) => {
                  const percent = Math.round((item.amount / totalExpense) * 100);

                  return (
                    <div key={item.category?.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          {index + 1}. {item.category?.name}
                        </span>

                        <span className="text-red-500">
                          {formatAmount(item.amount)} zł ({percent}%)
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded">
                        <div
                          className="bg-red-500 h-2 rounded"
                          style={{ width: `${Math.max(percent, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-green-600">
                  <Icon name="plusCircle" />
                  <span>{incomeCategory?.name}</span>
                </div>
                <span className="text-green-600">
                  {formatAmount(getCategorySum("income", transactions, categories))} zł
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-red-600">
                  <Icon name="minusCircle" />
                  <span>{expenseCategory?.name}</span>
                </div>
                <span className="text-red-600">
                  {formatAmount(totalExpense)} zł
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Bilans:</span>
                <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatAmount(balance)} zł
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold opacity-70 mb-2">
                Przychody vs Wydatki
              </h3>

              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      animationDuration={600}
                      animationEasing="ease-out"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold opacity-70 mb-2">
                Historia przychodów (6 miesięcy)
              </h3>

              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={last6MonthsIncome}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#22c55e"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold opacity-70 mb-2">
                Historia wydatków (6 miesięcy)
              </h3>

              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={last6Months}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold opacity-70 mb-2">
                Historia bilansu (6 miesięcy)
              </h3>

              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <AreaChart data={last6MonthsBalance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />

                    <ReferenceLine y={0} stroke="#888" />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#22c55e"
                      fillOpacity={0.4}
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold opacity-70 mb-2">
                Trend przychodów
              </h3>

              <div className="flex justify-between text-sm">
                <span>Poprzedni miesiąc</span>
                <span>{formatAmount(previousMonthIncome)} zł</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Ten miesiąc</span>
                <span>
                  {formatAmount(
                    getCategorySum("income", transactions, categories)
                  )} zł
                </span>
              </div>

              <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                <span>Zmiana</span>

                <span
                  className={
                    incomeDifference > 0
                      ? "text-green-500"
                      : incomeDifference < 0
                        ? "text-red-500"
                        : ""
                  }
                >
                  {formatAmount(incomeDifference)} zł
                  {" "}
                  ({incomePercentChange.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold opacity-70 mb-2">
                Trend wydatków
              </h3>

              <div className="flex justify-between text-sm">
                <span>Poprzedni miesiąc</span>
                <span>{formatAmount(previousMonthExpense)} zł</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Ten miesiąc</span>
                <span>{formatAmount(totalExpense)} zł</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                <span>Zmiana</span>

                <span
                  className={
                    expenseDifference > 0
                      ? "text-red-500"
                      : expenseDifference < 0
                        ? "text-green-500"
                        : ""
                  }
                >
                  {formatAmount(expenseDifference)} zł
                  {" "}
                  ({expensePercentChange.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold opacity-70 mb-2">
                Trend bilansu
              </h3>

              <div className="flex justify-between text-sm">
                <span>Poprzedni miesiąc</span>
                <span>{formatAmount(previousMonthBalance)} zł</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Ten miesiąc</span>
                <span>{formatAmount(currentBalance)} zł</span>
              </div>

              <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                <span>Zmiana</span>

                <span
                  className={
                    balanceDifference > 0
                      ? "text-green-500"
                      : balanceDifference < 0
                        ? "text-red-500"
                        : ""
                  }
                >
                  {formatAmount(balanceDifference)} zł
                  {" "}
                  ({balancePercentChange.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>



          {selectedTransactions.length > 0 && (
              <div style={{ padding: "10px", background: "#eef", marginBottom: "10px" }}>
                <span>Zaznaczone: {selectedTransactions.length}</span>

                {new Set(
                  transactions
                    .filter((t) => selectedTransactions.includes(t.id))
                    .map((t) => categories.find((c) => c.id === t.categoryId)?.type)
                ).size === 1 && (
                    <select
  onChange={async (e) => {
    const value = e.target.value;
    if (!value) return;

    const { error } = await supabase
      .from("transactions")
      .update({ category_id: value })
      .in("id", selectedTransactions);

    if (error) {
      console.error("Błąd przenoszenia zaznaczonych transakcji:", error);
      alert("Nie udało się przenieść zaznaczonych transakcji.");
      return;
    }

    setTransactions((prev) =>
      prev.map((t) =>
        selectedTransactions.includes(t.id)
          ? { ...t, categoryId: value, category_id: value }
          : t
      )
    );

    setSelectedTransactions([]);
  }}
  defaultValue=""
  style={{ marginLeft: "10px" }}
>
                      <option value="" disabled>
                        Przenieś do...
                      </option>

                      {selectedTransactions.length > 0 && (
                        (() => {

                          const selectedCategories = [
                            ...new Set(
                              transactions
                                .filter((t) => selectedTransactions.includes(t.id))
                                .map((t) => t.categoryId)
                            ),
                          ];
                          const firstSelected = transactions.find((t) =>
                            selectedTransactions.includes(t.id)
                          );

                          const sameType =
                            new Set(
                              transactions
                                .filter((t) => selectedTransactions.includes(t.id))
                                .map((t) => categories.find((c) => c.id === t.categoryId)?.type)
                            ).size === 1;

                          if (!firstSelected) return null;

                                                    let allowed;

                          if (selectedCategories.length === 1) {

                            allowed = getAllowedCategories(selectedCategories[0]);
                          } else {

                            const first = transactions.find((t) =>
                              selectedTransactions.includes(t.id)
                            );

                            const currentCategory = categories.find(
                              (c) => c.id === first.categoryId
                            );

                            allowed = categories.filter((cat) => {
                              if (cat.type !== currentCategory.type) return false;
                              if (!isCategoryActiveInMonth(cat, monthKey)) return false;
                              if (cat.id === "income" || cat.id === "expense") return false;

                              const hasChildren = categories.some(
                                (child) => child.parentId === cat.id
                              );

                              return !hasChildren;
                            });
                          }

                          allowed = allowed.filter((cat) => {
                            const hasChildren = categories.some(
                              (child) => child.parentId === cat.id
                            );

                            return !hasChildren;
                          });

                          const currentCategory = categories.find(
                            (c) => c.id === firstSelected.categoryId
                          );

                          const currentLevel2Id = currentCategory.parentId;

                          const first = allowed.filter((cat) => {
                            return cat.parentId === currentLevel2Id;
                          });

                          const second = allowed.filter((cat) => {
                            return cat.parentId !== currentLevel2Id;
                          });

                          const sorted = [...first, ...second];

                          const grouped = {};

                          sorted.forEach((cat) => {
                            const level2Name = categories.find(
                              (c) => c.id === cat.parentId
                            )?.name || "Inne";

                            if (!grouped[level2Name]) {
                              grouped[level2Name] = [];
                            }

                            grouped[level2Name].push(cat);
                          });

                          return Object.entries(grouped).map(([level2Name, cats]) => (
                            <optgroup key={level2Name} label={level2Name}>
                              {cats.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </optgroup>
                          ));
                                                })()
                      )}
                    </select>
                  )}

                <button
                  onClick={() => setSelectedTransactions([])}
                  style={{ marginLeft: "10px" }}
                >
                  Anuluj
                </button>
                <button
                  onClick={deleteSelectedTransactions}
                  style={{ marginLeft: "10px", color: "red" }}
                >
                  Usuń zaznaczone
                </button>
              </div>
            )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-3">

            <h3 className="text-sm font-semibold opacity-70">
              ⚡ Szybki dostęp
            </h3>

            {/* WYDATKI */}
            {getTopCategories("expense", transactions, categories).length > 0 && (
              <div>
                <div className="text-xs mb-2 text-red-500 font-medium">
                  Wydatki
                </div>

                <div className="flex flex-wrap gap-2">
                  {getTopCategories("expense", transactions, categories, monthKey).map((item) => {
                    const parent = categories.find(
                      (c) => c.id === item.category.parentId
                    );

                    return (
                      <button
                        key={item.category.id}
                        onClick={() => {
                          const selected = item.category;

                          const level = getCategoryLevel(selected.id);

                          if (level === 3) {
                            const level2 = categories.find(c => c.id === selected.parentId);
                            const level1 = categories.find(c => c.id === level2?.parentId);

                            if (level1) setOpenLevel1(level1.id);
                            if (level2) setOpenLevel2(level2.id);
                            setOpenLevel3(selected.id);
                          }

                          if (level === 2) {
                            const level1 = categories.find(c => c.id === selected.parentId);

                            if (level1) setOpenLevel1(level1.id);
                            setOpenLevel2(selected.id);
                          }

                          setTimeout(() => {
                            const el = document.getElementById(`category-${selected.id}`);
                            if (el) {
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                              });
                            }
                          }, 150);
                        }}
                        className="text-xs px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 hover:opacity-80 transition"
                      >
                        {parent?.name ? parent.name + " → " : ""}
                        {item.category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PRZYCHODY */}
            {getTopCategories("income", transactions, categories).length > 0 && (
              <div>
                <div className="text-xs mb-2 text-green-500 font-medium">
                  Przychody
                </div>

                <div className="flex flex-wrap gap-2">
                  {getTopCategories("income", transactions, categories, monthKey).map((item) => {
                    const parent = categories.find(
                      (c) => c.id === item.category.parentId
                    );

                    return (
                      <button
                        key={item.category.id}
                        onClick={() => {
                          const selected = item.category;

                          const level = getCategoryLevel(selected.id);

                          if (level === 3) {
                            const level2 = categories.find(c => c.id === selected.parentId);
                            const level1 = categories.find(c => c.id === level2?.parentId);

                            if (level1) setOpenLevel1(level1.id);
                            if (level2) setOpenLevel2(level2.id);
                            setOpenLevel3(selected.id);
                          }

                          if (level === 2) {
                            const level1 = categories.find(c => c.id === selected.parentId);

                            if (level1) setOpenLevel1(level1.id);
                            setOpenLevel2(selected.id);
                          }

                          setTimeout(() => {
                            const el = document.getElementById(`category-${selected.id}`);
                            if (el) {
                              el.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                              });
                            }
                          }, 150);
                        }}
                        className="text-xs px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 hover:opacity-80 transition"
                      >
                        {parent?.name ? parent.name + " → " : ""}
                        {item.category.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            autoScroll={true}
            onDragStart={(event) => {
              if (document.activeElement) {
                document.activeElement.blur();
              }
              const draggedId = event.active.id;
              setActiveId(draggedId);

              const level = getCategoryLevel(draggedId);

              if (level === 1) {
                const element = document.getElementById(`category-${draggedId}`);
                if (element) {
                  const beforeTop = element.getBoundingClientRect().top;

                  setOpenLevel1(null);

                  requestAnimationFrame(() => {
                    const afterTop = element.getBoundingClientRect().top;
                    const diff = afterTop - beforeTop;
                    window.scrollBy(0, diff);
                  });
                }
              }

              if (level === 2) {
                setOpenLevel2(null);
              }

              if (level === 3) {
                setOpenLevel3(null);
              }
            }}
            onDragEnd={(event) => {
              setActiveId(null);
              handleDragEnd(event);
            }}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext
              items={level1Ids}
              strategy={verticalListSortingStrategy}
            >
              {level1Categories.map((level1) => {
                const isOpenLevel1 = openLevel1 === level1.id;
                const childrenLevel2 = getChildren(level1.id);
                const hasLevel2 = childrenLevel2.length > 0;

                const isIncome = level1.type === "income";

                return (
                  <Level1Block
                    key={level1.id}

                    level1={level1}
                    openLevel1={openLevel1}
                    setOpenLevel1={setOpenLevel1}
                    getChildren={getChildren}

                    formatAmount={formatAmount}
                    getCategorySum={getCategorySum}

                    transactions={transactions}
                    categories={categories}

                    activeId={activeId}

                    getCategorySetting={getCategorySetting}
                    setCategorySettings={setCategorySettings}

                    AddCategoryForm={AddCategoryForm}

                    sortModeLevel2={sortModeLevel2}
                    setSortModeLevel2={setSortModeLevel2}
                    sortModeLevel3={sortModeLevel3}
                    setSortModeLevel3={setSortModeLevel3}

                    openLevel2={openLevel2}
                    setOpenLevel2={setOpenLevel2}
                    openLevel3={openLevel3}
                    setOpenLevel3={setOpenLevel3}

                    closeCategory={closeCategory}
                    reopenCategory={reopenCategory}
                    deleteCategory={deleteCategory}
                    renameCategory={renameCategory}

                    addCategoryLevel2={addCategoryLevel2}
                    addCategoryLevel2Income={addCategoryLevel2Income}
                    addCategoryLevel3={addCategoryLevel3}

                    addExpense={addExpense}
                    moveTransaction={moveTransaction}
                    createLevel3Category={createLevel3Category}

                    getSuggestionsSelector={getSuggestionsSelector}
                    getAllowedCategories={getAllowedCategories}
                    isCategoryActiveInMonth={isCategoryActiveInMonth}
                    sortCategories={sortCategories}

                    selectedTransactions={selectedTransactions}
                    toggleTransactionSelection={toggleTransactionSelection}
                    editingTransactionId={editingTransactionId}
                    setEditingTransactionId={setEditingTransactionId}
                    movingTransactionId={movingTransactionId}
                    setMovingTransactionId={setMovingTransactionId}
                    setTransactions={setTransactions}

                    suggestionBlacklist={suggestionBlacklist}
                    setSuggestionBlacklist={setSuggestionBlacklist}

                    showArchived={showArchived}
                    setShowArchived={setShowArchived}

                    resetLevel2Order={resetLevel2Order}

                    getMaxDaysInMonth={getMaxDaysInMonth}
                    monthIndex={monthIndex}
                    year={year}

                    moveRef={moveRef}
                  >
                  </Level1Block>
                );
              })}
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeId ? (
                <DragPreview category={activeCategory} />
              ) : null}
            </DragOverlay>
          </DndContext>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <div className="grid grid-cols-[80px_1fr_auto] items-center">

              {/* LEWA STRZAŁKA */}
              <div className="flex justify-start">
                <button
                  onClick={previousMonth}
                  className="group w-11 h-11 flex items-center justify-center rounded-full
           bg-gradient-to-br from-gray-100 to-gray-200
           dark:from-gray-700 dark:to-gray-600
           shadow-md hover:shadow-lg
           active:scale-95
           transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover:-translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              {/* ŚRODEK */}
              <h1 className="text-xl font-semibold text-center">
                {months[monthIndex]} {year}
              </h1>

              {/* PRAWA STRONA */}
              <div className="flex justify-end items-center gap-3">
                <button
                  onClick={nextMonth}
                  className="group w-11 h-11 flex items-center justify-center rounded-full
           bg-gradient-to-br from-gray-100 to-gray-200
           dark:from-gray-700 dark:to-gray-600
           shadow-md hover:shadow-lg
           active:scale-95
           transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 text-gray-700 dark:text-gray-200 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    if (confirm("Na pewno wyczyścić cały miesiąc?")) {
                      clearMonth();
                    }
                  }}
                  className="w-11 h-11 flex items-center justify-center rounded-full
             bg-red-100 hover:bg-red-200
             dark:bg-red-900 dark:hover:bg-red-800
             transition-all duration-200 active:scale-95"
                >
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 7h12M9 7V5h6v2m-7 0v12m4-12v12m4-12v12M5 7h14l-1 14H6L5 7z"
                    />
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </BudgetProvider>
  );
}

function Icon({ name, className = "w-5 h-5" }) {
  const icons = {
    income: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v6c0 1.7 3 3 7 3s7-1.3 7-3V6" />
        <path d="M5 12v6c0 1.7 3 3 7 3s7-1.3 7-3v-6" />
      </svg>
    ),
    fixed: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 8h16M4 12h16M4 16h16" />
      </svg>
    ),
    variable: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M8 7l4-4 4 4M8 17l4 4 4-4" />
      </svg>
    ),
    home: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 10l9-7 9 7v10H3z" />
      </svg>
    ),
    percent: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="17" r="2" />
        <path d="M7 17L17 7" />
      </svg>
    ),
    tv: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8" />
      </svg>
    ),
    box: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 7l9 4 9-4-9-4-9 4z" />
        <path d="M3 7v10l9 4 9-4V7" />
      </svg>
    ),
    plane: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M2 16l20-8-8 20-2-9-10-3z" />
      </svg>
    ),
    burger: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 10h18M5 14h14M4 10a8 8 0 0116 0" />
      </svg>
    ),
    gift: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="8" width="18" height="13" />
        <path d="M12 8v13M3 12h18M12 3c2 0 3 1 3 3H9c0-2 1-3 3-3z" />
      </svg>
    ),
    cart: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2 13h13l3-8H6" />
      </svg>
    ),
    plusCircle: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),

    minusCircle: (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
      </svg>
    ),
  };

  return icons[name] || null;
}
