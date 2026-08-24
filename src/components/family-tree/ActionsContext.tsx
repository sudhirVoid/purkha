import { createContext, useContext } from "react";
import type { Actions } from "./types";

export const ActionsContext = createContext<Actions | null>(null);
export const useActions = () => useContext(ActionsContext)!;
