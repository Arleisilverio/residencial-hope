import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface SimpleDatePickerProps {
  value: Date;
  onSelect: (date: Date) => void;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({ value, onSelect }) => {
  const [day, setDay] = useState(() => format(value, 'd'));
  const [month, setMonth] = useState(() => format(value, 'M'));
  const [year, setYear] = useState(() => format(value, 'yyyy'));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => currentYear - 20 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    const selectedDay = parseInt(day);
    const daysInSelectedMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    
    // Ajusta o dia se ele for inválido para o novo mês/ano (ex: 31 de Fev)
    if (selectedDay > daysInSelectedMonth) {
      setDay(String(daysInSelectedMonth));
    }
  }, [month, year]);

  useEffect(() => {
    const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(newDate.getTime())) {
      onSelect(newDate);
    }
  }, [day, month, year, onSelect]);

  const selectClassName = "w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1">
        <label htmlFor="day-select" className="sr-only">Dia</label>
        <select id="day-select" value={day} onChange={(e) => setDay(e.target.value)} className={selectClassName}>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="month-select" className="sr-only">Mês</label>
        <select id="month-select" value={month} onChange={(e) => setMonth(e.target.value)} className={selectClassName}>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="flex-[1.5]">
        <label htmlFor="year-select" className="sr-only">Ano</label>
        <select id="year-select" value={year} onChange={(e) => setYear(e.target.value)} className={selectClassName}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
};

export default SimpleDatePicker;