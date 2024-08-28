import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CalendarComponent = ({ onDaySelect }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [addedDays, setAddedDays] = useState([]);

  useEffect(() => {
    fetchAddedDays();
  }, []);

  const fetchAddedDays = async () => {
    try {
      const response = await fetch('http://docs:6550/collections');
      const data = await response.json();
      const formattedDays = data.map(day => {
        const year = day.substring(0, 4);
        const month = day.substring(4, 6);
        const date = day.substring(6, 8);
        return `${year}-${month}-${date}`;
      });
      setAddedDays(formattedDays);
    } catch (error) {
      console.error('Error fetching added days:', error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    if (onDaySelect) {
      onDaySelect(day.toISOString().split('T')[0]);
    }
  };

  const handleSendToChroma = async () => {
    if (!selectedDay) return;

    const formattedDay = formatDate(selectedDay);
    try {
      const response = await fetch(`http://docs:6550/send_to_chroma/${formattedDay}`, { method: 'POST' });
      if (response.ok) {
        setAddedDays(prev => [...prev, selectedDay.toISOString().split('T')[0]]);
        setSelectedDay(null); // Clear selection after successful addition
      } else {
        console.error('Error al enviar el día a Chroma');
      }
    } catch (error) {
      console.error('Error sending day to Chroma:', error);
    }
  };

  const isDateSelectable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Calendario</h3>
      <div className="overflow-hidden">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={handleDaySelect}
          disabled={(date) => !isDateSelectable(date)}
          modifiers={{
            today: (date) => {
              const today = new Date();
              return date.getDate() === today.getDate() &&
                     date.getMonth() === today.getMonth() &&
                     date.getFullYear() === today.getFullYear();
            }
          }}
          modifiersStyles={{
            today: {
              fontWeight: 'bold',
              border: '1px solid currentColor'
            }
          }}
          className="rounded-md border mb-4 w-full"
          classNames={{
            months: "w-full",
            month: "w-full",
            table: "w-full",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex-1",
            day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 mx-auto",
            day_range_start: "day-range-start",
            day_range_end: "day-range-end",
            day_selected: 
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_hidden: "invisible",
          }}
        />
      </div>
      <Button 
        onClick={handleSendToChroma} 
        disabled={!selectedDay}
        className="w-full mb-4"
      >
        Enviar a Chroma
      </Button>
      <div className="mt-4">
        <h4 className="text-md font-semibold mb-2">Días añadidos:</h4>
        <div className="flex flex-wrap gap-2">
          {addedDays.map((day) => (
            <Badge key={day} variant="secondary">
              {day}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;