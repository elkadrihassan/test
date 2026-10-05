import { createContext, useContext } from 'react';

/** True once the loader has finished and the page may start its entrance animations. */
export const ReadyContext = createContext(false);
export const useReady = () => useContext(ReadyContext);
