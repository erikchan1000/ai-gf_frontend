'use client'

import NiaInterface from '@/components/nia_interface';
import { StyledEngineProvider } from '@mui/material';
export default function Home() {

  return (
      <main className="h-screen flex justify-center items-center p-10">
        <NiaInterface />
      </main>
  )
}
