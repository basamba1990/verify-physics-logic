"""
FastAPI server for Hydrogen PINN Model
Provides REST endpoints for training and inference
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import torch
import os
from datetime import datetime
from hydrogen_pinn_model import (
    HydrogenPINN,
    train_pinn,
    predict_hydrogen_state,
    generate_training_data,
)

# Initialize FastAPI app
app = FastAPI(
    title="H2-Inference Systems API",
    description="Physics-Informed Neural Network for Hydrogen Storage Analysis",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model storage
models: Dict[str, HydrogenPINN] = {}
current_model: Optional[HydrogenPINN] = None
models_dir = "models"
os.makedirs(models_dir, exist_ok=True)


# Pydantic models
class InitializeRequest(BaseModel):
    layers: List[int] = [2, 64, 64, 64, 3]


class TrainRequest(BaseModel):
    N_pde: int = 5000
    N_ic: int = 500
    N_bc: int = 500
    epochs: int = 5000
    learning_rate: float = 0.001
    model_name: str = "hydrogen_pinn_default"


class LoadRequest(BaseModel):
    model_path: str


class PredictionRequest(BaseModel):
    time: float
    position: float


class BatchPredictionRequest(BaseModel):
    batch: List[PredictionRequest]


class PredictionResponse(BaseModel):
    pressure: float
    velocity: float
    temperature: float
    time: float
    position: float
    timestamp: str


class ModelStatusResponse(BaseModel):
    model_loaded: bool
    model_name: Optional[str]
    device: str
    timestamp: str


# Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.post("/model/initialize")
async def initialize_model(request: InitializeRequest):
    """Initialize a new PINN model"""
    global current_model
    try:
        current_model = HydrogenPINN(layers=request.layers)
        models["default"] = current_model
        return {
            "status": "success",
            "message": "Model initialized",
            "layers": request.layers,
            "device": "cuda" if torch.cuda.is_available() else "cpu",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/model/train")
async def train_model(request: TrainRequest):
    """Train the PINN model"""
    global current_model
    try:
        if current_model is None:
            current_model = HydrogenPINN()

        history = train_pinn(
            current_model,
            epochs=request.epochs,
            learning_rate=request.learning_rate,
            N_pde=request.N_pde,
            N_ic=request.N_ic,
            N_bc=request.N_bc,
        )

        # Save model
        model_path = os.path.join(models_dir, f"{request.model_name}.pt")
        torch.save(current_model.state_dict(), model_path)
        models[request.model_name] = current_model

        return {
            "status": "success",
            "message": "Training completed",
            "model_name": request.model_name,
            "model_path": model_path,
            "final_loss": history["loss"][-1],
            "epochs": request.epochs,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/model/load")
async def load_model(request: LoadRequest):
    """Load a pre-trained model"""
    global current_model
    try:
        if not os.path.exists(request.model_path):
            raise FileNotFoundError(f"Model file not found: {request.model_path}")

        current_model = HydrogenPINN()
        current_model.load_state_dict(torch.load(request.model_path))
        model_name = os.path.basename(request.model_path).replace(".pt", "")
        models[model_name] = current_model

        return {
            "status": "success",
            "message": "Model loaded",
            "model_path": request.model_path,
            "model_name": model_name,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make a single prediction"""
    global current_model
    try:
        if current_model is None:
            raise ValueError("No model loaded. Initialize or load a model first.")

        result = predict_hydrogen_state(current_model, request.time, request.position)
        return PredictionResponse(
            **result,
            timestamp=datetime.utcnow().isoformat(),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch")
async def predict_batch(request: BatchPredictionRequest):
    """Make batch predictions"""
    global current_model
    try:
        if current_model is None:
            raise ValueError("No model loaded. Initialize or load a model first.")

        results = []
        for pred_req in request.batch:
            result = predict_hydrogen_state(
                current_model, pred_req.time, pred_req.position
            )
            results.append(
                PredictionResponse(
                    **result,
                    timestamp=datetime.utcnow().isoformat(),
                ).model_dump()
            )

        return {
            "status": "success",
            "count": len(results),
            "predictions": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/status", response_model=ModelStatusResponse)
async def model_status():
    """Get current model status"""
    global current_model
    return ModelStatusResponse(
        model_loaded=current_model is not None,
        model_name="default" if current_model else None,
        device="cuda" if torch.cuda.is_available() else "cpu",
        timestamp=datetime.utcnow().isoformat(),
    )


@app.get("/models/list")
async def list_models():
    """List all available models"""
    return {
        "status": "success",
        "models": list(models.keys()),
        "current_model": "default" if current_model else None,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
