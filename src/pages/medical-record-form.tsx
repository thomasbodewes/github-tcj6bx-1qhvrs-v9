import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useMedicalRecords } from '@/hooks/useStorage'
import { MedicalRecord, TreatmentPoint } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { v4 as uuidv4 } from 'uuid'

const recordTypes = [
  "Consultation",
  "Treatment",
  "Follow-up Treatment"
]

const productNames = [
  "Bocouture® (Merz)",
  "Botox® (Allergan)"
]

const defaultAftercare = [
  "Avoid touching/massaging treated areas (2-3 hours)",
  "Stay upright (2-4 hours)",
  "Avoid strenuous exercise (24 hours)"
]

export default function MedicalRecordForm() {
  const { patientId = '' } = useParams()
  const navigate = useNavigate()
  const { addRecord } = useMedicalRecords(patientId)
  const { toast } = useToast()
  const [treatmentPoints, setTreatmentPoints] = useState<TreatmentPoint[]>([])
  const [selectedAftercare, setSelectedAftercare] = useState<string[]>([])
  const [formData, setFormData] = useState({
    date: '',
    type: '',
    provider: 'Dr. T.C.F. Bodewes',
    complaint: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    followUpDate: '',
    medication: {
      productName: '',
      genericName: 'Botulinum Toxin Type A',
      totalDosage: '',
      batch: '',
      expiryDate: ''
    }
  })

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const newPoint: TreatmentPoint = {
      id: uuidv4(),
      area: `Point ${treatmentPoints.length + 1}`,
      units: 1,
      coordinates: { x, y }
    }

    setTreatmentPoints([...treatmentPoints, newPoint])
  }

  const handleUnitChange = (id: string, units: string) => {
    const parsedUnits = parseInt(units)
    if (parsedUnits >= 1 && parsedUnits <= 12) {
      setTreatmentPoints(points =>
        points.map(point =>
          point.id === id ? { ...point, units: parsedUnits } : point
        )
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newRecord: MedicalRecord = {
      id: uuidv4(),
      patientId,
      date: formData.date,
      type: formData.type,
      provider: formData.provider,
      complaint: formData.complaint,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      notes: formData.notes,
      followUpDate: formData.followUpDate,
      medications: [{
        id: uuidv4(),
        productName: formData.medication.productName,
        genericName: formData.medication.genericName,
        dosage: formData.medication.totalDosage,
        batch: formData.medication.batch,
        expiryDate: formData.medication.expiryDate
      }],
      aftercare: selectedAftercare,
      images: [],
      treatmentPoints,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addRecord(newRecord)
    toast({
      title: "Success",
      description: "Medical record saved successfully",
    })
    navigate(`/patients/${patientId}`)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">New Medical Record</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Record Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="complaint">Chief Complaint</Label>
                <Textarea
                  id="complaint"
                  placeholder="Patient's main concern"
                  value={formData.complaint}
                  onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Clinical diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Detailed clinical notes"
                  className="min-h-[100px]"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment Provided</Label>
                <Textarea
                  id="treatment"
                  placeholder="Treatment details"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label className="mb-2 block">Medications Used</Label>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Select
                          value={formData.medication.productName}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            medication: { ...formData.medication, productName: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {productNames.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="genericName">Generic Name</Label>
                        <Input
                          id="genericName"
                          value={formData.medication.genericName}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalDosage">Total Dosage</Label>
                        <Input
                          id="totalDosage"
                          placeholder="e.g., 35 units total"
                          value={formData.medication.totalDosage}
                          onChange={(e) => setFormData({
                            ...formData,
                            medication: { ...formData.medication, totalDosage: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batch">Batch Number</Label>
                        <Input
                          id="batch"
                          placeholder="e.g., BTX-2023-456"
                          value={formData.medication.batch}
                          onChange={(e) => setFormData({
                            ...formData,
                            medication: { ...formData.medication, batch: e.target.value }
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>Aftercare Instructions</Label>
                <div className="space-y-2">
                  {defaultAftercare.map((instruction) => (
                    <div key={instruction} className="flex items-center space-x-2">
                      <Checkbox
                        id={instruction}
                        checked={selectedAftercare.includes(instruction)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAftercare([...selectedAftercare, instruction])
                          } else {
                            setSelectedAftercare(selectedAftercare.filter(i => i !== instruction))
                          }
                        }}
                      />
                      <label
                        htmlFor={instruction}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {instruction}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="followUp">Follow-up Date</Label>
                <Input
                  id="followUp"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatment Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div 
                  className="relative w-full md:w-[300px] h-[400px] bg-background rounded-lg border flex-shrink-0 cursor-crosshair"
                  onClick={handleImageClick}
                >
                  <svg
                    viewBox="0 0 100 133"
                    className="absolute inset-0 w-full h-full p-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  >
                    {/* Head outline */}
                    <path d="M50 8 C25 8 20 30 20 45 C20 65 35 90 50 95 C65 90 80 65 80 45 C80 30 75 8 50 8" />
                    {/* Jaw line */}
                    <path d="M30 75 C40 95 60 95 70 75" />
                    {/* Nose */}
                    <path d="M47 45 L47 60 C47 63 53 63 53 60 L53 45" />
                    {/* Eyes */}
                    <path d="M35 40 C35 37 40 37 40 40 C40 43 35 43 35 40" />
                    <path d="M60 40 C60 37 65 37 65 40 C65 43 60 43 60 40" />
                    {/* Eyebrows */}
                    <path d="M32 35 C35 33 40 33 43 35" />
                    <path d="M57 35 C60 33 65 33 68 35" />
                    {/* Mouth */}
                    <path d="M45 70 C50 73 55 70 55 70" />
                  </svg>

                  {treatmentPoints.map((point) => (
                    <div
                      key={point.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group"
                      style={{
                        left: `${point.coordinates.x}%`,
                        top: `${point.coordinates.y}%`
                      }}
                    >
                      <div 
                        className="rounded-full bg-primary"
                        style={{
                          width: `${4 + (point.units * 2)}px`,
                          height: `${4 + (point.units * 2)}px`
                        }}
                      />
                      <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 -top-8 bg-popover text-popover-foreground text-xs rounded px-2 py-1 whitespace-nowrap shadow-md">
                        {point.area}: {point.units} units
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex-1 space-y-4">
                  {treatmentPoints.map((point, index) => (
                    <div key={point.id} className="flex items-center gap-4">
                      <div className="w-20">
                        <Label>Point {index + 1}</Label>
                      </div>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={point.units}
                        onChange={(e) => handleUnitChange(point.id, e.target.value)}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">units</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Treatment Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Before Treatment</Label>
                  <Input type="file" accept="image/*" />
                </div>
                <div className="space-y-2">
                  <Label>After Treatment</Label>
                  <Input type="file" accept="image/*" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/patients/${patientId}`)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}