'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Calendar Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          {date && (
            <p className="mt-4 text-sm text-muted-foreground">
              Selected: {date.toDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
