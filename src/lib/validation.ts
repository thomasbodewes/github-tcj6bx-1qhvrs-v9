import { z } from 'zod'
import { ValidationError } from '@/types'

export const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  initials: z.string().min(1, 'Initials are required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
})

export const medicalRecordSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.string().min(1, 'Record type is required'),
  provider: z.string().min(1, 'Provider is required'),
  complaint: z.string().min(1, 'Chief complaint is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatment: z.string().min(1, 'Treatment is required'),
  notes: z.string(),
  followUpDate: z.string().optional(),
  medications: z.array(
    z.object({
      productName: z.string().min(1, 'Product name is required'),
      genericName: z.string().min(1, 'Generic name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      batch: z.string().min(1, 'Batch number is required'),
      expiryDate: z.string().min(1, 'Expiry date is required'),
    })
  ),
  aftercare: z.array(z.string()),
})

export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  type: z.enum(['Consultation', 'Treatment', 'Follow-up']),
  start: z.string().min(1, 'Start time is required'),
  end: z.string().min(1, 'End time is required'),
  notes: z.string().optional(),
})

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return { success: false, errors }
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed' }],
    }
  }
}