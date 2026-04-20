import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

// Mock the components that fetch data
vi.mock('../components/AttendeeDashboard', () => ({
  default: () => <div data-testid="attendee-dash">Attendee Dashboard</div>
}))
vi.mock('../components/StaffDashboard', () => ({
  default: () => <div data-testid="staff-dash">Staff Dashboard</div>
}))
vi.mock('../components/SignageDashboard', () => ({
  default: () => <div data-testid="signage-dash">Signage Dashboard</div>
}))

describe('SmartVenue Home Page', () => {
  it('renders the main title', () => {
    render(<Home />)
    expect(screen.getByText(/SmartVenue OS/i)).toBeInTheDocument()
  })

  it('renders the attendee dashboard by default', () => {
    render(<Home />)
    expect(screen.getByTestId('attendee-dash')).toBeInTheDocument()
  })

  it('shows mode toggle buttons', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /Attendee/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Staff/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Signage/i })).toBeInTheDocument()
  })
})
