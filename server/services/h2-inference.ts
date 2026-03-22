/**
 * H2-Inference API Integration Service
 * Communicates with the Python PINN API for physics validation
 */

interface PredictionRequest {
  time: number
  position: number
}

interface PredictionResponse {
  pressure: number
  velocity: number
  temperature: number
  time: number
  position: number
  timestamp: string
}

interface ValidationResult {
  isPhysicallyCoherent: boolean
  credibilityScore: number
  anomalies: string[]
  predictions: PredictionResponse[]
}

const H2_API_URL = process.env.H2_INFERENCE_API_URL || 'http://localhost:8000'

/**
 * Initialize the PINN model
 */
export async function initializePINNModel(layers: number[] = [2, 64, 64, 64, 3]) {
  try {
    const response = await fetch(`${H2_API_URL}/model/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layers }),
    })

    if (!response.ok) {
      throw new Error(`Failed to initialize model: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('PINN initialization error:', error)
    throw error
  }
}

/**
 * Train the PINN model
 */
export async function trainPINNModel(options: {
  N_pde?: number
  N_ic?: number
  N_bc?: number
  epochs?: number
  learning_rate?: number
  model_name?: string
}) {
  try {
    const response = await fetch(`${H2_API_URL}/model/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        N_pde: options.N_pde || 5000,
        N_ic: options.N_ic || 500,
        N_bc: options.N_bc || 500,
        epochs: options.epochs || 5000,
        learning_rate: options.learning_rate || 0.001,
        model_name: options.model_name || 'hydrogen_pinn_v1',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to train model: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('PINN training error:', error)
    throw error
  }
}

/**
 * Make predictions using the PINN model
 */
export async function predictWithPINN(
  predictions: PredictionRequest[]
): Promise<PredictionResponse[]> {
  try {
    const response = await fetch(`${H2_API_URL}/predict/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch: predictions }),
    })

    if (!response.ok) {
      throw new Error(`Failed to make predictions: ${response.statusText}`)
    }

    const result = await response.json()
    return result.predictions
  } catch (error) {
    console.error('PINN prediction error:', error)
    throw error
  }
}

/**
 * Validate extracted physical data against PINN predictions
 */
export async function validatePhysicsWithPINN(
  extractedData: Record<string, number>
): Promise<ValidationResult> {
  try {
    // Generate test points for validation
    const testPoints: PredictionRequest[] = [
      { time: 0.0, position: 0.0 },
      { time: 2.5, position: 0.25 },
      { time: 5.0, position: 0.5 },
      { time: 7.5, position: 0.75 },
      { time: 10.0, position: 1.0 },
    ]

    // Get PINN predictions
    const predictions = await predictWithPINN(testPoints)

    // Validate extracted data against predictions
    const anomalies: string[] = []
    let credibilityScore = 100

    if (extractedData.pressure !== undefined) {
      const avgPredictedPressure =
        predictions.reduce((sum, p) => sum + p.pressure, 0) / predictions.length

      const pressureDiff = Math.abs(extractedData.pressure - avgPredictedPressure)
      const pressureDeviation = (pressureDiff / avgPredictedPressure) * 100

      if (pressureDeviation > 20) {
        anomalies.push(
          `Pressure deviation: ${pressureDeviation.toFixed(1)}% (extracted: ${extractedData.pressure} Pa, predicted: ${avgPredictedPressure.toFixed(0)} Pa)`
        )
        credibilityScore -= 15
      }
    }

    if (extractedData.temperature !== undefined) {
      const avgPredictedTemp =
        predictions.reduce((sum, p) => sum + p.temperature, 0) / predictions.length

      const tempDiff = Math.abs(extractedData.temperature - avgPredictedTemp)
      const tempDeviation = (tempDiff / avgPredictedTemp) * 100

      if (tempDeviation > 10) {
        anomalies.push(
          `Temperature deviation: ${tempDeviation.toFixed(1)}% (extracted: ${extractedData.temperature} K, predicted: ${avgPredictedTemp.toFixed(1)} K)`
        )
        credibilityScore -= 10
      }
    }

    if (extractedData.velocity !== undefined) {
      const avgPredictedVelocity =
        predictions.reduce((sum, p) => sum + p.velocity, 0) / predictions.length

      const velDiff = Math.abs(extractedData.velocity - avgPredictedVelocity)
      const velDeviation = (velDiff / (avgPredictedVelocity || 1)) * 100

      if (velDeviation > 25) {
        anomalies.push(
          `Velocity deviation: ${velDeviation.toFixed(1)}% (extracted: ${extractedData.velocity} m/s, predicted: ${avgPredictedVelocity.toFixed(1)} m/s)`
        )
        credibilityScore -= 12
      }
    }

    credibilityScore = Math.max(0, Math.min(100, credibilityScore))

    return {
      isPhysicallyCoherent: anomalies.length === 0 && credibilityScore > 70,
      credibilityScore,
      anomalies,
      predictions,
    }
  } catch (error) {
    console.error('Physics validation error:', error)
    return {
      isPhysicallyCoherent: false,
      credibilityScore: 0,
      anomalies: [`Validation error: ${error}`],
      predictions: [],
    }
  }
}

/**
 * Get model status
 */
export async function getModelStatus() {
  try {
    const response = await fetch(`${H2_API_URL}/model/status`)

    if (!response.ok) {
      throw new Error(`Failed to get model status: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting model status:', error)
    throw error
  }
}
