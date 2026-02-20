"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [monthIndex, setMonthIndex] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

const [selectedDay, setSelectedDay] = useState(null);
const [incomes, setIncomes] = useState({});
const [incomeName, setIncomeName] = useState("");
const [incomeAmount, setIncomeAmount] = useState("");
const [fixedExpenses, setFixedExpenses] = useState({});
const [fixedName, setFixedName] = useState("");
const [fixedAmount, setFixedAmount] = useState("");
const [variableExpenses, setVariableExpenses] = useState({});
const [variableName, setVariableName] = useState("");
const [variableAmount, setVariableAmount] = useState("");
const [openFixedCategory, setOpenFixedCategory] = useState(null);
const [openIncome, setOpenIncome] = useState(false);
const [openVariableCategory, setOpenVariableCategory] = useState(null);
const today = new Date();
const isCurrentMonth =
  today.getMonth() === monthIndex &&
  today.getFullYear() === year;

const [variableDay, setVariableDay] = useState(
  isCurrentMonth ? today.getDate().toString() : "1"
);
const [variableCategory, setVariableCategory] = useState("podroze");
const [openDays, setOpenDays] = useState({});
const [dailyView, setDailyView] = useState("list");
const [quickAmount, setQuickAmount] = useState("");

useEffect(() => {
  const savedIncomes = localStorage.getItem("incomes");
  const savedFixed = localStorage.getItem("fixedExpenses");
  const savedVariable = localStorage.getItem("variableExpenses");

  if (savedIncomes) setIncomes(JSON.parse(savedIncomes));
  if (savedFixed) setFixedExpenses(JSON.parse(savedFixed));
  if (savedVariable) setVariableExpenses(JSON.parse(savedVariable));
}, []);

useEffect(() => {
  localStorage.setItem("incomes", JSON.stringify(incomes));
}, [incomes]);

useEffect(() => {
  localStorage.setItem("fixedExpenses", JSON.stringify(fixedExpenses));
}, [fixedExpenses]);

useEffect(() => {
  localStorage.setItem("variableExpenses", JSON.stringify(variableExpenses));
}, [variableExpenses]);

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
  const fixedCategories = {
  mieszkanie: "Mieszkanie i rachunki",
  raty: "Raty",
  subskrypcje: "Subskrypcje",
  pozostale: "Pozostałe",
};

const variableCategories = {
  podroze: "Podróże",
  jedzenie: "Jedzenie poza domem",
  okolicznosciowe: "Okolicznościowe",
  pierdoly: "Pierdoły",
  codzienne: "Codzienne",
};


const monthKey = `${year}-${monthIndex}`;

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
const addIncome = () => {
  if (!incomeName || !incomeAmount) return;

  const newIncome = {
    id: Date.now(),
    name: incomeName,
    amount: parseFloat(incomeAmount.replace(",", ".")),
  };

  setIncomes((prev) => {
    const monthData = prev[monthKey] || [];
    return {
      ...prev,
      [monthKey]: [...monthData, newIncome],
    };
  });

  setIncomeName("");
  setIncomeAmount("");
};

const deleteIncome = (id) => {
  setIncomes((prev) => {
    const monthData = prev[monthKey] || [];
    return {
      ...prev,
      [monthKey]: monthData.filter((item) => item.id !== id),
    };
  });
};

const addFixedExpense = (categoryKey) => {
  if (!fixedName || !fixedAmount) return;

  const newExpense = {
    id: Date.now(),
    name: fixedName,
    amount: parseFloat(fixedAmount.replace(",", ".")),
  };

  setFixedExpenses((prev) => {
    const monthData = prev[monthKey] || {};
    const categoryData = monthData[categoryKey] || [];

    return {
      ...prev,
      [monthKey]: {
        ...monthData,
        [categoryKey]: [...categoryData, newExpense],
      },
    };
  });

  setFixedName("");
  setFixedAmount("");
};

const deleteFixedExpense = (category, id) => {
  setFixedExpenses((prev) => {
    const monthData = prev[monthKey] || {};
    const categoryData = monthData[category] || [];

    return {
      ...prev,
      [monthKey]: {
        ...monthData,
        [category]: categoryData.filter((item) => item.id !== id),
      },
    };
  });
};

