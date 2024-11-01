import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/layout/main-layout"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usePatients, useAppointments } from "@/hooks/useStorage"
import { startOfMonth, endOfMonth, eachMonthOfInterval, format, subMonths, isPast } from 'date-fns'
import { Activity, UserCircle2, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()
  const { patients } = usePatients()
  const { appointments } = useAppointments()

  // Calculate monthly patient growth
  const lastSixMonths = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  })

  const monthlyData = lastSixMonths.map(month => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    
    const patientsInMonth = patients.filter(patient => {
      const createdAt = new Date(patient.createdAt)
      return createdAt >= monthStart && createdAt <= monthEnd
    }).length

    return {
      name: format(month, 'MMM'),
      patients: patientsInMonth
    }
  })

  // Calculate total patients
  const totalPatients = patients.length

  // Calculate total upcoming appointments
  const upcomingAppointments = appointments.filter(appointment => 
    !isPast(new Date(appointment.start))
  ).length

  // Calculate percentage changes
  const currentMonthPatients = monthlyData[monthlyData.length - 1].patients
  const lastMonthPatients = monthlyData[monthlyData.length - 2].patients
  const patientGrowth = lastMonthPatients 
    ? ((currentMonthPatients - lastMonthPatients) / lastMonthPatients) * 100 
    : 0

  const currentMonthAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.start)
    return appointmentDate >= startOfMonth(new Date()) && 
           appointmentDate <= endOfMonth(new Date())
  }).length

  const lastMonthAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.start)
    const lastMonth = subMonths(new Date(), 1)
    return appointmentDate >= startOfMonth(lastMonth) && 
           appointmentDate <= endOfMonth(lastMonth)
  }).length

  const appointmentGrowth = lastMonthAppointments 
    ? ((currentMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100 
    : 0

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Company Branding Section */}
        <div className="flex items-center justify-between pb-6 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MedVault Analytics</h1>
              <p className="text-sm text-muted-foreground">Patient Management Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground">
            <UserCircle2 className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card 
            className="group cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => navigate('/patients')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                {patientGrowth > 0 ? '+' : ''}{patientGrowth.toFixed(2)}% from last month
              </p>
            </CardContent>
          </Card>
          <Card 
            className="group cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => navigate('/appointments')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {appointmentGrowth > 0 ? '+' : ''}{appointmentGrowth.toFixed(2)}% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Patient Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="patients" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}