"use client";

import { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import "react-calendar/dist/Calendar.css";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

interface DateRangePickerProps {
  onDateRangeChange: (range: DateRange) => void;
  currentDateRange?: DateRange;
  defaultDays?: number;
}

export function DateRangePicker({
  onDateRangeChange,
  currentDateRange,
  defaultDays = 30,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Initialize with default date range
  const getDefaultRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - defaultDays);
    return { startDate: start, endDate: end };
  };

  // Use current date range from props if available, otherwise use default
  const initialRange = currentDateRange || getDefaultRange();

  const [startDate, setStartDate] = useState<Date>(initialRange.startDate);
  const [endDate, setEndDate] = useState<Date>(initialRange.endDate);
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    initialRange.startDate,
    initialRange.endDate,
  ]);

  // Update local state when prop changes
  useEffect(() => {
    if (currentDateRange) {
      setStartDate(currentDateRange.startDate);
      setEndDate(currentDateRange.endDate);
      setDateRange([currentDateRange.startDate, currentDateRange.endDate]);
    }
  }, [currentDateRange]);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setStartDate(start);
    setEndDate(end);
    const range: [Date, Date] = [start, end];
    setDateRange(range);

    onDateRangeChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  const handleCalendarChange = (value: unknown) => {
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      if (start instanceof Date && end instanceof Date) {
        setStartDate(start);
        setEndDate(end);
        setDateRange([start, end]);
        onDateRangeChange({ startDate: start, endDate: end });
        setIsOpen(false);
      }
    }
  };

  const formatDateRange = () => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    const startFormatted = startDate.toLocaleDateString("en-US", formatOptions);
    const endFormatted = endDate.toLocaleDateString("en-US", formatOptions);

    if (startFormatted === endFormatted) {
      return startFormatted;
    }

    return `${startFormatted} - ${endFormatted}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Select Date Range</SheetTitle>
          <SheetDescription>
            Choose a date range to analyze your metrics
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-2 m-0 px-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(30)}>
              30 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(90)}>
              90 days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickSelect(365)}>
              365 days
            </Button>
          </div>

          <div className="w-full px-4">
            <Calendar
              onChange={handleCalendarChange}
              value={dateRange}
              selectRange
              className="w-full!"
              maxDate={new Date()}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm px-4">
              <span className="font-medium">Selected Range:</span>
              <span className="text-gray-600">{formatDateRange()}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