const addVariableExpense = (categoryKey) => {
  if (categoryKey === "codzienne") {
    if (!variableDay || !variableAmount) return;
  } else {
    if (!variableName || !variableAmount) return;
  }

  const newExpense =
    categoryKey === "codzienne"
      ? {
          id: Date.now(),
          day: parseInt(categoryKey === "codzienne" && selectedDay ? selectedDay : variableDay),
  amount: parseFloat(
  (categoryKey === "codzienne" && selectedDay ? quickAmount : variableAmount)
    .replace(",", ".")
),
        }
      : {
          id: Date.now(),
          name: variableName,
          amount: parseFloat(variableAmount.replace(",", ".")),
        };

  setVariableExpenses((prev) => {
    const monthData = prev[monthKey] || {};
    const categoryData = monthData[categoryKey] || [];

    return {
      ...prev,
      [monthKey]: {
        ...monthData,
        [categoryKey]: [...categoryData, newExpense],
      },
    };
  });

  setVariableName("");
  setVariableAmount("");
};

  const clearMonth = () => {
  setIncomes((prev) => {
    const updated = { ...prev };
    delete updated[monthKey];
    return updated;
  });

  setFixedExpenses((prev) => {
    const updated = { ...prev };
    delete updated[monthKey];
    return updated;
  });

  setVariableExpenses((prev) => {
    const updated = { ...prev };
    delete updated[monthKey];
    return updated;
  });

  setSelectedDay(null);
};

const deleteVariableExpense = (category, id) => {

  setVariableExpenses((prev) => {
    const monthData = prev[monthKey] || {};
    const categoryData = monthData[category] || [];

    return {
      ...prev,
      [monthKey]: {
        ...monthData,
        [category]: categoryData.filter((item) => item.id !== id),
      },
    };
  });
};
const addQuickDailyExpense = () => {
  if (!selectedDay || !quickAmount) return;

  const newExpense = {
    id: Date.now(),
    day: parseInt(selectedDay),
    amount: parseFloat(quickAmount.replace(",", ".")),
  };

  setVariableExpenses((prev) => {
    const monthData = prev[monthKey] || {};
    const categoryData = monthData["codzienne"] || [];

    return {
      ...prev,
      [monthKey]: {
        ...monthData,
        codzienne: [...categoryData, newExpense],
      },
    };
  });

  setQuickAmount("");
};


const currentIncomes = incomes[monthKey] || [];
const totalIncome = currentIncomes.reduce(
  (sum, item) => sum + item.amount,
  0
);
const currentFixed = fixedExpenses[monthKey] || {};

const totalFixed = Object.values(currentFixed)
  .flat()
  .reduce((sum, item) => sum + item.amount, 0);

const currentVariable = variableExpenses[monthKey] || {};

const totalVariable = Object.values(currentVariable)
  .flat()
  .reduce((sum, item) => sum + (item.amount || 0), 0);

const totalExpenses = totalFixed + totalVariable;
const balance = totalIncome - totalExpenses;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

  <div className="bg-white rounded-xl shadow p-4">
  <div className="grid grid-cols-[80px_1fr_120px] items-center">

    {/* LEWA STRZAŁKA */}
    <div className="flex justify-start">
<button
  onClick={previousMonth}
  className="group w-11 h-11 flex items-center justify-center rounded-full
             bg-gradient-to-br from-gray-100 to-gray-200
             shadow-md hover:shadow-lg
             active:scale-95
             transition-all duration-200"
>
  <svg
    className="w-5 h-5 text-gray-700 group-hover:-translate-x-1 transition-transform duration-200"
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
             shadow-md hover:shadow-lg
             active:scale-95
             transition-all duration-200"
>
  <svg
    className="w-5 h-5 text-gray-700 group-hover:translate-x-1 transition-transform duration-200"
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
                   bg-red-100 hover:bg-red-200 shadow 
                   transition active:scale-95"
        title="Wyczyść miesiąc"
      >
        🗑
      </button>
    </div>

  </div>
