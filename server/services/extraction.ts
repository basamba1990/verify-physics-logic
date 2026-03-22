/**
 * AI Data Extraction Service
 * Extracts physical parameters from transcriptions using GPT-4o
 */

import { createClient } from '@/lib/supabase/server'

interface ExtractedData {
  pressure?: number
  temperature?: number
  velocity?: number
  efficiency?: number
  power?: number
  [key: string]: number | undefined
}

interface ExtractionResult {
  success: boolean
  data: ExtractedData
  confidence: number
  rawText?: string
}

/**
 * Extract physical parameters from transcription text
 */
export async function extractPhysicalParameters(
  transcription: string
): Promise<ExtractionResult> {
  try {
    // Call OpenAI API for data extraction
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a physics data extraction expert. Extract physical parameters from the given text.
Return a JSON object with extracted values in SI units:
- pressure (Pa)
- temperature (K)
- velocity (m/s)
- efficiency (%)
- power (W)
Include only parameters mentioned in the text. Return null for missing values.`,
          },
          {
            role: 'user',
            content: `Extract physical parameters from this text:\n\n${transcription}`,
          },
        ],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const result = await response.json()
    const content = result.choices[0].message.content

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response')
    }

    const extractedData = JSON.parse(jsonMatch[0])

    return {
      success: true,
      data: extractedData,
      confidence: 0.85,
      rawText: content,
    }
  } catch (error) {
    console.error('Extraction error:', error)
    return {
      success: false,
      data: {},
      confidence: 0,
    }
  }
}

/**
 * Validate extracted data against physical constraints
 */
export function validatePhysicalData(data: ExtractedData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (data.pressure !== undefined) {
    if (data.pressure < 1e5 || data.pressure > 700e5) {
      errors.push(
        `Pressure ${data.pressure} Pa is outside valid range (1e5 - 700e5 Pa)`
      )
    }
  }

  if (data.temperature !== undefined) {
    if (data.temperature < 250 || data.temperature > 350) {
      errors.push(
        `Temperature ${data.temperature} K is outside valid range (250 - 350 K)`
      )
    }
  }

  if (data.velocity !== undefined) {
    if (data.velocity < 0 || data.velocity > 500) {
      errors.push(`Velocity ${data.velocity} m/s is outside valid range (0 - 500 m/s)`)
    }
  }

  if (data.efficiency !== undefined) {
    if (data.efficiency < 0 || data.efficiency > 100) {
      errors.push(`Efficiency ${data.efficiency}% is outside valid range (0 - 100%)`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Store extraction results in database
 */
export async function storeExtractionResults(
  projectId: string,
  analysisId: string,
  extractedData: ExtractedData,
  confidence: number
) {
  const supabase = createClient()

  const { error } = await supabase.from('physics_validations').insert({
    project_id: projectId,
    analysis_id: analysisId,
    extracted_data: extractedData,
    credibility_score: confidence * 100,
  })

  if (error) {
    throw error
  }
}
