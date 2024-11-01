import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpDown, Trash2, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { differenceInYears, differenceInDays, format } from "date-fns"
import { usePatients, useMedicalRecords } from "@/hooks/useStorage"
import { Patient } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { validateData, patientSchema } from "@/lib/validation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Patients() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { patients, addPatient, removePatient } = usePatients()
  const { records } = useMedicalRecords()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    firstName: "",
    lastName: "",
    initials: "",
    dob: "",
    gender: "Male",
    email: "",
    phone: "",
    address: "",
  })

  const calculateAge = (dob: string) => {
    return differenceInYears(new Date(), new Date(dob))
  }

  const getLastVisit = (patientId: string) => {
    const patientRecords = records.filter(r => r.patientId === patientId)
    if (patientRecords.length === 0) return null
    
    const sortedRecords = patientRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sortedRecords[0].date
  }

  const calculateDaysSinceVisit = (lastVisit: string) => {
    return differenceInDays(new Date(), new Date(lastVisit))
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd-MMM-yyyy")
  }

  const filteredPatients = patients
    .filter(patient => 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.initials.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const compareResult = a.lastName.localeCompare(b.lastName)
      return sortDirection === 'asc' ? compareResult : -compareResult
    })

  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const handleDeletePatient = () => {
    if (deletePatientId) {
      removePatient(deletePatientId)
      setDeletePatientId(null)
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      })
    }
  }
  
const generatePatientId = (patients: Patient[]): string => {
  const currentYear = new Date().getFullYear()
  
  // Filter patients from current year
  const currentYearPatients = patients.filter(patient => 
    patient.id.startsWith(currentYear.toString())
  )
  
  // If no patients this year, start with 001
  if (currentYearPatients.length === 0) {
    return `${currentYear}-001`
  }
  
  // Find the highest number used this year
  const numbers = currentYearPatients
    .map(patient => parseInt(patient.id.split('-')[1]))
    .sort((a, b) => b - a)
  
  const highestNumber = numbers[0]
  
  // Generate next number
  const nextNumber = highestNumber + 1
  
  // Check if we've reached the limit
  if (nextNumber > 999) {
    throw new Error("Maximum patient IDs for this year reached")
  }
  
  // Format the number with leading zeros
  const formattedNumber = nextNumber.toString().padStart(3, '0')
  
  return `${currentYear}-${formattedNumber}`
}

  const handleSubmitPatient = (e: React.FormEvent) => {
  e.preventDefault()
  
  const validation = validateData(patientSchema, newPatient)
  
  if (!validation.success) {
    toast({
      title: "Error",
      description: validation.errors[0].message,
      variant: "destructive",
    })
    return
  }

  try {
    const patientToAdd: Patient = {
      ...newPatient as Required,
      id: generatePatientId(patients),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addPatient(patientToAdd)
    setIsDialogOpen(false)
    setNewPatient({
      firstName: "",
      lastName: "",
      initials: "",
      dob: "",
      gender: "Male",
      email: "",
      phone: "",
      address: "",
    })
    
    toast({
      title: "Success",
      description: "Patient added successfully",
    })
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to generate patient ID",
      variant: "destructive",
    })
  }
}

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Patients</h1>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search patients..." 
              className="pl-9 w-full sm:max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden space-y-4">
          {filteredPatients.map((patient) => {
            const lastVisit = getLastVisit(patient.id)
            return (
              <div
                key={patient.id}
                className="bg-card rounded-lg border p-4 space-y-3 relative"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {patient.lastName}, {patient.initials} ({patient.firstName})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      #{patient.id}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletePatientId(patient.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p>{formatDate(patient.dob)}</p>
                    <p className="text-muted-foreground">({calculateAge(patient.dob)} years)</p>
                  </div>
                  {lastVisit && (
                    <div>
                      <p className="text-muted-foreground">Last Visit</p>
                      <p>{formatDate(lastVisit)}</p>
                      <p className="text-muted-foreground">
                        ({calculateDaysSinceVisit(lastVisit)} days ago)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Patient Name
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={toggleSort}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const lastVisit = getLastVisit(patient.id)
                return (
                  <TableRow
                    key={patient.id}
                    className="group"
                  >
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      {patient.lastName}, {patient.initials} ({patient.firstName})
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <div className="space-y-1">
                        <div>{formatDate(patient.dob)}</div>
                        <div className="text-sm text-muted-foreground">
                          {calculateAge(patient.dob)} years
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      {patient.gender}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      #{patient.id}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      {lastVisit && (
                        <div className="space-y-1">
                          <div>{formatDate(lastVisit)}</div>
                          <div className="text-sm text-muted-foreground">
                            {calculateDaysSinceVisit(lastVisit)} days ago
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={() => setDeletePatientId(patient.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
              size="icon"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitPatient} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={newPatient.lastName}
                  onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initials</label>
                  <Input
                    value={newPatient.initials}
                    onChange={(e) => setNewPatient({ ...newPatient, initials: e.target.value })}
                    placeholder="E.g., J.R."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={newPatient.firstName}
                    onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input
                  type="date"
                  value={newPatient.dob}
                  onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <Select
                  value={newPatient.gender}
                  onValueChange={(value) => setNewPatient({ ...newPatient, gender: value as Patient['gender'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Enter full address"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deletePatientId !== null} onOpenChange={() => setDeletePatientId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the patient and all associated records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletePatientId(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePatient}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}