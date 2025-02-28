import { drizzle } from "drizzle-orm/expo-sqlite";
import React, { createContext, ReactNode, useContext } from "react";

const DatabaseContext = createContext<ReturnType<typeof drizzle> | undefined>(
  undefined
);

export const DrizzleDBProvider: React.FC<{
  value: ReturnType<typeof drizzle>;
  children: ReactNode;
}> = ({ value, children }) => {
  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDrizzleDB = () => {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error("DatabaseProvider not found");
  }
  return db;
};
