import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CalendarComponent = () => {
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
  };

  const handleSendToChroma = async () => {
    if (!selectedDay) return;

    const formattedDay = formatDate(selectedDay);
    try {
      const response = await fetch(`http://docs:6550/send_to_chroma/${formattedDay}`, { method: 'POST' });
      if (response.ok) {
        setAddedDays(prev => [...prev, selectedDay.toISOString().split('T')[0]]);
        setSelectedDay(null); // Clear selection after successful addition
        alert('Día enviado a Chroma exitosamente');
      } else {
        alert('Error al enviar el día a Chroma');
      }
    } catch (error) {
      console.error('Error sending day to Chroma:', error);
      alert('Error al enviar el día a Chroma');
    }
  };

  const isDateSelectable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Calendario</h3>
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
        className="rounded-md border mb-4"
      />
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