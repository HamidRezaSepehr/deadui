import { NextResponse } from 'next/server'

interface ValidateLicenseBody {
  key?: unknown
}

function readValidKeys(): string[] {
  return (process.env.VALID_LICENSE_KEYS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

export async function POST(request: Request) {
  try {
    let body: ValidateLicenseBody
    try {
      body = (await request.json()) as ValidateLicenseBody
    } catch {
      return NextResponse.json(
        { valid: false, message: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { key } = body

    if (typeof key !== 'string' || key.trim().length === 0) {
      return NextResponse.json(
        { valid: false, message: 'No key provided' },
        { status: 400 }
      )
    }

    const validKeys = readValidKeys()

    if (validKeys.includes(key.trim())) {
      return NextResponse.json({ valid: true, message: 'License validated' })
    }

    return NextResponse.json(
      { valid: false, message: 'Invalid license key' },
      { status: 403 }
    )
  } catch {
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 })
  }
}