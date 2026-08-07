import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../ui';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets = [
  { label: 'Today', getValue: () => { const d = new Date(); return { startDate: d, endDate: d }; } },
  { label: 'Yesterday', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return { startDate: d, endDate: d }; } },
  { label: 'Last 7 Days', getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 6); return { startDate: s, endDate: e }; } },
  { label: 'Last 30 Days', getValue: () => { const e = new Date(); const s = new Date(); s.setDate(s.getDate() - 29); return { startDate: s, endDate: e }; } },
  { label: 'This Month', getValue: () => { const d = new Date(); return { startDate: new Date(d.getFullYear(), d.getMonth(), 1), endDate: new Date(d.getFullYear(), d.getMonth() + 1, 0) }; } },
  { label: 'Last Month', getValue: () => { const d = new Date(); return { startDate: new Date(d.getFullYear(), d.getMonth() - 1, 1), endDate: new Date(d.getFullYear(), d.getMonth(), 0) }; } },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date | null, d2: Date | null) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

function formatDate(d: Date | null) {
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${d.getFullYear()}`;
}

function CalendarPanel({ 
  year, 
  month, 
  range, 
  hoveredDate, 
  onDateClick, 
  onDateHover,
  showPrevArgs,
  showNextArgs,
  onMonthChange,
  onYearChange
}: { 
  year: number, month: number, range: DateRange, hoveredDate: Date | null,
  onDateClick: (d: Date) => void, onDateHover: (d: Date) => void,
  showPrevArgs: boolean, showNextArgs: boolean,
  onMonthChange: (m: number, y: number) => void,
  onYearChange: (y: number) => void
}) {
  const [viewMode, setViewMode] = useState<'date' | 'month' | 'year'>('date');
  const [panelYear, setPanelYear] = useState(year); 

  useEffect(() => {
    if (viewMode === 'date') {
      setPanelYear(year);
    }
  }, [year, viewMode]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const current = new Date(year, month, i);
    const isStart = isSameDay(current, range.startDate);
    const isEnd = isSameDay(current, range.endDate);
    
    let isBetween = false;
    if (range.startDate && range.endDate) {
      isBetween = current > range.startDate && current < range.endDate;
    } else if (range.startDate && hoveredDate) {
      isBetween = (current > range.startDate && current < hoveredDate) || (current < range.startDate && current > hoveredDate);
    }

    let roundedClasses = "";
    if (isStart && !isEnd) roundedClasses = "rounded-l-lg";
    else if (isEnd && !isStart) roundedClasses = "rounded-r-lg";
    else if (isStart && isEnd) roundedClasses = "rounded-lg";

    const isSelected = isStart || isEnd;

    cells.push(
      <div 
        key={`day-${i}`} 
        className={`w-8 h-8 flex items-center justify-center cursor-pointer text-sm transition-colors
          ${isSelected ? 'bg-primary-600 text-white font-medium shadow-sm ' + roundedClasses : ''}
          ${!isSelected && isBetween ? 'bg-primary-50 text-primary-800' : ''}
          ${!isSelected && !isBetween ? 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-full' : ''}
        `}
        onClick={() => onDateClick(current)}
        onMouseEnter={() => onDateHover(current)}
      >
        {i}
      </div>
    );
  }

  const startDecade = Math.floor(panelYear / 10) * 10;
  
  const handlePrev = () => {
    if (viewMode === 'date') onMonthChange(month - 1, year);
    else if (viewMode === 'month') setPanelYear(p => p - 1);
    else if (viewMode === 'year') setPanelYear(p => p - 10);
  };
  
  const handleNext = () => {
    if (viewMode === 'date') onMonthChange(month + 1, year);
    else if (viewMode === 'month') setPanelYear(p => p + 1);
    else if (viewMode === 'year') setPanelYear(p => p + 10);
  };

  const handlePrevYear = () => {
    if (viewMode === 'date') onYearChange(year - 1);
  };
  
  const handleNextYear = () => {
    if (viewMode === 'date') onYearChange(year + 1);
  };

  return (
    <div className="flex-1 w-64">
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex gap-1">
          {showPrevArgs && (
            <>
              <button onClick={viewMode === 'date' ? handlePrevYear : handlePrev} className="p-1 hover:bg-neutral-100 rounded text-neutral-500">
                <ChevronsLeft className="w-4 h-4" />
              </button>
              {viewMode === 'date' && (
                <button onClick={handlePrev} className="p-1 hover:bg-neutral-100 rounded text-neutral-500">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-1 font-semibold text-neutral-800">
          {viewMode === 'date' && (
            <>
              <button onClick={() => setViewMode('month')} className="hover:bg-neutral-100 px-2 py-1 rounded transition-colors">{months[month]}</button>
              <button onClick={() => setViewMode('year')} className="hover:bg-neutral-100 px-2 py-1 rounded transition-colors">{year}</button>
            </>
          )}
          {viewMode === 'month' && (
            <button onClick={() => setViewMode('year')} className="hover:bg-neutral-100 px-2 py-1 rounded transition-colors">{panelYear}</button>
          )}
          {viewMode === 'year' && (
            <span className="px-2 py-1">{startDecade} - {startDecade + 9}</span>
          )}
        </div>

        <div className="flex gap-1">
          {showNextArgs && (
            <>
              {viewMode === 'date' && (
                <button onClick={handleNext} className="p-1 hover:bg-neutral-100 rounded text-neutral-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button onClick={viewMode === 'date' ? handleNextYear : handleNext} className="p-1 hover:bg-neutral-100 rounded text-neutral-500">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'date' && (
        <>
          <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center mb-2">
            {days.map(d => <div key={d} className="text-xs font-medium text-neutral-500 w-8">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1 gap-x-0">
            {cells}
          </div>
        </>
      )}

      {viewMode === 'month' && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {months.map((m, i) => (
            <button 
              key={m} 
              className={`py-4 text-sm rounded-lg font-medium transition-colors hover:bg-primary-50 hover:text-primary-600
                ${month === i && year === panelYear ? 'bg-primary-600 text-white hover:bg-primary-700 hover:text-white' : 'text-neutral-700'}
              `}
              onClick={() => {
                onMonthChange(i, panelYear);
                setViewMode('date');
              }}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'year' && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {Array.from({length: 12}, (_, i) => startDecade - 1 + i).map((y, i) => (
            <button 
              key={y} 
              className={`py-4 text-sm rounded-lg font-medium transition-colors hover:bg-primary-50 hover:text-primary-600
                ${y === year ? 'bg-primary-600 text-white hover:bg-primary-700 hover:text-white' : 'text-neutral-700'}
                ${i === 0 || i === 11 ? 'text-neutral-300' : ''}
              `}
              onClick={() => {
                setPanelYear(y);
                setViewMode('month');
              }}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeMonth, setActiveMonth] = useState(value.startDate || new Date());
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Sync tempRange when value changes externally
  useEffect(() => {
    if (!open) {
      setTempRange(value);
      setActiveMonth(value.startDate || new Date());
    }
  }, [value, open]);

  const handleDateClick = (date: Date) => {
    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      setTempRange({ startDate: date, endDate: null });
    } else {
      if (date < tempRange.startDate) {
        setTempRange({ startDate: date, endDate: tempRange.startDate });
      } else {
        setTempRange({ ...tempRange, endDate: date });
      }
    }
  };

  const handleApply = () => {
    if (tempRange.startDate && tempRange.endDate) {
      onChange(tempRange);
      setOpen(false);
    }
  };

  const displayString = value.startDate && value.endDate 
    ? `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`
    : 'Select Date Range';

  const nextMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-3 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all w-full min-w-[240px]"
      >
        <span>{displayString}</span>
        <CalendarIcon className="w-4 h-4 text-neutral-500" />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 flex flex-col md:flex-row gap-6 overflow-hidden md:w-auto w-[300px]">
          
          {/* Sidebar */}
          <div className="w-full md:w-32 flex flex-row md:flex-col gap-1 md:pr-4 md:border-r border-neutral-100 shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0 border-b md:border-b-0">
            {presets.map(p => (
              <button
                key={p.label}
                className="text-left px-3 py-2 text-sm text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors whitespace-nowrap"
                onClick={() => {
                  const range = p.getValue();
                  setTempRange(range);
                  setActiveMonth(new Date(range.startDate!.getFullYear(), range.startDate!.getMonth(), 1));
                  onChange(range);
                  setOpen(false);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Calendars */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col md:flex-row gap-8">
              <CalendarPanel 
                year={activeMonth.getFullYear()} 
                month={activeMonth.getMonth()} 
                range={tempRange}
                hoveredDate={hoveredDate}
                onDateClick={handleDateClick}
                onDateHover={setHoveredDate}
                showPrevArgs={true}
                showNextArgs={false}
                onMonthChange={(m, y) => setActiveMonth(new Date(y, m, 1))}
                onYearChange={(y) => setActiveMonth(new Date(y, activeMonth.getMonth(), 1))}
              />
              <div className="hidden md:block">
                <CalendarPanel 
                  year={nextMonth.getFullYear()} 
                  month={nextMonth.getMonth()} 
                  range={tempRange}
                  hoveredDate={hoveredDate}
                  onDateClick={handleDateClick}
                  onDateHover={setHoveredDate}
                  showPrevArgs={false}
                  showNextArgs={true}
                  onMonthChange={(m, y) => setActiveMonth(new Date(y, m - 1, 1))}
                  onYearChange={(y) => setActiveMonth(new Date(y, activeMonth.getMonth(), 1))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-neutral-100">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleApply} disabled={!tempRange.startDate || !tempRange.endDate}>Apply</Button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
