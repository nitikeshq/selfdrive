import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

export function DateTimePicker({ value, onChange, placeholder = "Select date & time", className, "data-testid": dataTestId }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  
  // Parse the datetime-local value if it exists
  const dateValue = value ? new Date(value) : undefined;
  
  // Extract time from datetime string (HH:mm format)
  const timeValue = value ? value.split('T')[1]?.substring(0, 5) || "09:00" : "09:00";

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Combine selected date with current time value
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const newDateTime = `${year}-${month}-${day}T${timeValue}`;
      onChange(newDateTime);
    }
  };

  const handleTimeChange = (newTime: string) => {
    if (dateValue) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      const newDateTime = `${year}-${month}-${day}T${newTime}`;
      onChange(newDateTime);
    } else {
      // If no date selected, use today's date
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const newDateTime = `${year}-${month}-${day}T${newTime}`;
      onChange(newDateTime);
    }
  };

  const displayText = dateValue 
    ? `${format(dateValue, "MMM dd, yyyy")} ${timeValue}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-11 md:h-10",
            !dateValue && "text-muted-foreground",
            className
          )}
          data-testid={dataTestId}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate text-sm">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="h-9"
              data-testid={dataTestId ? `${dataTestId}-time` : undefined}
            />
          </div>
        </div>
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleDateSelect}
          initialFocus
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </PopoverContent>
    </Popover>
  );
}
