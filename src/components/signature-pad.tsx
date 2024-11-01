import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from './ui/button'

interface SignaturePadProps {
  onSave: (signature: string) => void
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const signaturePad = useRef<SignatureCanvas>(null)

  useEffect(() => {
    // Ensure the canvas is properly sized
    const resize = () => {
      if (signaturePad.current) {
        const canvas = signaturePad.current.getCanvas()
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        canvas.width = canvas.offsetWidth * ratio
        canvas.height = canvas.offsetHeight * ratio
        canvas.getContext("2d")?.scale(ratio, ratio)
        signaturePad.current.clear()
      }
    }

    window.addEventListener("resize", resize)
    resize()

    return () => window.removeEventListener("resize", resize)
  }, [])

  const handleClear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear()
    }
  }

  const handleSave = () => {
    if (signaturePad.current) {
      const dataUrl = signaturePad.current.toDataURL()
      onSave(dataUrl)
    }
  }

  return (
    <div className="space-y-2">
      <div className="border rounded-md bg-background">
        <SignatureCanvas
          ref={signaturePad}
          canvasProps={{
            className: "w-full h-32",
          }}
          backgroundColor="transparent"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          Clear
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          Save Signature
        </Button>
      </div>
    </div>
  )
}