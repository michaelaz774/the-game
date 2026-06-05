// qr.ts — QR code generation helper using the `qrcode` package.
import QRCode from 'qrcode'

/**
 * Generates a QR code for the given text and returns it as a data: URL
 * (PNG, base64 encoded) ready for use in an <img> src attribute.
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    margin: 2,
    width: 256,
    color: {
      dark: '#0046ad', // RBC blue modules
      light: '#f5f7fb', // --ink background
    },
  })
}
