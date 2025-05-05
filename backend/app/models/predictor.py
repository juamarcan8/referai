import os
import pickle
import numpy as np
from typing import Any, List
import torch
import torchvision.models.video as models
import torchvision.transforms as transforms
import cv2
from PIL import Image



device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


#Transformaciones para MVIT
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.45, 0.45, 0.45], std=[0.225, 0.225, 0.225])
])
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

def load_x3d_model():
    model = torch.hub.load('facebookresearch/pytorchvideo', 'x3d_s', pretrained=True)
    model.eval()
    return model

def load_slowfast_model():
    model = torch.hub.load('facebookresearch/pytorchvideo', 'slowfast_r50', pretrained=True)
    model.eval()
    return model

def load_mvit_model():
    model = models.mvit_v2_s(weights=models.MViT_V2_S_Weights.DEFAULT).to(device)
    model.eval()
    return model


def preprocess_video_for_mvit(video_path, start_frame=60, end_frame=80, num_frames=16):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"No se pudo abrir el video: {video_path}")
    
    frames = []
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        raise RuntimeError("El video no contiene frames")
    
    # Ajustar los límites del rango
    start_frame = max(0, min(start_frame, total_frames - 1))
    end_frame = max(start_frame, min(end_frame, total_frames - 1))
    frame_indices = np.linspace(start_frame, end_frame, num_frames, dtype=int)  # Seleccionar 16 frames equidistantes
    
    for i in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frame = Image.fromarray(frame)
        frames.append(transform(frame))
    
    cap.release()
    if len(frames) < num_frames:
        frames += [frames[-1]] * (num_frames - len(frames))  # Rellenar si hay menos de 16 frames
    
    frames_tensor = torch.stack(frames).permute(1, 0, 2, 3).unsqueeze(0).to(device)  # (1, 3, 16, 224, 224)
    return frames_tensor

def preprocess_video_for_x3d(video_path, frame_size=(224, 224), num_frames=32):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Error al abrir el video: {video_path}")
        
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.resize(frame, frame_size)
        frames.append(frame)
        
        if len(frames) >= num_frames:
            break

    cap.release()
    
    if len(frames) == 0:
        raise ValueError(f"No se pudieron extraer frames del video: {video_path}")
    
    while len(frames) < num_frames:
        frames.append(frames[-1])
    
    frames = np.array(frames)
    frames = np.transpose(frames, (0, 3, 1, 2))
    return frames

def preprocess_video_for_slowfast(video_path, frame_size=(224, 224), slow_frames=8, fast_frames=32):
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Error al abrir el video: {video_path}")
    
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.resize(frame, frame_size)
        frames.append(frame)
    
    cap.release()
    
    if len(frames) == 0:
        raise ValueError(f"No se pudieron extraer frames del video: {video_path}")
    
    # Asegurar suficientes frames para ambos flujos
    while len(frames) < fast_frames:
        frames.append(frames[-1])
    
    frames = np.array(frames)
    frames = np.transpose(frames, (0, 3, 1, 2))  # [T, C, H, W]
    
    # Preparar entradas para SlowFast
    slow_idx = np.linspace(0, len(frames) - 1, slow_frames).astype(int)  # Submuestreo para el flujo lento
    fast_idx = np.arange(fast_frames)  # Todos los frames para el flujo rápido
    
    slow_frames_data = frames[slow_idx]  # Frames para el flujo lento
    fast_frames_data = frames[fast_idx]  # Frames para el flujo rápido
    
    return slow_frames_data, fast_frames_data

def extract_features_slowfast(video_path, model):
    slow_frames, fast_frames = preprocess_video_for_slowfast(video_path)  # Extraer frames para ambos flujos
    
    slow_frames = torch.tensor(slow_frames).float() / 255.0  # Normalizar
    fast_frames = torch.tensor(fast_frames).float() / 255.0  # Normalizar
    
    # Ajustar dimensiones: [batch_size, num_channels, num_frames, height, width]
    slow_frames = slow_frames.unsqueeze(0).permute(0, 2, 1, 3, 4)  # [1, C, T_slow, H, W]
    fast_frames = fast_frames.unsqueeze(0).permute(0, 2, 1, 3, 4)  # [1, C, T_fast, H, W]
    
    # SlowFast espera una lista con los dos flujos
    inputs = [slow_frames, fast_frames]
    
    with torch.no_grad():
        features = model(inputs)
    
    return features.cpu().numpy()

