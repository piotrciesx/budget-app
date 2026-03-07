"use client";
import dynamic from "next/dynamic";

const Level1Block = dynamic(
  () => import("../components/Level1Block").then((mod) => mod.default),
  { ssr: false }
);

import { useState, useEffect, useRef, useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import React from "react";

import Level2AddForm from "../components/Level2AddForm";

import Level2Item from "../components/Level2Item";

import Level3Block from "../components/Level3Block";

import useTransactions from "../hooks/useTransactions";

import {
  getCategorySum,
  formatAmount,
  getSuggestions,
  getTopCategories
} from "../utils/categorySelectors";

import AddCategoryForm from "../components/AddCategoryForm";

import Level3AddForm from "../components/Level3AddForm";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { DragOverlay } from "@dnd-kit/core";

import CategoryRow from "../components/CategoryRow";

import DragPreview from "../components/DragPreview";

export default function Home() {
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
  const [selectedDay, setSelectedDay] = useState(null);
  const [expenseInputs, setExpenseInputs] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const [dayInputs, setDayInputs] = useState({});
  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === monthIndex &&
    today.getFullYear() === year;

  const [heatmapMode, setHeatmapMode] = useState("static");
  // static = obecne progi
  // dynamic = skalowane względem max dnia
  const [isEditingThresholds, setIsEditingThresholds] = useState(false);
  const [tempThresholds, setTempThresholds] = useState([]);
  const [heatmapSettings, setHeatmapSettings] = useState({
    global: [10, 20, 30, 50, 70, 90],
    monthly: {}
  });
  // DRZEWO – sterowanie poziomami
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
} = useTransactions(monthKey);

  // =======================
  // NOWY MODEL DANYCH 1.0
  // =======================

  // wszystkie transakcje (zastąpi incomes/fixed/variable w ETAPIE 2)
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

  // drzewo kategorii (3 poziomy)
  const [categories, setCategories] = useState([
    // ===== POZIOM 1 =====
    {
      id: "income",
      name: "Przychody",
      parentId: null,
      type: "income",
    },
    {
      id: "expense",
      name: "Wydatki",
      parentId: null,
      type: "expense",
    },

    // ===== POZIOM 2 (WYDATKI) =====
    {
      id: "fixed",
      name: "Stałe",
      parentId: "expense",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
    {
      id: "variable",
      name: "Zmienne",
      parentId: "expense",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },

    // ===== POZIOM 3 – FIXED =====
    {
      id: "mieszkanie",
      name: "Mieszkanie i rachunki",
      parentId: "fixed",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
    {
      id: "raty",
      name: "Raty",
      parentId: "fixed",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
    {
      id: "subskrypcje",
      name: "Subskrypcje",
      parentId: "fixed",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
    {
      id: "pozostale_fixed",
      name: "Pozostałe",
      parentId: "fixed",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },

    // ===== POZIOM 3 – VARIABLE =====
    {
      id: "podroze",
      name: "Podróże",
      parentId: "variable",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
    {
      id: "jedzenie",
      name: "Jedzenie poza domem",
      parentId: "variable",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
    {
      id: "okolicznosciowe",
      name: "Okolicznościowe",
      parentId: "variable",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
    {
      id: "pozostale_variable",
      name: "Pozostałe",
      parentId: "variable",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
    {
      id: "codzienne",
      name: "Codzienne",
      parentId: "variable",
      type: "expense",
      activePeriods: [
        { start: "2000-01", end: null }
      ],
    },
  ]);

  const categoriesById = useMemo(() => {
    return Object.fromEntries(
      categories.map(c => [c.id, c])
    );
  }, [categories]);

  const activeCategory = categoriesById[activeId];

  const initialLevel2OrderRef = useRef(
    categories
      .filter(c => c.parentId === "expense")
      .map(c => c.id)
  );

  // ustawienia per kategoria (checkbox data/opis)
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

    // 🆕 NOWY MODEL (activePeriods)
    if (category.activePeriods) {
      return category.activePeriods.some(period => {
        const afterStart = monthKey >= period.start;
        const beforeEnd = !period.end || monthKey <= period.end;
        return afterStart && beforeEnd;
      });
    }

    // 🔄 STARY MODEL (startMonth / endMonth)
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
  }, [monthKey]);
  // ===== SELECTORY DRZEWA KATEGORII =====

  const level1Categories = categories.filter(
    (cat) =>
      cat.parentId === null &&
      isCategoryActiveInMonth(cat, monthKey)
  );

  const level1Ids = useMemo(
    () => level1Categories.map((c) => c.id),
    [level1Categories]
  );

  const allCategoryIds = useMemo(() => {
    return categories.map(c => c.id);
  }, [categories]);

  const getChildren = (parentId) =>
    categories.filter((cat) => {
      if (cat.parentId !== parentId) return false;

      const parent = categories.find(c => c.id === parentId);

      if (!parent) return false;

      if (!isCategoryActiveInMonth(parent, monthKey)) return false;

      if (!isCategoryActiveInMonth(cat, monthKey)) return false;

      return true;
    });

  const getLowestCategories = () => {
    return categories.filter((cat) => {
      const hasChildren = categories.some(
        (c) => c.parentId === cat.id
      );
      return !hasChildren;
    });
  };

  // 🔵 SORTOWANIE KATEGORII
  const sortCategories = (categoriesList, mode) => {
    if (mode === "manual") {
      return categoriesList;
    }

    const getUsage = (catId) => {
      const childIds = categories
        .filter(c => c.parentId === catId)
        .map(c => c.id);

      return transactions.filter(
        t =>
          (t.categoryId === catId || childIds.includes(t.categoryId)) &&
          t.monthKey === monthKey
      ).length;
    };

    const getAmount = (catId) => {
      const childIds = categories
        .filter(c => c.parentId === catId)
        .map(c => c.id);

      return transactions
        .filter(
          t =>
            (t.categoryId === catId || childIds.includes(t.categoryId)) &&
            t.monthKey === monthKey
        )
        .reduce((sum, t) => sum + t.amount, 0);
    };

    const sorted = [...categoriesList];

    if (mode === "usage-desc") {
      sorted.sort((a, b) =>
        getUsage(b.id) - getUsage(a.id) ||
        a.id.localeCompare(b.id)
      );
    }

    if (mode === "usage-asc") {
      sorted.sort((a, b) =>
        getUsage(a.id) - getUsage(b.id) ||
        a.id.localeCompare(b.id)
      );
    }

    if (mode === "amount-desc") {
      sorted.sort((a, b) =>
        getAmount(b.id) - getAmount(a.id) ||
        a.id.localeCompare(b.id)
      );
    }

    if (mode === "amount-asc") {
      sorted.sort((a, b) =>
        getAmount(a.id) - getAmount(b.id) ||
        a.id.localeCompare(b.id)
      );
    }

    return sorted;
  };

  const getCategoryLevel = (categoryId) => {
    let level = 0;
    let current = categories.find(c => c.id === categoryId);

    while (current) {
      level++;
      current = categories.find(c => c.id === current.parentId);
    }

    return level; // 1, 2 lub 3
  };

  const getAllowedCategories = (currentCategoryId) => {
    const currentCategory = categories.find(
      (c) => c.id === currentCategoryId
    );

    // znajdź Level1
    const level2 = categories.find(
      (c) => c.id === currentCategory.parentId
    );

    const level1 = categories.find(
      (c) => c.id === level2?.parentId
    );

    return categories.filter((cat) => {
      if (cat.id === currentCategoryId) return false;
      // blokada między income / expense
      if (cat.type !== currentCategory.type) return false;

      const hasChildren = categories.some(
        (c) => c.parentId === cat.id
      );

      const currentHasChildren = categories.some(
        (c) => c.parentId === currentCategory.id
      );

      // 1️⃣ Jeśli jesteśmy w Level3
      if (!currentHasChildren) {
        // możemy przejść:
        // - do innego Level3 w tym samym Level1
        // - LUB do Level2, który nie ma Level3
        const catHasChildren = categories.some(
          (c) => c.parentId === cat.id
        );

        if (catHasChildren) return false;

        return true;
      }

      // 2️⃣ Jeśli jesteśmy w Level2
      if (currentHasChildren === false) {
        return true;
      }

      return true;
    });
  };

  const activeThresholds =
    heatmapSettings.monthly[monthKey] ||
    heatmapSettings.global;

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

  const deleteCategory = (categoryId) => {

    // 🚫 blokada Level1
    if (categoryId === "income" || categoryId === "expense") {
      alert("Nie można usunąć głównej kategorii systemowej.");
      return;
    }

    // 🔹 blokada jeśli ma dzieci
    const hasChildren = categories.some(
      cat => cat.parentId === categoryId
    );

    if (hasChildren) {
      alert("Nie można usunąć kategorii, ponieważ zawiera podkategorie.");
      return;
    }

    // 🔹 blokada jeśli ma historię
    const hasTransactions = transactions.some(
      t => t.categoryId === categoryId
    );

    if (hasTransactions) {
      alert("Nie można usunąć kategorii, ponieważ ma wpisy historyczne.");
      return;
    }

    // 🗑 usunięcie
    setCategories(prev =>
      prev.filter(cat => cat.id !== categoryId)
    );
  };
  // ===== DODAWANIE NOWEJ KATEGORII LEVEL 3 =====
  const addCategoryLevel3 = (parentId, name) => {
    if (!name || !name.trim()) return;

    const parentCategory = categories.find(
      (cat) => cat.id === parentId
    );

    const newCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      parentId,
      type: parentCategory?.type || "expense",
      activePeriods: [
        { start: monthKey, end: null }
      ],
    };

    setCategories((prev) => [...prev, newCategory]);
  };

  // ===== DODAWANIE NOWEJ KATEGORII LEVEL 2 =====
  // LEVEL 2 – EXPENSE
  const addCategoryLevel2 = (name) => {
    if (!name || !name.trim()) return;

    const newCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      parentId: "expense",
      type: "expense",
      activePeriods: [
        { start: monthKey, end: null }
      ],
    };

    setCategories((prev) => [...prev, newCategory]);
  };

  // LEVEL 2 – INCOME
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

  const closeCategory = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category?.activePeriods) return;

    const lastPeriod =
      category.activePeriods[category.activePeriods.length - 1];

    // 🔍 BLOKADA: przyszłe transakcje
    const hasFutureTransactions = transactions.some((t) => {
      return (
        t.categoryId === categoryId &&
        t.monthKey > monthKey
      );
    });

    if (hasFutureTransactions) {
      alert(
        "Nie można zamknąć kategorii, ponieważ posiada wpisy w przyszłych miesiącach."
      );
      return;
    }

    let shouldCloseNow = false;

    // 🔹 Jeśli jest zaplanowane zamknięcie w przyszłości
    if (lastPeriod?.end && lastPeriod.end > monthKey) {
      shouldCloseNow = window.confirm(
        `Ta kategoria ma już zaplanowane zamknięcie w ${lastPeriod.end}.
Czy chcesz zamknąć ją wcześniej (${monthKey})?`
      );

      if (!shouldCloseNow) return;
    } else {
      // 🔹 Normalne zamknięcie
      const confirmClose = window.confirm(
        `Kategoria będzie widoczna do końca bieżącego miesiąca (${monthKey}). Kontynuować?`
      );

      if (!confirmClose) return;
    }

    // 🔹 Aktualizacja activePeriods
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;

        const updatedPeriods = cat.activePeriods.map((period, index, arr) => {
          const isLast = index === arr.length - 1;

          if (isLast) {
            return {
              ...period,
              end: monthKey,
            };
          }

          return period;
        });

        return {
          ...cat,
          activePeriods: updatedPeriods,
        };
      })
    );
  };

  const reopenCategory = (categoryId) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;

        // 🆕 nowy model
        if (cat.activePeriods) {

          // sprawdź czy ostatni okres już jest otwarty
          const lastPeriod = cat.activePeriods[cat.activePeriods.length - 1];

          if (lastPeriod && !lastPeriod.end) {
            return cat; // już aktywna
          }

          return {
            ...cat,
            activePeriods: [
              ...cat.activePeriods,
              { start: monthKey, end: null }
            ]
          };
        }

        // 🔁 fallback dla starego modelu
        return {
          ...cat,
          startMonth: monthKey,
          endMonth: null,
        };
      })
    );
  };

  const renameCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    // 🔍 SPRAWDZENIE HISTORII
    const hasTransactions = transactions.some(
      t => t.categoryId === categoryId
    );

    if (hasTransactions) {
      const confirmRename = window.confirm(
        "Ta kategoria posiada wpisy historyczne. Zmiana nazwy wpłynie na wszystkie wcześniejsze miesiące. Kontynuować?"
      );

      if (!confirmRename) return;
    }

    const newName = window.prompt(
      "Podaj nową nazwę kategorii:",
      category.name
    );

    if (!newName || newName.trim() === "") return;

    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, name: newName.trim() }
          : cat
      )
    );
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
        t.monthKey === monthKey &&
        categories.find((c) => c.id === t.categoryId)?.type === "expense"
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const balance =
    getCategorySum("income", transactions, categories, monthKey) - totalExpense;

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

    const activeItemGlobal = categories.find(c => c.id === active.id);

    // TYLKO jeśli to Level 2 (ma parentId !== null)
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

      // tylko jeśli mają ten sam parent
      if (activeItem.parentId !== overItem.parentId) return prev;

      const siblings = prev.filter(c => c.parentId === activeItem.parentId);

      const oldIndex = siblings.findIndex(c => c.id === active.id);
      const newIndex = siblings.findIndex(c => c.id === over.id);

      const reorderedSiblings = [...siblings];
      const [moved] = reorderedSiblings.splice(oldIndex, 1);
      reorderedSiblings.splice(newIndex, 0, moved);

      // kluczowa część – zachowujemy globalną kolejność
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-2">
          <h2 className="text-xl font-semibold">Bilans miesiąca</h2>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-green-600">
              <Icon name="plusCircle" />
              <span>{incomeCategory?.name}</span>
            </div>
            <span className="text-green-600">
              {formatAmount(getCategorySum("income", transactions, categories, monthKey))} zł
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

        {selectedTransactions.length > 0 &&
          getSelectedLevel1Types().length === 1 && (
            <div style={{ padding: "10px", background: "#eef", marginBottom: "10px" }}>
              <span>Zaznaczone: {selectedTransactions.length}</span>

              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) return;

                  setTransactions((prev) =>
                    prev.map((t) =>
                      selectedTransactions.includes(t.id)
                        ? { ...t, categoryId: value }
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

                {selectedTransactions.length > 0 &&
                  (() => {
                    // sprawdź unikalne kategorie zaznaczonych wpisów
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

                    if (!firstSelected) return null;

                    let allowed;

                    if (selectedCategories.length === 1) {
                      // tylko jedna kategoria zaznaczona → blokujemy ją
                      allowed = getAllowedCategories(selectedCategories[0]);
                    } else {
                      // wiele kategorii → pokazujemy wszystkie zgodne typem
                      const first = transactions.find((t) =>
                        selectedTransactions.includes(t.id)
                      );

                      const currentCategory = categories.find(
                        (c) => c.id === first.categoryId
                      );

                      allowed = categories.filter(
                        (cat) =>
                          cat.type === currentCategory.type &&
                          isCategoryActiveInMonth(cat, monthKey)
                      );
                    }

                    const currentCategory = categories.find(
                      (c) => c.id === firstSelected.categoryId
                    );

                    // jeśli jesteśmy w Level3 → jego parent to Level2
                    const currentLevel2Id = currentCategory.parentId;

                    // najpierw te z tego samego Level2
                    const first = allowed.filter((cat) => {
                      return cat.parentId === currentLevel2Id;
                    });

                    // potem reszta
                    const second = allowed.filter((cat) => {
                      return cat.parentId !== currentLevel2Id;
                    });

                    const sorted = [...first, ...second];

                    // pogrupuj po Level2
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
                  })()}
              </select>

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

        {/* ===== SZYBKI DOSTĘP ===== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-3">

          <h3 className="text-sm font-semibold opacity-70">
            ⚡ Szybki dostęp
          </h3>

          {/* WYDATKI */}
          {getTopCategories("expense", transactions, categories, monthKey).length > 0 && (
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
          {getTopCategories("income", transactions, categories, monthKey).length > 0 && (
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
  monthKey={monthKey}

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
