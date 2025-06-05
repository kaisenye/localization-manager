import * as React from "react"
import { tw } from "../../lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showValue?: boolean
  valueFormatter?: (value: number) => string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showValue = false, valueFormatter, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const formattedValue = valueFormatter ? valueFormatter(percentage) : `${percentage.toFixed(1)}%`

    return (
      <div className="space-y-1">
        {showValue && (
          <div className="flex justify-between text-sm">
            <span className="text-stone-600 dark:text-stone-400">Progress</span>
            <span className="text-stone-600 dark:text-stone-400">{formattedValue}</span>
          </div>
        )}
        <div
          ref={ref}
          className={tw(
            "relative h-2.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700",
            className
          )}
          {...props}
        >
          <div
            className="h-full w-full flex-1 bg-blue-600 transition-all duration-300"
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress } 