import { NextResponse } from 'next/server'

const FIREBASE_URL = 'https://road-accident-prevention-default-rtdb.firebaseio.com'

export async function GET() {
  try {
    // Fetch all data from Firebase
    const response = await fetch(`${FIREBASE_URL}/.json`)
    
    if (!response.ok) {
      throw new Error(`Firebase error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json(data || {})
  } catch (error) {
    console.error("Firebase fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const data = await req.json()
    
    console.log("Received:", data)
    
    // Send data to Firebase
    const response = await fetch(`${FIREBASE_URL}/.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Firebase error: ${response.status}`)
    }
    
    const result = await response.json()
    return NextResponse.json({ message: "Stored in Firebase", data: result })
  } catch (error) {
    console.error("Firebase post error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}