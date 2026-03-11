"use client";

import { createContext, useContext } from "react";

const BudgetContext = createContext(null);

export const BudgetProvider = ({ value, children }) => {
  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudget must be used within BudgetProvider");
  }
  return context;
};