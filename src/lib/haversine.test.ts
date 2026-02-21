import { describe, it, expect } from 'vitest'
import { haversineDistanceKm } from './haversine'

describe('haversineDistanceKm', () => {
  it('returns 0 for same point', () => {
    expect(haversineDistanceKm(52.52, 13.405, 52.52, 13.405)).toBe(0)
  })

  it('returns positive distance for different points', () => {
    const d = haversineDistanceKm(0, 0, 0, 1)
    expect(d).toBeGreaterThan(0)
    expect(typeof d).toBe('number')
  })

  it('is symmetric', () => {
    expect(haversineDistanceKm(48.8566, 2.3522, 52.52, 13.405)).toBeCloseTo(
      haversineDistanceKm(52.52, 13.405, 48.8566, 2.3522),
      5
    )
  })

  it('Paris to Berlin is roughly 878 km', () => {
    // Paris ~ 48.8566, 2.3522; Berlin ~ 52.52, 13.405
    const d = haversineDistanceKm(48.8566, 2.3522, 52.52, 13.405)
    expect(d).toBeGreaterThan(850)
    expect(d).toBeLessThan(920)
  })

  it('equator 1 degree longitude is roughly 111 km', () => {
    const d = haversineDistanceKm(0, 0, 0, 1)
    expect(d).toBeGreaterThan(105)
    expect(d).toBeLessThan(115)
  })
})
