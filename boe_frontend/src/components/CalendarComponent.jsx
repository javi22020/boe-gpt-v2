"use client"

import React, { useState } from "react"
import LoadingSpinner from "./LoadingSpinner"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import axios from "axios"

export default function Component() {
  const [date, setDate] = useState(undefined)
  const [loading, setLoading] = useState(false)

  function handleDateSelect(selectedDate) {
    setDate(selectedDate)
  }

  async function handleSubmit() {
    if (date) {
      const formattedDate = format(date, "yyyyMMdd")
      try {
        setLoading(true)
        await axios.post(`http://docs:6550/send_to_chroma/${formattedDate}`)
        alert("Fecha enviada con éxito")
      } catch (error) {
        console.error("Error al enviar la fecha:", error)
        alert("Error al enviar la fecha")
      }
      setLoading(false)
    } else {
      alert("Por favor, selecciona una fecha")
    }
  }

  function disableDates(date) {
    return date > new Date() || date < new Date("2000-01-01") || date.getDay() === 0
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        disabled={disableDates}
        showOutsideDays={false}
      />
      {loading ? <LoadingSpinner /> : <Button onClick={handleSubmit} disabled={!date}>
        Enviar a Chroma
      </Button>}
    </div>
  )
}