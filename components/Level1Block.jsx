import SortableItem from "./SortableItem";

import Level2AddForm from "./Level2AddForm";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import Level1Header from "./Level1Header";

import Level1Transactions from "./Level1Transactions";

import Level2Header from "./Level2Header";

import Level2Section from "./Level2Section";

import Level2Controls from "./Level2Controls";

import Level3Block from "./Level3Block";

import Level3AddForm from "./Level3AddForm";

import TransactionRow from "./TransactionRow";

export default function Level1Block({

    level1,
    handleAddTransaction,
    openLevel1,
    setOpenLevel1,
    getChildren,

    formatAmount,
    getCategorySum,

    transactions,
    categories,
    monthKey,

    activeId,

    getCategorySetting,
    setCategorySettings,

    AddCategoryForm,

    sortModeLevel2,
    setSortModeLevel2,
    sortModeLevel3,
    setSortModeLevel3,

    openLevel2,
    setOpenLevel2,
    openLevel3,
    setOpenLevel3,

    closeCategory,
    reopenCategory,
    deleteCategory,
    renameCategory,

    addCategoryLevel2,
    addCategoryLevel2Income,
    addCategoryLevel3,

    addExpense,
    moveTransaction,
    createLevel3Category,

    getSuggestionsSelector,
    getAllowedCategories,
    isCategoryActiveInMonth,
    sortCategories,

    selectedTransactions,
    toggleTransactionSelection,
    editingTransactionId,
    setEditingTransactionId,
    movingTransactionId,
    setMovingTransactionId,
    setTransactions,

    suggestionBlacklist,
    setSuggestionBlacklist,

    showArchived,
    setShowArchived,

    resetLevel2Order,

    getMaxDaysInMonth,
    monthIndex,
    year,
    moveRef

}) {

    const isIncome = level1.type === "income";

    const isOpenLevel1 = openLevel1 === level1.id;
    const childrenLevel2 = getChildren(level1.id);
    const hasLevel2 = childrenLevel2.length > 0;

    const disableDragLevel1 = openLevel1 || openLevel2 || openLevel3;
    const disableDragLevel2 = openLevel2 || openLevel3;
    const disableDragLevel3 = openLevel3;

    return (
        <>
            <SortableItem id={level1.id}>
                {({ attributes, listeners }) => (
                    <div
                        id={`category-${level1.id}`}
                        className="border rounded overflow-hidden"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                if (activeId) return;

                                const newValue = isOpenLevel1 ? null : level1.id;
                                setOpenLevel1(newValue);
                            }}
                            className={`w-full text-left px-6 py-4 flex justify-between items-center font-semibold
  ${isIncome
                                    ? "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200"
                                    : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
                                }`}
                        >
                            <Level1Header
                                level1={level1}
                                attributes={attributes}
                                listeners={listeners}
                                disableDragLevel1={disableDragLevel1}
                                formatAmount={formatAmount}
                                getCategorySum={getCategorySum}
                                transactions={transactions}
                                categories={categories}
                                monthKey={monthKey}
                            />
                        </button>
                        {isOpenLevel1 && (
                            <div className="p-6 space-y-4">
                                {!hasLevel2 && (
                                    <div className="flex gap-4 text-xs mb-2">
                                        <label className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={getCategorySetting(level1.id).useDay}
                                                onChange={(e) =>
                                                    setCategorySettings((prev) => ({
                                                        ...prev,
                                                        [level1.id]: {
                                                            ...getCategorySetting(level1.id),
                                                            useDay: e.target.checked,
                                                        },
                                                    }))
                                                }
                                            />
                                            Dzień
                                        </label>

                                        <label className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={getCategorySetting(level1.id).useDescription}
                                                onChange={(e) =>
                                                    setCategorySettings((prev) => ({
                                                        ...prev,
                                                        [level1.id]: {
                                                            ...getCategorySetting(level1.id),
                                                            useDescription: e.target.checked,
                                                        },
                                                    }))
                                                }
                                            />
                                            Opis
                                        </label>
                                    </div>
                                )}
                                <AddCategoryForm
                                    placeholder="Nowa sekcja..."
                                    onAdd={(name) => {
                                        if (level1.type === "income") {
                                            addCategoryLevel2Income(name);
                                        } else {
                                            addCategoryLevel2(name);
                                        }
                                    }}
                                />
                                {!hasLevel2 && (
                                    <Level2AddForm
                                        categoryId={level1.id}
                                        settings={getCategorySetting(level1.id)}
                                        handleAdd={(id, amount, note, day) => {
                                            return addExpense(id, amount, note, day);
                                        }}
                                        getSuggestions={getSuggestionsSelector}
                                        suggestionBlacklist={suggestionBlacklist}
                                        setSuggestionBlacklist={setSuggestionBlacklist}
                                        maxDay={getMaxDaysInMonth(year, monthIndex)}
                                    />
                                )}
                                <Level1Transactions
                                    level1={level1}
                                    transactions={transactions}
                                    monthKey={monthKey}
                                    monthIndex={monthIndex}
                                    selectedTransactions={selectedTransactions}
                                    toggleTransactionSelection={toggleTransactionSelection}
                                    editingTransactionId={editingTransactionId}
                                    setEditingTransactionId={setEditingTransactionId}
                                    movingTransactionId={movingTransactionId}
                                    setMovingTransactionId={setMovingTransactionId}
                                    setTransactions={setTransactions}
                                    categories={categories}
                                    moveRef={moveRef}
                                    createLevel3Category={createLevel3Category}
                                    moveTransaction={moveTransaction}
                                    getAllowedCategories={getAllowedCategories}
                                    formatAmount={formatAmount}
                                />
                                {childrenLevel2.length > 0 ? (
                                    <Level2Controls
                                        sortModeLevel2={sortModeLevel2}
                                        setSortModeLevel2={setSortModeLevel2}
                                        setOpenLevel2={setOpenLevel2}
                                        setOpenLevel3={setOpenLevel3}
                                        resetLevel2Order={resetLevel2Order}
                                    />
                                ) : null}
                                <SortableContext
                                    items={sortCategories(childrenLevel2, sortModeLevel2).map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {sortCategories(childrenLevel2, sortModeLevel2).map((level2) => {
                                        const isOpenLevel2 = openLevel2 === level2.id;
                                        const childrenLevel3 = getChildren(level2.id);
                                        const displayedLevel3 =
                                            sortModeLevel3 === "manual"
                                                ? childrenLevel3
                                                : sortCategories(childrenLevel3, sortModeLevel3);

                                        return (
                                            <SortableItem key={level2.id} id={level2.id}>
                                                {({ attributes, listeners }) => (
                                                    <div
                                                        id={`category-${level2.id}`}
                                                        className="border rounded overflow-hidden"
                                                    >
                                                        <Level2Header
                                                            level2={level2}
                                                            attributes={attributes}
                                                            listeners={listeners}
                                                            monthKey={monthKey}
                                                            transactions={transactions}
                                                            categories={categories}
                                                            openLevel2={openLevel2}
                                                            setOpenLevel2={setOpenLevel2}
                                                            closeCategory={closeCategory}
                                                            reopenCategory={reopenCategory}
                                                            deleteCategory={deleteCategory}
                                                            renameCategory={renameCategory}
                                                            isCategoryActiveInMonth={isCategoryActiveInMonth}
                                                            formatAmount={formatAmount}
                                                            getCategorySum={getCategorySum}
                                                            disableDragLevel2={disableDragLevel2}
                                                        />

                                                        <Level2Section
                                                            level2={level2}
                                                            isOpenLevel2={isOpenLevel2}
                                                        >
                                                            <div
                                                                className="ml-4 p-4 flex flex-col gap-2"
                                                                style={{
                                                                    display: activeId === level2.id ? "none" : "flex"
                                                                }}
                                                            >
                                                                {childrenLevel3.length === 0 && (
                                                                    <div className="flex gap-4 text-xs mb-2">
                                                                        <label className="flex items-center gap-1">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={getCategorySetting(level2.id).useDay}
                                                                                onChange={(e) =>
                                                                                    setCategorySettings((prev) => ({
                                                                                        ...prev,
                                                                                        [level2.id]: {
                                                                                            ...getCategorySetting(level2.id),
                                                                                            useDay: e.target.checked,
                                                                                        },
                                                                                    }))
                                                                                }
                                                                            />
                                                                            Dzień
                                                                        </label>

                                                                        <label className="flex items-center gap-1">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={getCategorySetting(level2.id).useDescription}
                                                                                onChange={(e) =>
                                                                                    setCategorySettings((prev) => ({
                                                                                        ...prev,
                                                                                        [level2.id]: {
                                                                                            ...getCategorySetting(level2.id),
                                                                                            useDescription: e.target.checked,
                                                                                        },
                                                                                    }))
                                                                                }
                                                                            />
                                                                            Opis
                                                                        </label>
                                                                    </div>
                                                                )}

                                                                {/* ===== DODAWANIE WPISU (TYLKO JEŚLI BRAK LEVEL3) ===== */}
                                                                {childrenLevel3.length === 0 && (
                                                                    <Level2AddForm
                                                                        categoryId={level2.id}
                                                                        settings={getCategorySetting(level2.id)}
                                                                        handleAdd={(id, amount, note, day) =>
                                                                            addExpense(id, amount, note, day)
                                                                        }
                                                                        getSuggestions={getSuggestionsSelector}
                                                                        suggestionBlacklist={suggestionBlacklist}
                                                                        setSuggestionBlacklist={setSuggestionBlacklist}
                                                                        maxDay={getMaxDaysInMonth(year, monthIndex)}
                                                                    />
                                                                )}
                                                                {transactions
                                                                    .filter(
                                                                        (t) =>
                                                                            t.categoryId === level2.id &&
                                                                            t.monthKey === monthKey
                                                                    )
                                                                    .sort((a, b) => {
                                                                        if (a.day && b.day) return a.day - b.day
                                                                        if (a.day && !b.day) return -1
                                                                        if (!a.day && b.day) return 1
                                                                        return 0
                                                                    })
                                                                    .map((t) => (
                                                                        <TransactionRow
                                                                            key={t.id}
                                                                            t={t}
                                                                            monthIndex={monthIndex}
                                                                            selectedTransactions={selectedTransactions}
                                                                            toggleTransactionSelection={toggleTransactionSelection}
                                                                            editingTransactionId={editingTransactionId}
                                                                            setEditingTransactionId={setEditingTransactionId}
                                                                            movingTransactionId={movingTransactionId}
                                                                            setMovingTransactionId={setMovingTransactionId}
                                                                            setTransactions={setTransactions}
                                                                            categories={categories}
                                                                            moveRef={moveRef}
                                                                            createLevel3Category={createLevel3Category}
                                                                            moveTransaction={moveTransaction}
                                                                            getAllowedCategories={getAllowedCategories}
                                                                            formatAmount={formatAmount}
                                                                        />
                                                                    ))}
                                                                <AddCategoryForm
                                                                    placeholder="Nowa podkategoria..."
                                                                    onAdd={(name) => {
                                                                        addCategoryLevel3(level2.id, name);
                                                                    }}
                                                                />
                                                                {childrenLevel3.length > 0 && (
<div className="flex gap-2 text-xs mb-2">
                                                                    <select
                                                                        value={sortModeLevel3}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value;

                                                                            setSortModeLevel3(value);

                                                                            if (value === "manual") {
                                                                                setOpenLevel3(null);
                                                                            }
                                                                        }}
                                                                        className="border rounded px-2 py-1"
                                                                    >
                                                                        <option value="manual">Ręczne</option>
                                                                        <option value="usage-desc">Najczęściej używane</option>
                                                                        <option value="usage-asc">Najrzadziej używane</option>
                                                                        <option value="amount-desc">Największe kwoty</option>
                                                                        <option value="amount-asc">Najmniejsze kwoty</option>
                                                                    </select>
                                                                    <button
                                                                        onClick={() => {
                                                                            setOpenLevel3(null);
                                                                        }}
                                                                        className="px-2 py-1 border rounded bg-gray-200 dark:bg-gray-700"
                                                                    >
                                                                        Zwiń
                                                                    </button>
                                                                </div>
                                                                )}
                                                                <SortableContext
                                                                    items={displayedLevel3.map(c => c.id)}
                                                                    strategy={verticalListSortingStrategy}
                                                                >
                                                                    {displayedLevel3.map((level3) => {
                                                                        const isOpenLevel3 =
                                                                            openLevel3 === level3.id &&
                                                                            activeId !== level3.id;

                                                                        return (
                                                                            <SortableItem key={level3.id} id={level3.id}>
                                                                                {({ attributes, listeners }) => (
                                                                                    <div
                                                                                        id={`category-${level3.id}`}
                                                                                        className="border rounded"
                                                                                    >
                                                                                        <div className="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-600 font-medium">
                                                                                            {!disableDragLevel3 && (
                                                                                                <span
                                                                                                    {...attributes}
                                                                                                    {...listeners}
                                                                                                    className="cursor-grab mr-2"
                                                                                                >
                                                                                                    ⠿
                                                                                                </span>
                                                                                            )}
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    const newValue = isOpenLevel3 ? null : level3.id;
                                                                                                    setOpenLevel3(newValue);

                                                                                                    if (newValue) {
                                                                                                        setTimeout(() => {
                                                                                                            const el = document.getElementById(`category-${level3.id}`);
                                                                                                            if (el) {
                                                                                                                el.scrollIntoView({
                                                                                                                    behavior: "smooth",
                                                                                                                    block: "center"
                                                                                                                });
                                                                                                            }
                                                                                                        }, 100);
                                                                                                    }
                                                                                                }}
                                                                                                className="text-left flex-1"
                                                                                            >
                                                                                                {level3.name} — {formatAmount(getCategorySum(level3.id, transactions, categories, monthKey))} zł
                                                                                            </button>

                                                                                            {isCategoryActiveInMonth(level3, monthKey) ? (
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        closeCategory(level3.id);
                                                                                                    }}
                                                                                                    className="ml-2 text-sm"
                                                                                                    title="Zamknij kategorię"
                                                                                                >
                                                                                                    🔒
                                                                                                </button>
                                                                                            ) : (
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        reopenCategory(level3.id);
                                                                                                    }}
                                                                                                    className="ml-2 text-sm"
                                                                                                    title="Przywróć kategorię"
                                                                                                >
                                                                                                    🔓
                                                                                                </button>
                                                                                            )}

                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    deleteCategory(level3.id);
                                                                                                }}
                                                                                                className="ml-2 text-sm"
                                                                                                title="Usuń kategorię"
                                                                                            >
                                                                                                🗑
                                                                                            </button>

                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    renameCategory(level3.id);
                                                                                                }}
                                                                                                className="ml-2 text-sm"
                                                                                                title="Zmień nazwę"
                                                                                            >
                                                                                                ✏
                                                                                            </button>

                                                                                        </div>

                                                                                        {isOpenLevel3 && (
                                                                                            <div className="p-3 space-y-2">
                                                                                                {/* USTAWIENIA KATEGORII */}
                                                                                                {childrenLevel3.length > 0 && (
  <>
    <div className="flex gap-4 text-xs mb-2">
                                                                                                    <label className="flex items-center gap-1">
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            checked={getCategorySetting(level3.id).useDay}
                                                                                                            onChange={(e) =>
                                                                                                                setCategorySettings((prev) => ({
                                                                                                                    ...prev,
                                                                                                                    [level3.id]: {
                                                                                                                        ...getCategorySetting(level3.id),
                                                                                                                        useDay: e.target.checked,
                                                                                                                    },
                                                                                                                }))
                                                                                                            }
                                                                                                        />
                                                                                                        Dzień
                                                                                                    </label>

                                                                                                    <label className="flex items-center gap-1">
                                                                                                        <input
                                                                                                            type="checkbox"
                                                                                                            checked={getCategorySetting(level3.id).useDescription}
                                                                                                            onChange={(e) =>
                                                                                                                setCategorySettings((prev) => ({
                                                                                                                    ...prev,
                                                                                                                    [level3.id]: {
                                                                                                                        ...getCategorySetting(level3.id),
                                                                                                                        useDescription: e.target.checked,
                                                                                                                    },
                                                                                                                }))
                                                                                                            }
                                                                                                        />
                                                                                                        Opis
                                                                                                    </label>
                                                                                                </div>
                                                                                                </>
)}
                                                                                                <Level3Block
                                                                                                    level3={level3}
                                                                                                    transactions={transactions}
                                                                                                    monthKey={monthKey}
                                                                                                    setTransactions={setTransactions}
                                                                                                    selectedTransactions={selectedTransactions}
                                                                                                    toggleTransactionSelection={toggleTransactionSelection}
                                                                                                    editingTransactionId={editingTransactionId}
                                                                                                    setEditingTransactionId={setEditingTransactionId}
                                                                                                    movingTransactionId={movingTransactionId}
                                                                                                    setMovingTransactionId={setMovingTransactionId}
                                                                                                    moveRef={moveRef}
                                                                                                    categories={categories}
                                                                                                    monthIndex={monthIndex}
                                                                                                    formatAmount={formatAmount}
                                                                                                    createLevel3Category={createLevel3Category}
                                                                                                    moveTransaction={moveTransaction}
                                                                                                    getAllowedCategories={getAllowedCategories}
                                                                                                >
                                                                                                    <Level3AddForm
                                                                                                        categoryId={level3.id}
                                                                                                        settings={getCategorySetting(level3.id)}
                                                                                                        maxDay={getMaxDaysInMonth(year, monthIndex)}
                                                                                                        onAdd={(id, amount, note, day) => {
                                                                                                            return addExpense(id, amount, note, day);
                                                                                                        }}
                                                                                                        getSuggestions={getSuggestionsSelector}
                                                                                                        suggestionBlacklist={suggestionBlacklist}
                                                                                                        setSuggestionBlacklist={setSuggestionBlacklist}
                                                                                                    />
                                                                                                </Level3Block>
                                                                                            </div>
                                                                                            )}
                                                                                    </div>
                                                                                )}
                                                                            </SortableItem>
                                                                        );
                                                                    })}
                                                                </SortableContext>
                                                                {(() => {
                                                                    const archivedLevel3 = categories.filter(
                                                                        (cat) =>
                                                                            cat.parentId === level2.id &&
                                                                            cat.activePeriods &&
                                                                            !isCategoryActiveInMonth(cat, monthKey)
                                                                    );

                                                                    if (archivedLevel3.length === 0) return null;

                                                                    return (
                                                                        <div className="mt-3 ml-4">
                                                                            <button
                                                                                onClick={() =>
                                                                                    setShowArchived((prev) => ({
                                                                                        ...prev,
                                                                                        [level2.id]: !prev[level2.id],
                                                                                    }))
                                                                                }
                                                                                className="text-xs text-gray-500 underline"
                                                                            >
                                                                                {showArchived[level2.id]
                                                                                    ? "Ukryj archiwalne"
                                                                                    : "Pokaż archiwalne"}
                                                                            </button>

                                                                            {showArchived[level2.id] &&
                                                                                archivedLevel3.map((archivedCat) => (
                                                                                    <div
                                                                                        key={archivedCat.id}
                                                                                        className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm flex justify-between items-center rounded"
                                                                                    >
                                                                                        <span>{archivedCat.name}</span>

                                                                                        <button
                                                                                            onClick={() => reopenCategory(archivedCat.id)}
                                                                                            className="text-xs"
                                                                                        >
                                                                                            🔓 Przywróć
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </Level2Section>
                                                    </div>
                                                )}
                                            </SortableItem>
                                        );
                                    })}
                                </SortableContext>
                                {/* ===== ARCHIWALNE LEVEL2 ===== */}
                                {(() => {
                                    const archived = categories.filter(
                                        (cat) =>
                                            cat.parentId === level1.id &&
                                            cat.activePeriods &&
                                            !isCategoryActiveInMonth(cat, monthKey)
                                    );

                                    if (archived.length === 0) return null;

                                    return (
                                        <div className="mt-3">
                                            <button
                                                onClick={() =>
                                                    setShowArchived((prev) => ({
                                                        ...prev,
                                                        [level1.id]: !prev[level1.id],
                                                    }))
                                                }
                                                className="text-xs text-gray-500 underline"
                                            >
                                                {showArchived[level1.id]
                                                    ? "Ukryj archiwalne"
                                                    : "Pokaż archiwalne"}
                                            </button>

                                            {showArchived[level1.id] &&
                                                archived.map((archivedCat) => (
                                                    <div
                                                        key={archivedCat.id}
                                                        className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm flex justify-between items-center rounded"
                                                    >
                                                        <span>{archivedCat.name}</span>

                                                        <button
                                                            onClick={() => reopenCategory(archivedCat.id)}
                                                            className="text-xs"
                                                        >
                                                            🔓 Przywróć
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )}
            </SortableItem>

        </>
    );
}