</div>
        <div className="bg-white rounded-xl shadow p-6 space-y-2">
  <h2 className="text-xl font-semibold">Bilans miesiąca</h2>

  <div className="flex justify-between">
    <span>Przychody:</span>
    <span className="text-green-600">
      {totalIncome.toFixed(2)} zł
    </span>
  </div>

  <div className="flex justify-between">
    <span>Wydatki:</span>
    <span className="text-red-600">
      {totalExpenses.toFixed(2)} zł
    </span>
  </div>

  <div className="flex justify-between border-t pt-2 font-bold">
    <span>Bilans:</span>
    <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
      {balance.toFixed(2)} zł
    </span>
  </div>
</div>

<div className="bg-white rounded-xl shadow overflow-hidden">
  <button
    type="button"
    onClick={() => setOpenIncome(!openIncome)}
    className="w-full text-left px-6 py-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
  >
    <span className="text-xl font-semibold">
      Przychody
    </span>
    <span className="text-green-600 font-semibold">
      {totalIncome.toFixed(2)} zł
    </span>
  </button>

  {openIncome && (
    <div className="p-6 space-y-4 bg-white">

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addIncome();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder="Opis"
          value={incomeName}
          onChange={(e) => setIncomeName(e.target.value)}
          className="border rounded px-2 py-1 w-full"
        />

        <input
          type="number"
          step="0.01"
          placeholder="Kwota"
          value={incomeAmount}
          onChange={(e) => setIncomeAmount(e.target.value)}
          className="border rounded px-2 py-1 w-32"
        />

        <button
          type="submit"
          className="bg-green-500 text-white px-4 rounded"
        >
          +
        </button>
      </form>

      <div className="space-y-2">
        {currentIncomes.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center border-b pb-1"
          >
            <span>{item.name}</span>
            <div className="flex items-center gap-2">
              <span>{item.amount.toFixed(2)} zł</span>
              <button
                onClick={() => deleteIncome(item.id)}
                className="text-red-500"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )}
</div>

 <div className="bg-white rounded-xl shadow p-6 space-y-4">
  <h2 className="text-xl font-semibold">
    Wydatki stałe — {totalFixed.toFixed(2)} zł
  </h2>
<div className="space-y-3">
  {Object.entries(fixedCategories).map(([key, label]) => {
    const items = currentFixed[key] || [];
    const categoryTotal = items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const isOpen = openFixedCategory === key;

    return (
      <div key={key} className="border rounded-lg overflow-hidden">
        {/* PRZYCISK */}
        <button
          type="button"
          onClick={() =>
            setOpenFixedCategory(isOpen ? null : key)
          }
          className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
        >
          <span className="font-semibold">
            {label}
          </span>
          <span>
            {categoryTotal.toFixed(2)} zł
          </span>
        </button>

        {/* ROZWINIĘCIE */}
        {isOpen && (
          <div className="p-4 space-y-3 bg-white">

            {/* FORMULARZ */}
            <form
              onSubmit={(e) => {
  e.preventDefault();
  addFixedExpense(key);
}}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Opis"
                value={fixedName}
                onChange={(e) => setFixedName(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />

              <input
                type="number"
                step="0.01"
                placeholder="Kwota"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
                className="border rounded px-2 py-1 w-32"
              />

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 rounded"
              >
                +
              </button>
            </form>

            {/* LISTA WYDATKÓW */}
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-1"
                >
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span>{item.amount.toFixed(2)} zł</span>
                    <button
                      onClick={() =>
                        deleteFixedExpense(key, item.id)
                      }
                      className="text-red-500"
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    );
  })}
</div>
</div>

<div className="bg-white rounded-xl shadow p-6 space-y-4">
  <h2 className="text-xl font-semibold">
    Wydatki zmienne — {totalVariable.toFixed(2)} zł
  </h2>

  <div className="space-y-3">
    {Object.entries(variableCategories).map(([key, label]) => {
      const items = currentVariable[key] || [];
      const categoryTotal = items.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      const isOpen = openVariableCategory === key;

      return (
        <div key={key} className="border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() =>
              setOpenVariableCategory(isOpen ? null : key)
            }
            className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
          >
            <span className="font-semibold">
              {label}
            </span>
            <span>
              {categoryTotal.toFixed(2)} zł
            </span>
          </button>

          {isOpen && (
            <div className="p-4 space-y-3 bg-white">

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addVariableExpense(key);
                }}
                className="flex gap-2"
              >
                {key !== "codzienne" && (
                  <input
                    type="text"
                    placeholder="Opis"
                    value={variableName}
                    onChange={(e) => setVariableName(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                )}

                {key === "codzienne" && (
                  <input
                    type="number"
                    placeholder="Dzień"
                    value={variableDay}
                    onChange={(e) => setVariableDay(e.target.value)}
                    className="border rounded px-2 py-1 w-24"
                  />
                )}

                <input
                  type="number"
                  step="0.01"
                  placeholder="Kwota"
                  value={variableAmount}
                  onChange={(e) => setVariableAmount(e.target.value)}
                  className="border rounded px-2 py-1 w-32"
                />

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 rounded"
                >
                  +
                </button>
              </form>
{key === "codzienne" && (
  <div className="flex gap-2 mb-3">
    <button
      type="button"
      onClick={() => setDailyView("list")}
      className={`px-3 py-1 rounded ${
        dailyView === "list"
          ? "bg-blue-500 text-white"
          : "bg-gray-200"
      }`}
    >
      Lista
    </button>

    <button
      type="button"
      onClick={() => setDailyView("calendar")}
      className={`px-3 py-1 rounded ${
        dailyView === "calendar"
          ? "bg-blue-500 text-white"
          : "bg-gray-200"
      }`}
    >
      Kalendarz
    </button>
  </div>
)}
<div className="space-y-2">
  {key === "codzienne" ? (
  dailyView === "list" ? (
    Object.entries(
      items.reduce((acc, item) => {
        if (!acc[item.day]) acc[item.day] = [];
        acc[item.day].push(item);
        return acc;
      }, {})
    )
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([day, dayItems]) => {
        const dayTotal = dayItems.reduce(
          (sum, item) => sum + item.amount,
          0
        );

        return (
          <div key={day} className="border rounded p-2 bg-gray-50">
            <div
              className="font-semibold cursor-pointer flex justify-between"
              onClick={() =>
                setOpenDays((prev) => ({
                  ...prev,
                  [day]: !prev[day],
                }))
              }
            >
              <span>
                📅 Dzień {day} — {dayTotal.toFixed(2)} zł
              </span>
            </div>

            {openDays[day] && (
              <div className="ml-4 mt-1 space-y-1">
                {dayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between border-b pb-1"
                  >
                    <span>{item.amount.toFixed(2)} zł</span>
                    <button
                      onClick={() =>
                        deleteVariableExpense(key, item.id)
                      }
                      className="text-red-500"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })
        ) : (
<div>
  {(() => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDay = new Date(year, monthIndex, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const dailyTotals = items.reduce((acc, item) => {
      acc[item.day] = (acc[item.day] || 0) + item.amount;
      return acc;
    }, {});

    const cells = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={"empty-" + i}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(
<div
  key={day}
 onClick={() =>
  setSelectedDay((prev) => (prev === day ? null : day))
}
  className={`cursor-pointer border rounded p-2 min-h-[90px] flex flex-col justify-between ${
  selectedDay === day ? "ring-2 ring-blue-500" : ""
} ${(() => {
  const value = dailyTotals[day] || 0;
  const todayDate = new Date();
  const cellDate = new Date(year, monthIndex, day);

const isFuture = cellDate > todayDate;

const monthHasAnyData =
  totalIncome !== 0 ||
  totalFixed !== 0 ||
  totalVariable !== 0;

  if (!monthHasAnyData) return "bg-white";
  if (isFuture) return "bg-white";

  if (value === 0) return "bg-green-400 text-white";
  if (value > 0 && value <= 10) return "bg-green-300";
  if (value > 10 && value <= 20) return "bg-green-200";
  if (value > 20 && value <= 30) return "bg-yellow-200";
  if (value > 30 && value <= 50) return "bg-yellow-300";
  if (value > 50 && value <= 70) return "bg-orange-300";
  if (value > 70 && value <= 90) return "bg-red-400 text-white";
  if (value > 90) return "bg-red-600 text-white";

  return "bg-white";
  
})()}`}
>
  <div className="text-sm font-semibold">{day}</div>

<div className="text-sm font-bold">
  {(() => {
    const todayDate = new Date();
    const cellDate = new Date(year, monthIndex, day);
    const isFuture = cellDate > todayDate;

    const monthHasAnyData =
      totalIncome !== 0 ||
      totalFixed !== 0 ||
      totalVariable !== 0;

    if (!monthHasAnyData || isFuture) return "";

    return (dailyTotals[day] || 0).toFixed(2) + " zł";
  })()}
</div>
</div>
      );
    }

    return (
      <div>
        <div className="grid grid-cols-7 text-center font-semibold mb-2">
          <div>Pon</div>
          <div>Wt</div>
          <div>Śr</div>
          <div>Czw</div>
          <div>Pt</div>
          <div>Sob</div>
          <div>Nd</div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells}
        </div>
{selectedDay && (
  <div className="mt-4 p-4 bg-white rounded shadow">
    <h3 className="font-semibold mb-2">
      📅 {selectedDay} {months[monthIndex]} {year}
    </h3>
<form
  onSubmit={(e) => {
    e.preventDefault();
    addQuickDailyExpense();
  }}
  className="flex gap-2 mb-3"
>
  <input
    type="number"
    step="0.01"
    placeholder="Kwota"
    value={quickAmount}
    onChange={(e) => setQuickAmount(e.target.value)}
    className="border rounded px-2 py-1 w-32"
  />

  <button
    type="submit"
    className="bg-blue-500 text-white px-4 rounded"
  >
    +
  </button>
</form>
    {(items.filter(i => i.day === selectedDay)).length === 0 ? (
      <div className="text-green-600">
        0.00 zł — brak wydatków
      </div>
    ) : (
      items
        .filter(i => i.day === selectedDay)
        .map((item) => (
          <div
            key={item.id}
            className="flex justify-between border-b py-1"
          >
            <span>{item.amount.toFixed(2)} zł</span>
            <button
              onClick={() =>
                deleteVariableExpense("codzienne", item.id)
              }
              className="text-red-500"
            >
              x
            </button>
          </div>
        ))
    )}
  </div>
)}
      </div>
    );
  })()}
</div>
  )
  ) : (
    items.map((item) => (
      <div
        key={item.id}
        className="flex justify-between border-b pb-1"
      >
        <span>{item.name}</span>
        <div className="flex items-center gap-2">
          <span>{item.amount.toFixed(2)} zł</span>
          <button
            onClick={() =>
              deleteVariableExpense(key, item.id)
            }
            className="text-red-500"
          >
            x
          </button>
        </div>
      </div>
    ))
  )}
</div>

            </div>
          )}
        </div>
      );
    })}
  </div>
</div>
<div className="bg-white rounded-xl shadow p-4">
  <div className="grid grid-cols-[80px_1fr_120px] items-center">

    {/* LEWA STRZAŁKA */}
    <div className="flex justify-start">
      <button
  onClick={previousMonth}
  className="group w-11 h-11 flex items-center justify-center rounded-full
             bg-gradient-to-br from-gray-100 to-gray-200
             shadow-md hover:shadow-lg
             active:scale-95
             transition-all duration-200"
>
  <svg
    className="w-5 h-5 text-gray-700 group-hover:-translate-x-1 transition-transform duration-200"
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
             shadow-md hover:shadow-lg
             active:scale-95
             transition-all duration-200"
>
  <svg
    className="w-5 h-5 text-gray-700 group-hover:translate-x-1 transition-transform duration-200"
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
        className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 shadow transition"
      >
        🗑
      </button>
    </div>

  </div>
</div>
</div>
    </main>
  );
}

