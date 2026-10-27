/**
 * HackerRank skill certificates, all verified on hackerrank.com
 * (PDFs in E:\Ryan R\Desktop\Zertifikare). The SQL certificate is left out on
 * purpose: the name on it is wrong.
 * `techId` links a certificate to a technology in stack.ts.
 */
export interface Certificate {
  id: string
  name: string
  techId?: string
  url: string
  /** Picture of the certificate in public/certificates (rendered from the PDF). */
  image?: string
}

/** Date all four were earned (27 Oct 2026). */
export const certificatesEarned = '2026-10-27'

export const certificates: Certificate[] = [
  { id: '7d38c458f9ef', name: 'Problem Solving (Basic)', url: 'https://www.hackerrank.com/certificates/7d38c458f9ef', image: '/certificates/7d38c458f9ef.webp' },
  { id: '857eee6a3dec', name: 'Python (Basic)', techId: 'python', url: 'https://www.hackerrank.com/certificates/857eee6a3dec', image: '/certificates/857eee6a3dec.webp' },
  { id: 'f279e89e2cb4', name: 'JavaScript (Basic)', techId: 'javascript', url: 'https://www.hackerrank.com/certificates/f279e89e2cb4', image: '/certificates/f279e89e2cb4.webp' },
  { id: '4429843e4f83', name: 'CSS (Basic)', techId: 'css', url: 'https://www.hackerrank.com/certificates/4429843e4f83', image: '/certificates/4429843e4f83.webp' },
]

/** Certificates with a picture, shown as images in the stack section. */
export const certificateImages = certificates.filter((c): c is Certificate & { image: string } => Boolean(c.image))

export const certificateFor = (techId: string) => certificates.find((c) => c.techId === techId)
