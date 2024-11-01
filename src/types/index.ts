export interface Patient {
  id: string
  firstName: string
  lastName: string
  initials: string
  dob: string
  gender: 'Male' | 'Female' | 'Other'
  email: string
  phone: string
  address: string
  consentForm?: ConsentForm
  createdAt: string
  updatedAt: string
}

export interface ConsentForm {
  id: string
  signedAt: string
  location: string
  date: string
  patientName: string
  signature: string
  agreementText: string
}

export interface MedicalRecord {
  id: string
  patientId: string
  date: string
  type: string
  provider: string
  complaint: string
  diagnosis: string
  treatment: string
  notes: string
  followUpDate?: string
  medications: Medication[]
  aftercare: string[]
  images: RecordImage[]
  treatmentPoints: TreatmentPoint[]
  createdAt: string
  updatedAt: string
}

export interface Medication {
  id: string
  productName: string
  genericName: string
  dosage: string
  batch: string
  expiryDate: string
}

export interface RecordImage {
  id: string
  type: 'Before' | 'After'
  url: string
  uploadedAt: string
}

export interface TreatmentPoint {
  id: string
  area: string
  units: number
  coordinates: {
    x: number
    y: number
  }
}

export interface Appointment {
  id: string
  patientId: string
  title: string
  type: 'Consultation' | 'Treatment' | 'Follow-up'
  start: string
  end: string
  notes?: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  createdAt: string
  updatedAt: string
}

export type ValidationError = {
  field: string
  message: string
}