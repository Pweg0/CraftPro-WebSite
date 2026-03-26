'use client'
// src/components/shop/OrderStatusStepper.tsx

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, Package, Zap, XCircle, Check } from 'lucide-react'

interface OrderStatusStepperProps {
  status: string
}

const STEPS_NORMAL = [
  { key: 'pending',    label: 'Aguardando pagamento', icon: Clock,        color: 'brand-yellow'  },
  { key: 'paid',       label: 'Pago',                 icon: CheckCircle,  color: 'brand-blue'    },
  { key: 'delivering', label: 'Entregando',            icon: Package,      color: 'brand-purple'  },
  { key: 'delivered',  label: 'Entregue',              icon: Zap,          color: 'brand-online'  },
]

const STEP_FAILED = { key: 'failed', label: 'Falhou', icon: XCircle, color: 'brand-offline' }

// Maps status to step index (0-based)
const STATUS_TO_STEP: Record<string, number> = {
  pending:    0,
  paid:       1,
  delivering: 2,
  delivered:  3,
}

function getStepColorClass(color: string, variant: 'text' | 'bg' | 'border') {
  const map: Record<string, Record<string, string>> = {
    'brand-yellow':  { text: 'text-brand-yellow',  bg: 'bg-brand-yellow',  border: 'border-brand-yellow'  },
    'brand-blue':    { text: 'text-brand-blue',    bg: 'bg-brand-blue',    border: 'border-brand-blue'    },
    'brand-purple':  { text: 'text-brand-purple',  bg: 'bg-brand-purple',  border: 'border-brand-purple'  },
    'brand-online':  { text: 'text-brand-online',  bg: 'bg-brand-online',  border: 'border-brand-online'  },
    'brand-offline': { text: 'text-brand-offline', bg: 'bg-brand-offline', border: 'border-brand-offline' },
  }
  return map[color]?.[variant] ?? 'text-white/20'
}

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const router = useRouter()

  // Auto-refresh every 10s while status is not terminal
  useEffect(() => {
    if (status === 'delivered' || status === 'failed') return
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)
    return () => clearInterval(interval)
  }, [status, router])

  // Failed branch
  if (status === 'failed') {
    const Icon = STEP_FAILED.icon
    return (
      <div className="flex flex-col md:flex-row items-center gap-4 py-4">
        {STEPS_NORMAL.slice(0, 2).map((step, idx) => {
          const StepIcon = step.icon
          return (
            <div key={step.key} className="flex md:flex-col items-center gap-2 md:gap-1 flex-1">
              <div className="flex items-center gap-2 md:flex-col md:items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepColorClass(step.color, 'bg')}/20 ${getStepColorClass(step.color, 'border')} border`}>
                  <Check className={`w-4 h-4 ${getStepColorClass(step.color, 'text')}`} />
                </div>
                <span className={`text-xs ${getStepColorClass(step.color, 'text')}`}>{step.label}</span>
              </div>
              {idx < 1 && <div className="hidden md:block w-full h-0.5 bg-white/10 flex-1" />}
            </div>
          )
        })}
        <div className="hidden md:block w-full h-0.5 bg-white/10 flex-1" />
        <div
          className="flex md:flex-col items-center gap-2 md:gap-1 flex-1"
          aria-current="step"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepColorClass(STEP_FAILED.color, 'bg')}/20 ${getStepColorClass(STEP_FAILED.color, 'border')} border`}>
            <Icon className={`w-4 h-4 ${getStepColorClass(STEP_FAILED.color, 'text')}`} />
          </div>
          <span className={`text-xs ${getStepColorClass(STEP_FAILED.color, 'text')}`}>{STEP_FAILED.label}</span>
        </div>
      </div>
    )
  }

  const activeStepIndex = STATUS_TO_STEP[status] ?? 0

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 py-4">
      {STEPS_NORMAL.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = idx < activeStepIndex
        const isActive = idx === activeStepIndex
        const isFuture = idx > activeStepIndex

        return (
          <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-3 md:flex-col md:items-center w-full">
              <div
                aria-current={isActive ? 'step' : undefined}
                className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? `${getStepColorClass(step.color, 'bg')}/20 ${getStepColorClass(step.color, 'border')}`
                    : isActive
                    ? `${getStepColorClass(step.color, 'bg')}/20 ${getStepColorClass(step.color, 'border')}`
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {isCompleted ? (
                  <Check className={`w-4 h-4 ${getStepColorClass(step.color, 'text')}`} />
                ) : (
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? getStepColorClass(step.color, 'text') : 'text-white/20'
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs truncate ${
                  isActive
                    ? getStepColorClass(step.color, 'text')
                    : isCompleted
                    ? getStepColorClass(step.color, 'text')
                    : 'text-white/20'
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector line — only between steps, only on desktop */}
            {idx < STEPS_NORMAL.length - 1 && (
              <div
                className={`hidden md:block h-0.5 flex-1 w-full rounded-full mt-[-20px] transition-all duration-300 ${
                  idx < activeStepIndex ? getStepColorClass(STEPS_NORMAL[idx + 1].color, 'bg') + '/30' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
