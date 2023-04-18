import { useState } from "react";

export const useBetterState = <T>(value: T) => {
  const [state, setState] = useState<T>(value);
  return {
    get value() {
      return state;
    },
    set value(v) {
      setState(v);
    },
  };
};
