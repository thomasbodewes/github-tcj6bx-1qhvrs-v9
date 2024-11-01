import { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Calendar, FileText, Trash2, Printer, ClipboardList } from 'lucide-react'
import { format, differenceInYears } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePatients, useMedicalRecords, useAppointments } from "@/hooks/useStorage"
import { Patient, ConsentForm } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { SignaturePad } from "@/components/signature-pad"
import { v4 as uuidv4 } from 'uuid'
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

export default function PatientDetails() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null)
  const { patients, addPatient } = usePatients()
  const { records, removeRecord } = useMedicalRecords(id)
  const { appointments } = useAppointments(id)
  const { toast } = useToast()
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null)
  const [consentFormData, setConsentFormData] = useState({
    location: '',
    date: '',
    patientName: '',
    signature: '',
    hasAgreed: false
  })

  // Find the patient data
  const patient = patients.find(p => p.id === id)

  useEffect(() => {
    if (patient) {
      setEditedPatient(patient)
      if (patient.consentForm) {
        setConsentFormData({
          location: patient.consentForm.location,
          date: patient.consentForm.date,
          patientName: patient.consentForm.patientName,
          signature: patient.consentForm.signature,
          hasAgreed: true
        })
      }
    }
  }, [patient])

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob))
  }

  const handleDeleteRecord = () => {
    if (deleteRecordId) {
      removeRecord(deleteRecordId)
      setDeleteRecordId(null)
      toast({
        title: "Success",
        description: "Medical record deleted successfully",
      })
    }
  }

  const handleSavePatient = () => {
    if (editedPatient) {
      addPatient(editedPatient)
      setIsEditingPersonal(false)
      toast({
        title: "Success",
        description: "Patient details updated successfully",
      })
    }
  }

  const handleSignConsent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentFormData.signature) {
      toast({
        title: "Error",
        description: "Please provide a signature",
        variant: "destructive",
      })
      return
    }

    const consentForm: ConsentForm = {
      id: uuidv4(),
      signedAt: new Date().toISOString(),
      location: consentFormData.location,
      date: consentFormData.date,
      patientName: consentFormData.patientName,
      signature: consentFormData.signature,
      agreementText: "I hereby give consent for botulinum toxin treatment performed by T.C.F. Bodewes and agree to the associated costs."
    }

    if (editedPatient) {
      const updatedPatient = {
        ...editedPatient,
        consentForm
      }
      addPatient(updatedPatient)
      setEditedPatient(updatedPatient)
      toast({
        title: "Success",
        description: "Consent form signed successfully",
      })
    }
  }

  const handleDeleteConsent = () => {
    if (editedPatient) {
      const { consentForm, ...patientWithoutConsent } = editedPatient
      addPatient(patientWithoutConsent)
      setEditedPatient(patientWithoutConsent)
      setConsentFormData({
        location: '',
        date: '',
        patientName: '',
        signature: '',
        hasAgreed: false
      })
      toast({
        title: "Success",
        description: "Consent form deleted successfully",
      })
    }
  }

  if (!patient || !editedPatient) {
    return (
      <MainLayout>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/patients')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Patient not found</h1>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/patients')}
            className="w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">
            {patient.lastName}, {patient.initials} ({patient.firstName})
          </h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
  <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
  <TabsTrigger value="questionnaire" className="flex items-center gap-2 flex-shrink-0">
    <ClipboardList className="h-4 w-4" />
    <span className="hidden sm:inline">Medical Questionnaire</span>
  </TabsTrigger>
  <TabsTrigger value="consent" className="flex items-center gap-2 flex-shrink-0">
    <FileText className="h-4 w-4" />
    <span className="hidden sm:inline">Consent Form</span>
  </TabsTrigger>
  <TabsTrigger value="appointments" className="flex items-center gap-2 flex-shrink-0">
    <Calendar className="h-4 w-4" />
    <span className="hidden sm:inline">Appointments</span>
  </TabsTrigger>
</TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Personal Details</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isEditingPersonal) {
                      handleSavePatient()
                    } else {
                      setIsEditingPersonal(true)
                    }
                  }}
                >
                  {isEditingPersonal ? 'Save' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isEditingPersonal ? (
                    <>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input 
                          value={editedPatient.lastName}
                          onChange={(e) => setEditedPatient({ ...editedPatient, lastName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input 
                          value={editedPatient.firstName}
                          onChange={(e) => setEditedPatient({ ...editedPatient, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Initials</Label>
                        <Input 
                          value={editedPatient.initials}
                          onChange={(e) => setEditedPatient({ ...editedPatient, initials: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input 
                          type="date"
                          value={editedPatient.dob}
                          onChange={(e) => setEditedPatient({ ...editedPatient, dob: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Input 
                          value={editedPatient.gender}
                          onChange={(e) => setEditedPatient({ ...editedPatient, gender: e.target.value as Patient['gender'] })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input 
                          value={editedPatient.phone}
                          onChange={(e) => setEditedPatient({ ...editedPatient, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          value={editedPatient.email}
                          onChange={(e) => setEditedPatient({ ...editedPatient, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input 
                          value={editedPatient.address}
                          onChange={(e) => setEditedPatient({ ...editedPatient, address: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Name</p>
                        <p className="text-sm font-medium">{patient.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">First Name</p>
                        <p className="text-sm font-medium">{patient.firstName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Initials</p>
                        <p className="text-sm font-medium">{patient.initials}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="text-sm font-medium">
                          {format(new Date(patient.dob), "dd MMM yyyy")} ({calculateAge(patient.dob)} years)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="text-sm font-medium">{patient.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{patient.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{patient.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{patient.address}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Medical Records</h2>
              <Button 
                onClick={() => navigate(`/patients/${id}/records/new`)}
                className="w-full sm:w-auto"
              >
                Add Record
              </Button>
            </div>

            <div className="space-y-4">
              {records.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No medical records found
                  </CardContent>
                </Card>
              ) : (
                [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record) => (
  <Card 
    key={record.id}
    className="group relative"
                  >
                    <div 
                      className="absolute right-4 top-4 sm:top-14 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteRecordId(record.id)
                      }}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => navigate(`/patients/${patient.id}/records/${record.id}`)}
                    >
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <CardTitle className="text-lg pr-10 sm:pr-0">
                            {record.type}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.date), "dd MMM yyyy")}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Provider</p>
                            <p className="text-sm">{record.provider}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Treatment</p>
                            <p className="text-sm">{record.treatment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="questionnaire" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Medical Questionnaire</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="prose prose-sm max-w-none">
        {/* Placeholder for future questionnaire content */}
        <p className="text-muted-foreground">Medical questionnaire content will be added here.</p>
      </div>
    </CardContent>
  </Card>
</TabsContent>
          
          <TabsContent value="consent" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Treatment Consent Form</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {editedPatient.consentForm ? (
                  <div className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <h4 className="font-semibold">Signed Consent Form</h4>
                      
                      {/* Add the consent form description text */}
      <div className="mt-4">
        <p className="mb-4">
          Botulinum toxin is a preparation that can reduce muscle activity through injection. 
          Dynamic wrinkles can be caused by voluntary or involuntary contraction of certain muscles. 
          The cosmetic goal of botulinum toxin treatment is cosmetic improvement through muscle relaxation, reducing dynamic wrinkles and improving facial features. 
          Treatment takes place in one or two sessions, with results visible within a few days to 2 weeks and usually lasting 3 to 4 months. 
          After this period, the effect is completely broken down by the body and the muscle has recovered from the temporary relaxation
        </p>

        <h4 className="font-semibold mt-6 mb-2">Normal Side Effects:</h4>
        <ul className="list-disc pl-5 mb-4">
          <li>Minimal bleeding at injection site</li>
          <li>Local redness of the skin</li>
          <li>Local swelling of the skin</li>
          <li>Bruising at injection site</li>
        </ul>

        <p className="mb-4">
          These symptoms usually disappear within one to several days (bruising may last longer). 
          Temporary headache or grip-like symptoms may occasionally occur. 
          In exceptional cases, an adjacent muscle may be weakened by the injected botulinum toxin.
        </p>
      </div>
                      
                      <div className="mt-8 space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Patient Name</p>
                          <p className="text-sm font-medium">{editedPatient.consentForm.patientName}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Agreement</p>
                          <p className="text-sm">{editedPatient.consentForm.agreementText}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="text-sm font-medium">{editedPatient.consentForm.location}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="text-sm font-medium">
                              {format(new Date(editedPatient.consentForm.date), "dd MMM yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Signature</p>
                          <img 
                            src={editedPatient.consentForm.signature} 
                            alt="Patient signature" 
                            className="border rounded-md bg-background p-2"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteConsent}
                        className="w-full sm:w-auto"
                      >
                        Delete Consent Form
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-4">Botulinum Toxin Treatment Agreement</h3>
                    
                    <p className="mb-4">
                     Botulinum toxin is a preparation that can reduce muscle activity through injection. 
                      Dynamic wrinkles can be caused by voluntary or involuntary contraction of certain muscles. 
                      The cosmetic goal of botulinum toxin treatment is cosmetic improvement through muscle relaxation, reducing dynamic wrinkles and improving facial features. 
                      Treatment takes place in one or two sessions, with results visible within a few days to 2 weeks and usually lasting 3 to 4 months. 
                      After this period, the effect is completely broken down by the body and the muscle has recovered from the temporary relaxation
                    </p>

                    <h4 className="font-semibold mt-6 mb-2">Normal Side Effects:</h4>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Minimal bleeding at injection site</li>
                      <li>Local redness of the skin</li>
                      <li>Local swelling of the skin</li>
                      <li>Bruising at injection site</li>
                    </ul>

                     <p className="mb-4">
                    These symptoms usually disappear within one to several days (bruising may last longer). 
                    Temporary headache or grip-like symptoms may occasionally occur. 
                    In exceptional cases, an adjacent muscle may be weakened by the injected botulinum toxin.

                        </p>
                    
                    <form onSubmit={handleSignConsent} className="mt-8 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="patientName">Patient Name</Label>
                        <Input
                          id="patientName"
                          value={consentFormData.patientName}
                          onChange={(e) => setConsentFormData({ ...consentFormData, patientName: e.target.value })}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="consent" 
                          className="h-4 w-4"
                          checked={consentFormData.hasAgreed}
                          onChange={(e) => setConsentFormData({ ...consentFormData, hasAgreed: e.target.checked })}
                          required 
                        />
                        <Label htmlFor="consent" className="text-sm">
                          I hereby give consent for botulinum toxin treatment performed by T.C.F. Bodewes and agree to the associated costs.
                        </Label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={consentFormData.location}
                            onChange={(e) => setConsentFormData({ ...consentFormData, location: e.target.value })}
                            placeholder="Enter location"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={consentFormData.date}
                            onChange={(e) => setConsentFormData({ ...consentFormData, date: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signature">Digital Signature</Label>
                        <SignaturePad
                          onSave={(signature) => setConsentFormData({ ...consentFormData, signature })}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="w-full sm:w-auto"
                          disabled={!consentFormData.hasAgreed || !consentFormData.signature}
                        >
                          Sign and Submit
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Appointments</h2>
              <Button 
                onClick={() => navigate('/appointments')}
                className="w-full sm:w-auto"
              >
                Schedule Appointment
              </Button>
            </div>

            {appointments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No appointments found
                </CardContent>
              </Card>
            ) : (
              [...appointments]
  .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
  .map((appointment) => (
  <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <CardTitle className="text-lg">{appointment.type}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs w-fit ${
                        appointment.status === 'Completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : appointment.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Start Time</p>
                        <p className="text-sm">
                          {format(new Date(appointment.start), "dd MMM yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">End Time</p>
                        <p className="text-sm">
                          {format(new Date(appointment.end), "dd MMM yyyy HH:mm")}
                        </p>
                      </div>
                      {appointment.notes && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={deleteRecordId !== null} onOpenChange={() => setDeleteRecordId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the medical record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteRecordId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRecord}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}