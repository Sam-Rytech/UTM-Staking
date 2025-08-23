import './globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'UTM Staking DApp',
  description: 'Stake UTM tokens and earn rewards',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
