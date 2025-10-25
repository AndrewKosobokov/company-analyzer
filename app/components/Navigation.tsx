'use client'

import Link from 'next/link'

interface NavigationProps {
  currentPage?: 'home' | 'analysis' | 'companies' | 'pricing' | 'login' | 'profile'
  showAuth?: boolean
}

export default function Navigation({ currentPage = 'home', showAuth = true }: NavigationProps) {
  return (
    <nav className="nav">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          Metal Vector
        </Link>
        <div className="nav-links">
          <Link href="/analysis" className="nav-link">
            Analysis
          </Link>
          <Link href="/companies" className="nav-link">
            Companies
          </Link>
          <Link href="/pricing" className="nav-link">
            Pricing
          </Link>
          {showAuth && (
            currentPage === 'profile' ? (
              <Link href="/profile" className="btn btn-primary btn-small">
                Profile
              </Link>
            ) : (
              <Link href="/login" className="btn btn-primary btn-small">
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  )
}

























