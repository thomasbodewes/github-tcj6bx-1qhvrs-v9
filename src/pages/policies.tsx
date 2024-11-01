import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Policies() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Policies</h1>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              MedVault is committed to protecting your privacy and handling your personal and medical information with care. This policy outlines how we collect, use, and protect your data.
            </p>
            
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              MedVault's Terms of Service outline your rights, responsibilities, and our policies to ensure a secure and transparent experience on our website.
            </p>
            
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              MedVault implements various security measures to protect your personal data and ensures compliance.
            </p>
            
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}