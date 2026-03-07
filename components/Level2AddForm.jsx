"use client";
import React, { useState } from "react";

export default function Level2AddForm({
    categoryId,
    settings,
    handleAdd,
    getSuggestions,
    suggestionBlacklist,
    setSuggestionBlacklist,
    maxDay
}) {
    const [localDay, setLocalDay] = useState("");
    const [localNote, setLocalNote] = useState("");
    const [localAmount, setLocalAmount] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [justAutofilled, setJustAutofilled] = useState(false);
    const amountRef = React.useRef(null);
    const noteRef = React.useRef(null);

    const onSubmit = () => {

  if (settings.useDay && localDay) {
    const dayNumber = Number(localDay);

    if (!dayNumber || dayNumber < 1 || dayNumber > maxDay) {
      alert(`Niepoprawny dzień. Maksymalnie ${maxDay}.`);
      return;
    }
  }

  const success = handleAdd(categoryId, localAmount, localNote, localDay);

  if (success) {
    setLocalDay("");
    setLocalNote("");
    setLocalAmount("");
  }
};

    return (
        <div className="flex gap-2 items-start">

            {settings.useDay && (
                <input
                    type="number"
                    min="1"
                    max={maxDay}
                    value={localDay}
                    onChange={(e) => setLocalDay(e.target.value)}
                    onFocus={(e) => {
  e.target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}}
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
                    placeholder="Dzień"
                    className="w-20 px-2 py-1 border rounded text-center"
                />
            )}

            {settings.useDescription && (
                <div className="relative flex-1">
                    <input
                        ref={noteRef}
                        type="text"
                        value={localNote}
                        onChange={(e) => {
                            setLocalNote(e.target.value);
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
      getSuggestions?.(categoryId, localNote) || [];

    // jeśli są sugestie i aktualna wartość
    // nie jest jeszcze pierwszą sugestią
    if (
      suggestions.length > 0 &&
      localNote !== suggestions[0]
    ) {
      setLocalNote(suggestions[0]);
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
                        getSuggestions(categoryId, localNote).length > 0 && (
                            <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded shadow text-xs z-50">
                                {getSuggestions(categoryId, localNote).map((s, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            setLocalNote(s);
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
                ref={amountRef}
                type="number"
step="0.01"
                value={localAmount}
                onChange={(e) => setLocalAmount(e.target.value)}
                onFocus={(e) => {
  e.target.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}}
                onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    onSubmit();
  }
}}
                placeholder="Kwota"
                className="w-24 px-2 py-1 border rounded text-right"
            />

            <button
                onClick={onSubmit}
                className="px-2 py-1 text-white rounded bg-gray-500"
            >
                +
            </button>
        </div>
    );
}