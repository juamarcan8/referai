def load_model():
    print("Model loaded!")
    return "mock_model"

def predict_with_model(model, video_paths: list):
    print(f"Predicting on: {video_paths}")
    # Simulate fake result
    return {
        "is_foul": True,
        "confidence": 0.88
    }
