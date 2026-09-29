// ToastProvider.tsx
import React from 'react'
import { Toaster as HotToaster } from 'react-hot-toast'
import hotToast from 'react-hot-toast'
import { toast as sonnerToast } from 'sonner'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { setToastHandler } from '@/services/axios-instance'
import { useAppSelector } from '@/store/store'
import type { ToastPosition } from '@/store/custom/customizerSlice'
import { CircleCheckIcon, OctagonXIcon, TriangleAlertIcon, InfoIcon } from 'lucide-react'

type Severity = 'success' | 'error' | 'info' | 'warning'

const severityConfig: Record<Severity, { icon: React.ReactElement; style: React.CSSProperties }> = {
  success: {
    icon:  <CircleCheckIcon size={16} />,
    style: { background: '#16a34a', color: '#fff' },
  },
  error: {
    icon:  <OctagonXIcon size={16} />,
    style: { background: '#dc2626', color: '#fff' },
  },
  warning: {
    icon:  <TriangleAlertIcon size={16} />,
    style: { background: '#d97706', color: '#fff' },
  },
  info: {
    icon:  <InfoIcon size={16} />,
    style: { background: '#2563eb', color: '#fff' },
  },
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toastPosition, toastType } = useAppSelector((s) => s.customizer)

  const showToast = React.useCallback(
    (message: string, severity: Severity = 'info') => {
      if (toastType === 'hot-toast') {
        const { icon, style } = severityConfig[severity] ?? severityConfig.info
        hotToast(message, { icon, style, duration: 3000 })
      } else {
        sonnerToast[severity]?.(message) ?? sonnerToast(message)
      }
    },
    [toastType]
  )

  React.useEffect(() => {
    setToastHandler(showToast)
  }, [showToast])

  return (
    <>
      {children}
      {toastType === 'hot-toast'
        ? <HotToaster position={toastPosition as ToastPosition} />
        : <SonnerToaster position={toastPosition as any} />
      }
    </>
  )
}

export default ToastProvider
