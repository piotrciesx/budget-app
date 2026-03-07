export function getCategorySum(
  categoryId,
  transactions,
  categories,
  monthKey
) {
    // 1️⃣ suma własnych transakcji
    const ownSum = transactions
      .filter(
        (t) =>
          t.categoryId === categoryId &&
          t.monthKey === monthKey
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // 2️⃣ znajdź dzieci tej kategorii
    const children = categories.filter(
      (cat) => cat.parentId === categoryId
    );

    // 3️⃣ jeśli brak dzieci → zwróć ownSum
    if (children.length === 0) {
      return ownSum;
    }

    // 4️⃣ jeśli są dzieci → dodaj ich sumy
    const childrenSum = children.reduce(
      (sum, child) =>
        sum + getCategorySum(child.id, transactions, categories, monthKey),
      0
    );

    return ownSum + childrenSum;
  };

  export function formatAmount(value) {
  const rounded = Math.round(value * 100) / 100;

  if (Math.abs(rounded) < 0.005) return "0.00";

  return rounded.toFixed(2);
}

export function getSuggestions(
  categoryId,
  inputValue,
  transactions,
  suggestionBlacklist
) {

    if (!inputValue || inputValue.length < 2) return [];

    const lowerInput = inputValue.toLowerCase();

    const notes = transactions
      .filter(
        (t) =>
          t.categoryId === categoryId &&
          t.note &&
          t.note.trim() !== ""
      )
      .map((t) => t.note.trim());

    const frequency = {};

    notes.forEach((note) => {
      const key = note.toLowerCase();

      if (!frequency[key]) {
        frequency[key] = {
          original: note,
          count: 0
        };
      }

      frequency[key].count += 1;
    });

    const sorted = Object.values(frequency)
      .sort((a, b) => b.count - a.count)
      .map((item) => item.original);

    return sorted
      .filter((note) =>
        note.toLowerCase().startsWith(lowerInput)
      )
      .filter((note) =>
        !suggestionBlacklist[categoryId]?.includes(note)
      );
  };

  export function getTopCategories(
  type,
  transactions,
  categories,
  monthKey
) {

    // 1️⃣ tylko bieżący miesiąc + typ
    const filtered = transactions.filter((t) => {
      if (t.monthKey !== monthKey) return false;

      const cat = categories.find((c) => c.id === t.categoryId);
      return cat?.type === type;
    });

    // 2️⃣ liczenie użyć
    const counts = {};

    filtered.forEach((t) => {
      counts[t.categoryId] = (counts[t.categoryId] || 0) + 1;
    });

    // 3️⃣ zamiana na tablicę + sprawdzenie czy to najniższy poziom
    const result = Object.entries(counts)
      .map(([categoryId, count]) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return null;

        const hasChildren = categories.some(
          (c) => c.parentId === category.id
        );

        return {
          category,
          count,
          hasChildren,
        };
      })
      .filter(Boolean)
      .filter((item) => !item.hasChildren); // tylko najniższy poziom

    // 4️⃣ sortowanie malejąco
    result.sort((a, b) => b.count - a.count);

    // 5️⃣ max 3
    return result.slice(0, 3);
  };