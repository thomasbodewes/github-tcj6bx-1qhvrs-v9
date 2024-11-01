import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui/toaster'
import Dashboard from './pages/dashboard'
import Patients from './pages/patients'
import PatientDetails from './pages/patient-details'
import MedicalRecordDetail from './pages/medical-record-detail'
import MedicalRecordForm from './pages/medical-record-form'
import Appointments from './pages/appointments'
import Policies from './pages/policies'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
        <Route path="/patients/:patientId/records/:recordId" element={<MedicalRecordDetail />} />
        <Route path="/patients/:patientId/records/new" element={<MedicalRecordForm />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/policies" element={<Policies />} />
      </Routes>
      <Toaster />
    </>
  )
}