def extract_features_mvit(video_path, start_frame, end_frame, model):
    frames = preprocess_video_for_mvit(video_path, start_frame, end_frame)
    #print("Frames tensor shape:", frames.shape)
    with torch.no_grad():
        features = model(frames)
    return features.cpu().numpy()

def extract_features_x3d(video_path, model):
    frames = preprocess_video_for_x3d(video_path)  # Extraer frames del video
    
    frames = torch.tensor(frames).float() / 255.0  # Normalizar los valores de los frames
    frames = frames.unsqueeze(0)  # Agregar dimensión de batch
    frames = frames.permute(0, 2, 1, 3, 4)  # Cambiar el orden de las dimensiones a [batch_size, num_channels, num_frames, height, width]

    with torch.no_grad():
        features = model(frames)
    
    return features.cpu().numpy()

def predict(video_paths: list) -> dict:
    # Load feature extraction models
    mvit = load_mvit_model()
    x3d = load_x3d_model()
    slowfast = load_slowfast_model()

    # Initialize lists to store action clips
    action_clips_mvit = []
    action_clips_x3d = []
    action_clips_slowfast = []

    # Process each video and extract features
    for video_path in video_paths:   
        try:
            features_mvit = extract_features_mvit(video_path, 50, 80, mvit)
            features_x3d = extract_features_x3d(video_path, x3d)
            features_slowfast = extract_features_slowfast(video_path, slowfast)

            action_clips_mvit.append(features_mvit)
            action_clips_x3d.append(features_x3d)
            action_clips_slowfast.append(features_slowfast)
        except Exception as e:
            print(f"Error while processing video {video_path}: {e}")

    # Calculate mean features for each model
    action_features = []
    action_features.append(np.mean(action_clips_mvit, axis=0)) 
    action_features.append(np.mean(action_clips_x3d, axis=0))
    action_features.append(np.mean(action_clips_slowfast, axis=0))

    print("Action features shape: ", len(action_features))

    # Verify that all features have been calculated for each 3 models
    if len(action_features) != 3:
        raise RuntimeError("All 3 models should have produced features.")
    
    foul_preds = []
    foul_model_results = []
    for i, model in enumerate(FOUL_MODELS):
        feature = action_features[i]
        prediction = model.predict(feature)[0]
        probabilities = model.predict_proba(feature)[0]
        print(f"Model {i+1} foul probabilities: {probabilities}")
        foul_preds.append(prediction)
        foul_model_results.append({
            "model": f"Foul Model {i+1}",
            "prediction": prediction
        })

    # Calculate the average of the predictions
    total_foul_preds = len(foul_preds)
    foul_pct = (foul_preds.count(1)/total_foul_preds) * 100
    no_foul_pct = (foul_preds.count(0)/total_foul_preds) * 100

    # Calculate the severity predictions only if a foul is detected
    if foul_pct > no_foul_pct:
        severity_preds = []
        severity_model_results = []
        for i, model in enumerate(SEVERITY_MODELS):
            feature = action_features[i]
            probabilities = model.predict_proba(feature)[0]
            prediction = model.predict(feature)[0]
            print(f"Model {i+1} severity probabilities: {probabilities}")
            severity_preds.append(prediction)
            severity_model_results.append({
                "model": f"Severity Model {i+1}",
                "prediction": prediction
            })

        # Calculate the average of the severity predictions
        total_severity_preds = len(severity_preds)
        red_card_pct = (severity_preds.count(1)/total_severity_preds) * 100
        yellow_card_pct = (severity_preds.count(2)/total_severity_preds) * 100
        no_card_pct = (severity_preds.count(0)/total_severity_preds) * 100
    else:
        red_card_pct = 0
        yellow_card_pct = 0
        no_card_pct = 100

    # Change the prediction to int
    foul_model_results = [
        {
            "model": result["model"],
            "prediction": int(result["prediction"])
        }
        for result in foul_model_results
    ]

    # Change the severity predictions to int
    severity_model_results = [
        {
            "model": result["model"],
            "prediction": int(result["prediction"])
        }
        for result in severity_model_results
    ]

    return {
        "is_foul": bool(foul_pct > no_foul_pct),
        "foul_confidence": float(foul_pct),
        "no_foul_confidence": float(no_foul_pct),
        "foul_model_results": foul_model_results,
        "severity": {
            "no_card": float(no_card_pct),
            "red_card": float(red_card_pct),
            "yellow_card": float(yellow_card_pct),
        },
        "severity_model_results": severity_model_results,
    }
