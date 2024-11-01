import { Button } from '@/components/ui/button'

interface CalendarHeaderProps {
  onNewAppointment: () => void
}

export function CalendarHeader({ onNewAppointment }: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      <h1 className="text-2xl font-bold">Appointments</h1>
      <Button 
        onClick={onNewAppointment}
        className="w-full sm:w-auto"
      >
        New Appointment
      </Button>
    </div>
  )
}