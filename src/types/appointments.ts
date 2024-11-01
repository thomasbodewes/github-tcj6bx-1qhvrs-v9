export interface NewAppointment {
  patientId: string
  type: string
  date: string
  time: string
  duration: string
}

export interface Appointment {
  id: string
  title: string
  start: string
  end: string
  patientId: string
  type: string
}