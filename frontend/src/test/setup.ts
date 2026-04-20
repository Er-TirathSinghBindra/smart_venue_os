import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock the global fetch
global.fetch = vi.fn()

// Mock ResizeObserver for older environments
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))
