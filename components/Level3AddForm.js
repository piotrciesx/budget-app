"use client";
import { useState, useRef } from "react";

export default function Level3AddForm({
  categoryId,
  settings,
  onAdd,
  maxDay,
  getSuggestions,
  suggestionBlacklist,
  setSuggestionBlacklist
}) {
  const [day, setDay] = useState("");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);
const [justAutofilled, setJustAutofilled] = useState(false);
  
  const dayRef = useRef(null);
const noteRef = useRef(null);
const amountRef = useRef(null);

  const handleSubmit = () => {

  if (settings.useDay && day) {
    const dayNumber = Number(day);

    if (!dayNumber || dayNumber < 1 || dayNumber > maxDay) {
      alert(`Niepoprawny dzień. Maksymalnie ${maxDay}.`);
      return;
    }
  }

  const success = onAdd(categoryId, amount, note, day);

  if (success) {
  setDay("");
  setNote("");
  setAmount("");

  if (settings.useDay) {
    dayRef.current?.focus();
  } else if (settings.useDescription) {
    noteRef.current?.focus();
  } else {
    amountRef.current?.focus();
  }
}
};

  return (
    <div className="flex gap-2 items-center">
      {settings.useDay && (
        <input
        onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    if (settings.useDescription) {
      noteRef.current?.focus();
    } else {
      amountRef.current?.focus();
    }
  }
}}
  type="number"
  min="1"
  max={maxDay}
  placeholder="Dzień"
  value={day}
  onChange={(e) => setDay(e.target.value)}
  className="w-20 px-2 py-1 border rounded text-center"
  ref={dayRef}
/>
      )}

      {settings.useDescription && (
<div className="relative flex-1">
                    <input
                        ref={noteRef}
                        type="text"
                        value={note}
                        onChange={(e) => {
                            setNote(e.target.value)
                            setShowSuggestions(true);
                        }}
                        onFocus={(e) => {
  e.target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}}
                        onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const suggestions =
      getSuggestions?.(categoryId, note) || [];

    // jeśli są sugestie i aktualna wartość
    // nie jest jeszcze pierwszą sugestią
    if (
      suggestions.length > 0 &&
      note !== suggestions[0]
    ) {
      setNote(suggestions[0]);
      setShowSuggestions(false);
      return;
    }

    // jeśli już jest sugestia → przejdź do kwoty
    amountRef.current?.focus();
  }
}}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="Opis"
                        className="w-full px-2 py-1 border rounded"
                    />

                    {showSuggestions &&
                        getSuggestions &&
                        getSuggestions(categoryId, note).length > 0 && (
                            <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded shadow text-xs z-50">
                                {getSuggestions(categoryId, note).map((s, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setNote(s);
                                            setShowSuggestions(false);
                                            setJustAutofilled(true);
                                        }}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            if (!window.confirm(`Usunąć sugestię "${s}"?`)) return;

                                            setSuggestionBlacklist((prev) => {
                                                const current = prev[categoryId] || [];
                                                if (current.includes(s)) return prev;

                                                return {
                                                    ...prev,
                                                    [categoryId]: [...current, s],
                                                };
                                            });
                                        }}
                                        className="px-2 py-1 hover:bg-red-100 cursor-pointer"
                                    >
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                </div>
                )}
      <input
      onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSubmit();
  }
}}
  type="number"
step="0.01"
  placeholder="Kwota"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  className="w-24 px-2 py-1 border rounded text-right"
  ref={amountRef}
/>

      <button
        onClick={handleSubmit}
        className="px-3 py-1 bg-gray-600 text-white rounded"
      >
        +
      </button>
    </div>
  );
}