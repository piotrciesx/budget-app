import { useState, useMemo, useEffect } from "react";

import { supabase } from "../lib/supabaseClient";

export default function useCategories() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
  const loadCategories = async () => {
    const { data, error } = await supabase
  .from("categories")
  .select("*")
  .order("order", { ascending: true });

  console.log("CATEGORIES FROM DB:", data, error);

    if (data && data.length > 0) {
  const mapped = data.map(c => ({
    ...c,
    parentId: c.parent_id
  }));

  setCategories(mapped);
}
  };

  loadCategories();
}, []);

    const categoriesById = useMemo(() => {
        return Object.fromEntries(
            categories.map(c => [c.id, c])
        );
    }, [categories]);

    const getChildren = (parentId) =>
    categories.filter((cat) => cat.parentId === parentId);

    const getLowestCategories = () => {
        return categories.filter((cat) => {
            const hasChildren = categories.some(
                (c) => c.parentId === cat.id
            );
            return !hasChildren;
        });
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

    const closeCategory = (categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category?.activePeriods) return;

        const lastPeriod =
            category.activePeriods[category.activePeriods.length - 1];

        // 🔍 BLOKADA: przyszłe transakcje
        const hasFutureTransactions = transactions.some((t) => {
            return (
                t.categoryId === categoryId &&
                t.date > monthKey
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

    const addCategoryLevel2 = async (name, parentId) => {
    console.log("ADD LEVEL2 TRIGGERED", name, parentId)
    if (!name || !name.trim()) return;

    const { data, error } = await supabase
        .from("categories")
        .insert([
            {
                name: name.trim(),
                parent_id: parentId,
                level: 2
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("ERROR ADDING LEVEL2:", error);
        return;
    }

    console.log("LEVEL2 CREATED:", data);

    setCategories((prev) => [
    ...prev,
    {
        ...data,
        parentId: data.parent_id
    }
]);
};

const addCategoryLevel3 = (parentId, name) => {
    if (!name || !name.trim()) return;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const parentCategory = categories.find(
        (cat) => cat.id === parentId
    );

    const newCategory = {
        id: Date.now().toString(),
        name: name.trim(),
        parentId,
        parent_id: parentId,
        type: parentCategory?.type || "expense",
        activePeriods: [{ start: currentMonthKey, end: null }],
    };

    setCategories((prev) => [...prev, newCategory]);
};

return {
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
};
}
