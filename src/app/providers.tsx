'use client'

import { ThemeProvider, useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner';

export function Providers({ children }: { readonly children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      enableSystem
    >
      {children}
      <Toaster />
    </ThemeProvider>
  )
}


export function Toaster() {
  const { resolvedTheme } = useTheme();

  if (!resolvedTheme) return null;

  return (
    <Sonner
      richColors
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
    />
  )
}