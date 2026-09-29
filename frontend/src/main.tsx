import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { store } from '@/store/store'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/snackbar/ToastProvider'
import Spinner from '@/layouts/shared/spinner/Spinner'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:                1,
      refetchOnWindowFocus: false,
      staleTime:            5 * 60 * 1000,
      gcTime:               10 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ThemeProvider>
            <ToastProvider>
              <Suspense fallback={<Spinner />}>
                <App />
              </Suspense>
            </ToastProvider>
          </ThemeProvider>
        </Provider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
