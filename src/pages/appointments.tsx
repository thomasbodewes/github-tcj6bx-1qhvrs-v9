import { useState, useEffect, useRef } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useToast } from '@/components/ui/use-toast'
import { AppointmentDialog } from '@/components/calendar/appointment-dialog'
import { CalendarHeader } from '@/components/calendar/calendar-header'
import { usePatients, useAppointments } from '@/hooks/useStorage'
import { useMediaQuery } from '@/hooks/use-media-query'
import { v4 as uuidv4 } from 'uuid'
import { addMinutes, format, parseISO, isPast } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Appointments() {
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null)
  const [deleteAppointmentId, setDeleteAppointmentId] = useState<string | null>(null)
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    type: '',
    date: '',
    time: '',
    duration: '60',
  })
  const calendarRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 640px)')
  const { patients } = usePatients()
  const { appointments, addAppointment, removeAppointment } = useAppointments()

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (calendarRef.current?.getApi()) {
        calendarRef.current.getApi().updateSize()
      }
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    if (selectedAppointmentId) {
      const appointment = appointments.find(a => a.id === selectedAppointmentId)
      if (appointment) {
        const startDate = parseISO(appointment.start)
        setNewAppointment({
          patientId: appointment.patientId,
          type: appointment.type,
          date: format(startDate, 'yyyy-MM-dd'),
          time: format(startDate, 'HH:mm'),
          duration: String(Math.round((new Date(appointment.end).getTime() - new Date(appointment.start).getTime()) / (1000 * 60)))
        })
        setIsNewAppointmentOpen(true)
      }
    }
  }, [selectedAppointmentId, appointments])

  const handleDateClick = (arg: { dateStr: string }) => {
    setSelectedDate(arg.dateStr)
    setSelectedAppointmentId(null)
    setNewAppointment({
      patientId: '',
      type: '',
      date: arg.dateStr,
      time: format(new Date(), 'HH:mm'),
      duration: '60',
    })
    setIsNewAppointmentOpen(true)
  }

  const handleEventClick = (arg: { event: any }) => {
    const appointment = appointments.find(a => a.id === arg.event.id)
    if (appointment) {
      navigate(`/patients/${appointment.patientId}`)
    }
  }

  const handleEditAppointment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAppointmentId(id)
  }

  const handleDeleteAppointment = () => {
    if (deleteAppointmentId) {
      removeAppointment(deleteAppointmentId)
      setDeleteAppointmentId(null)
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      })
    }
  }

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAppointment.patientId || !newAppointment.type || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const startDate = new Date(`${newAppointment.date}T${newAppointment.time}`)
    const endDate = addMinutes(startDate, parseInt(newAppointment.duration))

    const patient = patients.find(p => p.id === newAppointment.patientId)
    if (!patient) return

    const appointmentToAdd = {
      id: selectedAppointmentId || uuidv4(),
      patientId: newAppointment.patientId,
      title: `${patient.lastName}, ${patient.initials} - ${newAppointment.type}`,
      type: newAppointment.type,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      status: isPast(startDate) ? 'Completed' : 'Scheduled',
      createdAt: selectedAppointmentId ? appointments.find(a => a.id === selectedAppointmentId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addAppointment(appointmentToAdd)
    setIsNewAppointmentOpen(false)
    setSelectedAppointmentId(null)
    setNewAppointment({
      patientId: '',
      type: '',
      date: '',
      time: '',
      duration: '60',
    })

    toast({
      title: "Success",
      description: selectedAppointmentId ? "Appointment updated successfully" : "Appointment created successfully",
    })
  }

  const handleDialogClose = () => {
    setIsNewAppointmentOpen(false)
    setSelectedAppointmentId(null)
    setNewAppointment({
      patientId: '',
      type: '',
      date: '',
      time: '',
      duration: '60',
    })
  }

  const renderEventContent = (eventInfo: any) => {
    return (
      <div className="flex items-center justify-between w-full px-1">
        <div className="truncate">{eventInfo.event.title}</div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => handleEditAppointment(eventInfo.event.id, e)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteAppointmentId(eventInfo.event.id)
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  const formattedAppointments = appointments.map(appointment => {
    const startDate = new Date(appointment.start)
    const isPastAppointment = isPast(startDate)

    return {
      ...appointment,
      backgroundColor: isPastAppointment ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(221.2 83.2% 53.3%)',
      borderColor: isPastAppointment ? 'hsl(142.1 76.2% 36.3%)' : 'hsl(221.2 83.2% 53.3%)',
      textColor: 'white',
    }
  })

  return (
    <MainLayout>
      <div className="flex flex-col h-full space-y-4">
        <CalendarHeader onNewAppointment={() => {
          setSelectedAppointmentId(null)
          setIsNewAppointmentOpen(true)
        }} />

        <div ref={containerRef} className="flex-1 bg-background rounded-lg border shadow">
          <div className="h-full w-full">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? "timeGridDay" : "dayGridMonth"}
              firstDay={1}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: isMobile 
                  ? 'timeGridDay,timeGridWeek' 
                  : 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              events={formattedAppointments}
              eventContent={renderEventContent}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="100%"
              aspectRatio={isMobile ? 0.8 : 1.5}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={isMobile ? false : true}
              allDaySlot={!isMobile}
              slotMinTime="08:00:00"
              slotMaxTime="18:00:00"
              expandRows={true}
              stickyHeaderDates={true}
              nowIndicator={true}
              slotDuration="00:30:00"
              slotLabelInterval="01:00"
            />
          </div>
        </div>

        <AppointmentDialog
          isOpen={isNewAppointmentOpen}
          onOpenChange={handleDialogClose}
          appointment={newAppointment}
          onAppointmentChange={setNewAppointment}
          onSubmit={handleAppointmentSubmit}
          onDelete={selectedAppointmentId ? () => setDeleteAppointmentId(selectedAppointmentId) : undefined}
          patients={patients.map(p => ({
            id: p.id,
            name: `${p.lastName}, ${p.initials} (${p.firstName})`
          }))}
          mode={selectedAppointmentId ? 'edit' : 'create'}
        />

        <AlertDialog open={deleteAppointmentId !== null} onOpenChange={() => setDeleteAppointmentId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the appointment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteAppointmentId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAppointment}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}