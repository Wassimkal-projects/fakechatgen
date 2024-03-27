// src/stores/index.ts
import React from "react";
import {appStore} from "./appStore";

export const StoreContext = React.createContext({
  appStore,
});

export const useStores = () => React.useContext(StoreContext);
