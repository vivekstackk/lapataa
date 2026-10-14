import Sidebar from '@/components/sidebar'
import MobileNav from '@/components/mobile-nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
