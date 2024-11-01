import { useParams, useNavigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { useMedicalRecords } from '@/hooks/useStorage'

export default function MedicalRecordDetail() {
  const { patientId = '', recordId = '' } = useParams()
  const navigate = useNavigate()
  const { records } = useMedicalRecords(patientId)
  const record = records?.find(r => r.id === recordId)

  if (!record) {
    return (
      <MainLayout>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Record not found</h1>
        </div>
      </MainLayout>
    )
  }

  const {
    medications = [],
    aftercare = [],
    treatmentPoints = [],
    images = []
  } = record

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/patients/${patientId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Medical Record</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">
                    {record.date ? format(new Date(record.date), "dd MMM yyyy") : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">{record.type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="text-sm font-medium">{record.provider || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clinical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Complaint</p>
                <p className="text-sm">{record.complaint || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagnosis</p>
                <p className="text-sm">{record.diagnosis || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Treatment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Clinical Notes</p>
                <p className="text-sm">{record.notes || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Treatment Provided</p>
                <p className="text-sm">{record.treatment || 'N/A'}</p>
              </div>

              {medications.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Medications Used</p>
                  <div className="space-y-4">
                    {medications.map((medication, index) => (
                      <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Product Name</p>
                          <p className="text-sm">{medication.productName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Generic Name</p>
                          <p className="text-sm">{medication.genericName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Dosage</p>
                          <p className="text-sm">{medication.dosage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Batch Number</p>
                          <p className="text-sm">{medication.batch}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aftercare.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Aftercare Instructions</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {aftercare.map((instruction, index) => (
                      <li key={index} className="text-sm">{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}

              {record.followUpDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Follow-up Date</p>
                  <p className="text-sm">
                    {format(new Date(record.followUpDate), "dd MMM yyyy")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {treatmentPoints.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Treatment Mapping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-8 items-start">
                  <div className="relative w-[300px] h-[400px] bg-background rounded-lg border">
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

                    {treatmentPoints.map((point, index) => (
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
                          Point {index + 1}: {point.units} units
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 p-4 bg-muted/10 rounded-lg">
                    <p className="text-sm font-medium mb-4">Treatment Areas</p>
                    <div className="space-y-3">
                      {treatmentPoints.map((point, index) => (
                        <div key={point.id} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-sm">
                            Point {index + 1}: {point.units} units
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {images.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Treatment Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="space-y-2">
                      <p className="text-sm font-medium">{image.type}</p>
                      <div className="aspect-video bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  )
}