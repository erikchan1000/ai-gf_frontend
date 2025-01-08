'use client'

import NiaInterface from '@/components/nia_interface';
import { useState, createContext } from 'react';
import { FinishedContext } from '@/utils/finishedContext';
import { Disclaimer } from '@/components/disclaimer';

export default function Home() {
  const [finished, setFinished] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(true);

  return (
    <FinishedContext.Provider value={{
      finished,
      setFinished
    }}>
      <main className="h-screen flex justify-center items-center sm:pt-5 sm:p-10 p-5 pt-5 pb-10">
        <NiaInterface />
        <Disclaimer open={open} onClose={() => setOpen(false)} />
      </main>
    </FinishedContext.Provider>
  )
}
