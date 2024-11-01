import { Patient, MedicalRecord, Appointment } from '@/types'

const STORAGE_KEYS = {
  PATIENTS: 'patients',
  MEDICAL_RECORDS: 'medical_records',
  APPOINTMENTS: 'appointments',
} as const

export class StorageManager {
  private static instance: StorageManager
  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage:`, error)
      return defaultValue
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage:`, error)
    }
  }

  // Patients
  getPatients(): Patient[] {
    return this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, [])
  }

  savePatient(patient: Patient): void {
    const patients = this.getPatients()
    const index = patients.findIndex(p => p.id === patient.id)
    
    if (index >= 0) {
      patients[index] = { ...patient, updatedAt: new Date().toISOString() }
    } else {
      patients.push({
        ...patient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    this.setItem(STORAGE_KEYS.PATIENTS, patients)
  }

  deletePatient(id: string): void {
    const patients = this.getPatients().filter(p => p.id !== id)
    this.setItem(STORAGE_KEYS.PATIENTS, patients)
  }

  // Medical Records
  getMedicalRecords(patientId?: string): MedicalRecord[] {
    const records = this.getItem<MedicalRecord[]>(STORAGE_KEYS.MEDICAL_RECORDS, [])
    return patientId ? records.filter(r => r.patientId === patientId) : records
  }

  saveMedicalRecord(record: MedicalRecord): void {
    const records = this.getMedicalRecords()
    const index = records.findIndex(r => r.id === record.id)
    
    if (index >= 0) {
      records[index] = { ...record, updatedAt: new Date().toISOString() }
    } else {
      records.push({
        ...record,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    this.setItem(STORAGE_KEYS.MEDICAL_RECORDS, records)
  }

  deleteMedicalRecord(id: string): void {
    const records = this.getMedicalRecords().filter(r => r.id !== id)
    this.setItem(STORAGE_KEYS.MEDICAL_RECORDS, records)
  }

  // Appointments
  getAppointments(patientId?: string): Appointment[] {
    const appointments = this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [])
    return patientId ? appointments.filter(a => a.patientId === patientId) : appointments
  }

  saveAppointment(appointment: Appointment): void {
    const appointments = this.getAppointments()
    const index = appointments.findIndex(a => a.id === appointment.id)
    
    if (index >= 0) {
      appointments[index] = { ...appointment, updatedAt: new Date().toISOString() }
    } else {
      appointments.push({
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    
    this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments)
  }

  deleteAppointment(id: string): void {
    const appointments = this.getAppointments().filter(a => a.id !== id)
    this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments)
  }

  // Data Export/Import
  exportData(): string {
    const data = {
      patients: this.getPatients(),
      medicalRecords: this.getMedicalRecords(),
      appointments: this.getAppointments(),
    }
    return JSON.stringify(data)
  }

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      if (data.patients) this.setItem(STORAGE_KEYS.PATIENTS, data.patients)
      if (data.medicalRecords) this.setItem(STORAGE_KEYS.MEDICAL_RECORDS, data.medicalRecords)
      if (data.appointments) this.setItem(STORAGE_KEYS.APPOINTMENTS, data.appointments)
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error('Invalid data format')
    }
  }

  // Clear all data
  clearData(): void {
    localStorage.removeItem(STORAGE_KEYS.PATIENTS)
    localStorage.removeItem(STORAGE_KEYS.MEDICAL_RECORDS)
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS)
  }
}