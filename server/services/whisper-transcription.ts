/**
 * Whisper Transcription Service
 * Transcribes audio from video files using OpenAI Whisper API
 */

import fs from 'fs'
import path from 'path'
import FormData from 'form-data'

interface TranscriptionResult {
  success: boolean
  transcription: string
  language: string
  duration: number
  confidence?: number
}

/**
 * Transcribe audio from a video file using Whisper API
 */
export async function transcribeVideo(
  videoPath: string,
  language: string = 'fr'
): Promise<TranscriptionResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`)
    }

    // Get file size
    const stats = fs.statSync(videoPath)
    const fileSizeInMB = stats.size / (1024 * 1024)

    // Whisper API has a 25MB limit
    if (fileSizeInMB > 25) {
      throw new Error(
        `File size (${fileSizeInMB.toFixed(1)}MB) exceeds Whisper API limit (25MB)`
      )
    }

    // Create form data
    const form = new FormData()
    form.append('file', fs.createReadStream(videoPath))
    form.append('model', 'whisper-1')
    form.append('language', language)
    form.append('response_format', 'verbose_json')

    // Call Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Whisper API error: ${error.error?.message || response.statusText}`)
    }

    const result = await response.json()

    return {
      success: true,
      transcription: result.text,
      language: result.language || language,
      duration: result.duration || 0,
      confidence: result.confidence,
    }
  } catch (error) {
    console.error('Transcription error:', error)
    return {
      success: false,
      transcription: '',
      language: language,
      duration: 0,
    }
  }
}

/**
 * Transcribe audio from a URL
 */
export async function transcribeFromUrl(
  audioUrl: string,
  language: string = 'fr'
): Promise<TranscriptionResult> {
  try {
    // Download audio from URL
    const response = await fetch(audioUrl)
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()

    // Create temporary file
    const tempDir = '/tmp'
    const tempFile = path.join(tempDir, `audio_${Date.now()}.mp3`)
    fs.writeFileSync(tempFile, Buffer.from(buffer))

    // Transcribe
    const result = await transcribeVideo(tempFile, language)

    // Clean up
    fs.unlinkSync(tempFile)

    return result
  } catch (error) {
    console.error('URL transcription error:', error)
    return {
      success: false,
      transcription: '',
      language: language,
      duration: 0,
    }
  }
}

/**
 * Extract audio from video file and transcribe
 * Requires ffmpeg to be installed
 */
export async function extractAndTranscribeVideo(
  videoPath: string,
  language: string = 'fr'
): Promise<TranscriptionResult> {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    // Extract audio using ffmpeg
    const audioPath = videoPath.replace(/\.[^.]+$/, '_audio.mp3')

    await execAsync(
      `ffmpeg -i "${videoPath}" -q:a 9 -n "${audioPath}" 2>/dev/null || true`
    )

    // Transcribe extracted audio
    const result = await transcribeVideo(audioPath, language)

    // Clean up
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath)
    }

    return result
  } catch (error) {
    console.error('Extract and transcribe error:', error)
    // Fallback: try to transcribe video directly
    return transcribeVideo(videoPath, language)
  }
}

/**
 * Batch transcribe multiple files
 */
export async function batchTranscribe(
  filePaths: string[],
  language: string = 'fr'
): Promise<TranscriptionResult[]> {
  const results: TranscriptionResult[] = []

  for (const filePath of filePaths) {
    const result = await transcribeVideo(filePath, language)
    results.push(result)

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return results
}

/**
 * Store transcription in database
 */
export async function storeTranscription(
  projectId: string,
  transcription: string,
  language: string,
  duration: number
) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()

  const { error } = await supabase
    .from('projects')
    .update({
      transcription,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) {
    throw error
  }

  // Also create an analysis record
  const { data, error: analysisError } = await supabase
    .from('analyses')
    .insert({
      project_id: projectId,
      name: `Transcription - ${new Date().toLocaleString('fr-FR')}`,
      status: 'completed',
      analysis_type: 'transcription',
      transcription,
      results: {
        language,
        duration,
        timestamp: new Date().toISOString(),
      },
    })
    .select()
    .single()

  if (analysisError) {
    throw analysisError
  }

  return data
}
