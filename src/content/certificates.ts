/**
 * HackerRank skill certificates, all verified on hackerrank.com
 * (PDFs in E:\Ryan R\Desktop\Zertifikare; SQL only online).
 * `techId` links a certificate to a technology in stack.ts.
 */
export interface Certificate {
  id: string
  name: string
  techId?: string
  url: string
}

/** Date all five were earned (27 Oct 2026). */
export const certificatesEarned = '2026-10-27'

export const certificates: Certificate[] = [
  { id: '7d38c458f9ef', name: 'Problem Solving (Basic)', url: 'https://www.hackerrank.com/certificates/7d38c458f9ef' },
  { id: '12f007586c9c', name: 'SQL (Basic)', techId: 'mysql', url: 'https://www.hackerrank.com/certificates/12f007586c9c' },
  { id: '857eee6a3dec', name: 'Python (Basic)', techId: 'python', url: 'https://www.hackerrank.com/certificates/857eee6a3dec' },
  { id: 'f279e89e2cb4', name: 'JavaScript (Basic)', techId: 'javascript', url: 'https://www.hackerrank.com/certificates/f279e89e2cb4' },
  { id: '4429843e4f83', name: 'CSS (Basic)', techId: 'css', url: 'https://www.hackerrank.com/certificates/4429843e4f83' },
]

export const certificateFor = (techId: string) => certificates.find((c) => c.techId === techId)
