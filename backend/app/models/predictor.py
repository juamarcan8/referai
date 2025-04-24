import os
import pickle
import numpy as np
from typing import Any, List

def load_models(model_dir: str) -> list[Any]:
    """Carga todos los modelos .pkl de una carpeta."""
    models = []
    for file in os.listdir(model_dir):
        if file.endswith(".pkl"):
            path = os.path.join(model_dir, file)
            with open(path, "rb") as f:
                models.append(pickle.load(f))
    return models

# Cargamos los modelos una sola vez al arrancar
FOUL_MODELS = load_models(os.path.join(os.path.dirname(__file__), "foul"))
SEVERITY_MODELS = load_models(os.path.join(os.path.dirname(__file__), "severity"))

def extract_features(video_path: str) -> np.ndarray:
    """
    Extrae features del video. 
    Aquí deberás usar tu propio sistema de extracción.
    Por ahora lo simulamos con valores aleatorios.
    """
    return np.random.rand(10) 

def predict(video_path: str) -> dict:
    features = extract_features(video_path).reshape(1, -1)

    # Foul prediction
    foul_preds: List[int] = [model.predict(features)[0] for model in FOUL_MODELS]

    total_foul_preds = len(foul_preds)
    foul_pct = (foul_preds.count(1)/total_foul_preds) * 100
    no_foul_pct = (foul_preds.count(0)/total_foul_preds) * 100

    # Severity prediction
    severity_preds = [model.predict(features)[0] for model in SEVERITY_MODELS]

    total_severity_preds = len(severity_preds)
    no_card_pct = (severity_preds.count(0)/total_severity_preds) * 100
    red_card_pct = (severity_preds.count(1)/total_severity_preds) * 100
    yellow_card_pct = (severity_preds.count(2)/total_severity_preds) * 100

    return {
        "is_foul": foul_pct > no_foul_pct,
        "foul_confidence": foul_pct,
        "no_foul_confidence": no_foul_pct,
        
        "severity": {
            "no_card": no_card_pct,
            "red_card": red_card_pct,
            "yellow_card": yellow_card_pct
        }
    }
