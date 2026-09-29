import * as React from "react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months:          "flex flex-col gap-4",
        month:           "flex flex-col gap-3",
        month_caption:   "flex items-center justify-center relative h-9 px-8",
        caption_label:   "text-sm font-semibold select-none",
        // dropdown layout — month + year selects
        dropdowns:       "flex items-center justify-center gap-1.5 h-9",
        dropdown_root:   "relative",
        dropdown:        cn(
          "h-8 rounded-md border border-input bg-background px-2 pr-7 text-sm font-medium",
          "appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring",
          "hover:bg-accent hover:text-accent-foreground transition-colors"
        ),
        nav:             "absolute inset-x-0 top-0 flex items-center justify-between px-1 h-9",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 p-0 opacity-70 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 p-0 opacity-70 hover:opacity-100"
        ),
        month_grid:  "w-full border-collapse",
        weekdays:    "flex",
        weekday:     "w-9 text-[0.75rem] font-medium text-muted-foreground text-center select-none pb-1",
        week:        "flex w-full",
        day:         "relative p-0 text-center text-sm",
        day_button:  cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal rounded-md",
          "aria-selected:opacity-100"
        ),
        selected:    "bg-primary text-primary-foreground rounded-md hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today:       "bg-accent text-accent-foreground rounded-md font-semibold",
        outside:     "text-muted-foreground opacity-40 aria-selected:opacity-30",
        disabled:    "text-muted-foreground opacity-30 cursor-not-allowed",
        range_start: "rounded-l-md",
        range_end:   "rounded-r-md",
        range_middle:"aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none",
        hidden:      "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left"
            ? <ChevronLeftIcon className="size-3.5" />
            : <ChevronRightIcon className="size-3.5" />,
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
