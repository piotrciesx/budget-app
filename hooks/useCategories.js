import { useState, useMemo, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useCategories() {
  const [categories, setCategories] = useState([]);

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });

      if (error) {
        alert("Nie udało się pobrać kategorii.");
        return;
      }

      const mapped = (data || []).map((c) => {
        let activePeriods = [];

        if (Array.isArray(c.active_periods)) {
          activePeriods = c.active_periods;
        } else if (Array.isArray(c.activePeriods)) {
          activePeriods = c.activePeriods;
        }

        if (activePeriods.length === 0) {
          activePeriods = [{ start: "2000-01", end: null }];
        }

        return {
          ...c,
          parentId: c.parent_id ?? c.parentId ?? null,
          activePeriods,
        };
      });

      setCategories(mapped);
    };

    loadCategories();
  }, []);

  const categoriesById = useMemo(() => {
    return Object.fromEntries(categories.map((c) => [c.id, c]));
  }, [categories]);

  const getChildren = (parentId) =>
    categories.filter((cat) => cat.parentId === parentId);

  const getLowestCategories = () => {
    return categories.filter((cat) => {
      const hasChildren = categories.some((c) => c.parentId === cat.id);
      return !hasChildren;
    });
  };

  const getCategoryLevel = (categoryId) => {
    let level = 0;
    let current = categories.find((c) => c.id === categoryId);

    while (current) {
      level++;
      current = categories.find((c) => c.id === current.parentId);
    }

    return level;
  };

  const getAllowedCategories = (currentCategoryId) => {
    const currentCategory = categories.find((c) => c.id === currentCategoryId);
    if (!currentCategory) return [];

    return categories.filter((cat) => {
      if (cat.id === currentCategoryId) return false;
      if (cat.type !== currentCategory.type) return false;
      if (cat.id === "income" || cat.id === "expense") return false;

      const hasChildren = categories.some((c) => c.parentId === cat.id);
      return !hasChildren;
    });
  };

  const renameCategory = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const { count, error: historyError } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (historyError) {
      alert("Nie udało się sprawdzić historii kategorii.");
      return;
    }

    if ((count || 0) > 0) {
      const confirmRename = window.confirm(
        "Ta kategoria posiada wpisy historyczne. Zmiana nazwy wpłynie na wszystkie wcześniejsze miesiące. Kontynuować?"
      );

      if (!confirmRename) return;
    }

    const newName = window.prompt("Podaj nową nazwę kategorii:", category.name);

    if (!newName || !newName.trim()) return;
    if (newName.trim() === category.name?.trim()) return;

    const { error } = await supabase
      .from("categories")
      .update({ name: newName.trim() })
      .eq("id", categoryId);

    if (error) {
      alert("Nie udało się zmienić nazwy kategorii.");
      return;
    }

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, name: newName.trim() } : cat
      )
    );
  };

  const deleteCategory = async (categoryId) => {
    if (categoryId === "income" || categoryId === "expense") {
      alert("Nie można usunąć głównej kategorii systemowej.");
      return;
    }

    const hasChildren = categories.some((cat) => cat.parentId === categoryId);

    if (hasChildren) {
      alert("Nie można usunąć kategorii, ponieważ zawiera podkategorie.");
      return;
    }

    const { count, error: historyError } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", categoryId);

    if (historyError) {
      alert("Nie udało się sprawdzić historii kategorii.");
      return;
    }

    if ((count || 0) > 0) {
      alert("Nie można usunąć kategorii, ponieważ ma wpisy historyczne.");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) {
      alert("Nie udało się usunąć kategorii.");
      return;
    }

    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
  };

  const closeCategory = async (categoryId, targetMonthKey) => {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return;

  const currentMonthKey = targetMonthKey || getCurrentMonthKey();

  const [year, month] = currentMonthKey.split("-");
  const monthIndex = parseInt(month, 10) - 1;

  let nextMonthIndex = monthIndex + 1;
  let nextYear = parseInt(year);

  if (nextMonthIndex > 11) {
    nextMonthIndex = 0;
    nextYear += 1;
  }

  const nextMonthKey = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, "0")}`;

  const periods =
    Array.isArray(category.activePeriods) && category.activePeriods.length > 0
      ? [...category.activePeriods]
      : [{ start: "2000-01", end: null }];

  const lastIndex = periods.length - 1;
  const lastPeriod = periods[lastIndex];

  const confirmed = window.confirm(
    `Kategoria będzie widoczna do końca miesiąca ${currentMonthKey}. Ukryć od ${nextMonthKey}?`
  );

  if (!confirmed) return;

  periods[lastIndex] = {
    ...lastPeriod,
    end: nextMonthKey,
  };

  const { error } = await supabase
    .from("categories")
    .update({ active_periods: periods })
    .eq("id", categoryId);

  if (error) {
    alert("Nie udało się ukryć kategorii.");
    return;
  }

  setCategories((prev) =>
    prev.map((cat) =>
      cat.id === categoryId ? { ...cat, activePeriods: periods } : cat
    )
  );
};

  const reopenCategory = async (categoryId, targetMonthKey) => {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return;

  const effectiveMonthKey = targetMonthKey || getCurrentMonthKey();

  const periods =
    Array.isArray(category.activePeriods) && category.activePeriods.length > 0
      ? [...category.activePeriods]
      : [];

  if (periods.length === 0) {
    const updatedPeriods = [{ start: effectiveMonthKey, end: null }];

    const { error } = await supabase
      .from("categories")
      .update({ active_periods: updatedPeriods })
      .eq("id", categoryId);

    if (error) {
      alert("Nie udało się przywrócić kategorii.");
      return;
    }

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, activePeriods: updatedPeriods }
          : cat
      )
    );
    return;
  }

  const lastIndex = periods.length - 1;
  const lastPeriod = periods[lastIndex];

  if (!lastPeriod.end) return;

  if (lastPeriod.end >= effectiveMonthKey) {
    periods[lastIndex] = {
      ...lastPeriod,
      end: null,
    };
  } else {
    periods.push({
      start: effectiveMonthKey,
      end: null,
    });
  }

  const { error } = await supabase
    .from("categories")
    .update({ active_periods: periods })
    .eq("id", categoryId);

  if (error) {
    alert("Nie udało się przywrócić kategorii.");
    return;
  }

  setCategories((prev) =>
    prev.map((cat) =>
      cat.id === categoryId ? { ...cat, activePeriods: periods } : cat
    )
  );
};

  const addCategoryLevel2 = async (name, parentId) => {
    const parentCategory = categories.find((c) => c.id === parentId);
    if (!name || !name.trim()) return;

    const currentMonthKey = getCurrentMonthKey();

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: name.trim(),
          parent_id: parentId,
          level: 2,
          type: parentCategory?.type ?? null,
          active_periods: [{ start: currentMonthKey, end: null }],
        },
      ])
      .select()
      .single();

    if (error || !data) {
      alert("Nie udało się dodać kategorii.");
      return;
    }

    setCategories((prev) => [
      ...prev,
      {
        ...data,
        parentId: data.parent_id,
        activePeriods: Array.isArray(data.active_periods)
          ? data.active_periods
          : [{ start: currentMonthKey, end: null }],
      },
    ]);
  };

  const addCategoryLevel3 = async (parentId, name) => {
    const parentCategory = categories.find((c) => c.id === parentId);
    if (!name || !name.trim()) return;

    const currentMonthKey = getCurrentMonthKey();

    const { data, error } = await supabase
      .from("categories")
      .insert([
        {
          name: name.trim(),
          parent_id: parentId,
          level: 3,
          type: parentCategory?.type ?? null,
          active_periods: [{ start: currentMonthKey, end: null }],
        },
      ])
      .select()
      .single();

    if (error || !data) {
      alert("Nie udało się dodać podkategorii.");
      return;
    }

    setCategories((prev) => [
      ...prev,
      {
        ...data,
        parentId: data.parent_id,
        activePeriods: Array.isArray(data.active_periods)
          ? data.active_periods
          : [{ start: currentMonthKey, end: null }],
      },
    ]);
  };

  return {
    categories: categories.filter((cat) => {
  const periods = cat.activePeriods;

  if (!periods || periods.length === 0) return true;

  const now = new Date();
  const currentKey =
    now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

  return periods.some((p) => {
    if (currentKey < p.start) return false;
    if (p.end && currentKey >= p.end) return false;
    return true;
  });
}),
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
  };
}