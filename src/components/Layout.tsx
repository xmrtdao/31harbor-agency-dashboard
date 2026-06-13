import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import TopBar from './TopBar';
import Footer from './Footer';
import { useDashboardStore } from '@/store/dashboardStore';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarCollapsed } = useDashboardStore();

  return (
    <div className="min-h-[100dvh] bg-bg-darkest flex">
      {/* Sidebar */}
      <Navbar />

      {/* Main Content */}
      <motion.div
        initial={{ marginLeft: 260 }}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="flex-1 flex flex-col min-w-0"
      >
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        <Footer />
      </motion.div>
    </div>
  );
}
