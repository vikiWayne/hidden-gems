import { ValidationError } from '../lib/errors.js'

type AnyRecord = Record<string, unknown>

export function asRecord(value: unknown, field: string): AnyRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${field} must be an object`)
  }
  return value as AnyRecord
}

export function readString(
  source: AnyRecord,
  key: string,
  options?: { required?: boolean; min?: number; max?: number }
): string | undefined {
  const raw = source[key]
  if (raw == null || raw === '') {
    if (options?.required) throw new ValidationError(`${key} is required`)
    return undefined
  }
  if (typeof raw !== 'string') throw new ValidationError(`${key} must be a string`)
  const value = raw.trim()
  if (options?.min != null && value.length < options.min) throw new ValidationError(`${key} is too short`)
  if (options?.max != null && value.length > options.max) throw new ValidationError(`${key} is too long`)
  return value
}

export function readNumber(
  source: AnyRecord,
  key: string,
  options?: { required?: boolean; min?: number; max?: number }
): number | undefined {
  const raw = source[key]
  if (raw == null || raw === '') {
    if (options?.required) throw new ValidationError(`${key} is required`)
    return undefined
  }
  const value = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(value)) throw new ValidationError(`${key} must be a number`)
  if (options?.min != null && value < options.min) throw new ValidationError(`${key} must be >= ${options.min}`)
  if (options?.max != null && value > options.max) throw new ValidationError(`${key} must be <= ${options.max}`)
  return value
}

export function readEnum<T extends string>(source: AnyRecord, key: string, allowed: readonly T[], fallback?: T): T {
  const raw = source[key]
  if (typeof raw === 'string' && (allowed as readonly string[]).includes(raw)) {
    return raw as T
  }
  if (fallback != null) return fallback
  throw new ValidationError(`${key} must be one of: ${allowed.join(', ')}`)
}

export function readStringArray(source: AnyRecord, key: string): string[] {
  const raw = source[key]
  if (raw == null) return []
  if (!Array.isArray(raw)) throw new ValidationError(`${key} must be an array`)
  const values = raw.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
  return values
}

export function readCoordinates(
  source: AnyRecord,
  latKey: string,
  lngKey: string
): { lat: number; lng: number } {
  const lat = readNumber(source, latKey, { required: true, min: -90, max: 90 }) as number
  const lng = readNumber(source, lngKey, { required: true, min: -180, max: 180 }) as number
  return { lat, lng }
}
