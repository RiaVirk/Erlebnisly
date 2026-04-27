import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col py-6 px-4 z-50">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-black tracking-tight text-slate-900">Erlebnisly</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Customer</p>
        </div>

        <div className="flex-1 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Overview
          </Link>
          <Link
            href="/bookings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Bookings
          </Link>
          <Link
            href="/experiences"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Experiences
          </Link>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 px-2 flex items-center gap-3">
          <UserButton />
          <span className="text-sm text-slate-500 truncate">My Account</span>
        </div>
      </nav>

      {/* Main */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
