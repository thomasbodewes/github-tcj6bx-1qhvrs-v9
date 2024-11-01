import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

interface AppointmentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  appointment: {
    patientId: string
    type: string
    date: string
    time: string
    duration: string
  }
  onAppointmentChange: (appointment: any) => void
  onSubmit: (e: React.FormEvent) => void
  onDelete?: () => void
  patients: Array<{ id: string; name: string }>
  mode: 'create' | 'edit'
}

const appointmentTypes = [
  { value: 'Consultation', label: 'Consultation' },
  { value: 'Treatment', label: 'Treatment' },
  { value: 'Follow-up', label: 'Follow-up' }
]

const durations = [
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' }
]

export function AppointmentDialog({
  isOpen,
  onOpenChange,
  appointment,
  onAppointmentChange,
  onSubmit,
  onDelete,
  patients,
  mode
}: AppointmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{mode === 'create' ? 'New Appointment' : 'Edit Appointment'}</DialogTitle>
            {mode === 'edit' && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select
              value={appointment.patientId}
              onValueChange={(value) => onAppointmentChange({ ...appointment, patientId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Appointment Type</Label>
            <Select
              value={appointment.type}
              onValueChange={(value) => onAppointmentChange({ ...appointment, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={appointment.date}
                onChange={(e) => onAppointmentChange({ ...appointment, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={appointment.time}
                onChange={(e) => onAppointmentChange({ ...appointment, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={appointment.duration}
              onValueChange={(value) => onAppointmentChange({ ...appointment, duration: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="w-full sm:w-auto"
            >
              {mode === 'create' ? 'Create Appointment' : 'Update Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}