'use client'

import NiaInterface from '@/components/nia_interface';
import { useState, createContext } from 'react';
import { FinishedContext } from '@/utils/finishedContext';

export default function Home() {
  const [finished, setFinished] = useState<boolean>(false);
  return (
    <FinishedContext.Provider value={{
      finished,
      setFinished
    }}>
      <main className="h-screen flex justify-center items-center sm:pt-5 sm:p-10 p-5 pt-5 pb-10">
        <NiaInterface />
      </main>
    </FinishedContext.Provider>
  )
}
