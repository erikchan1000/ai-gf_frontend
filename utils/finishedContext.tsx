import { createContext } from 'react';

export const FinishedContext = createContext<any>(
  {
    finished: false,
    setFinished: () => {}
  }
);
