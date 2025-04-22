import axios from "axios";

interface PredictionResponse {
  is_foul: boolean;
  confidence: number;
}

export const sendForPrediction = async (
  videoFilenames: string[]
): Promise<PredictionResponse> => {
  try {
    const response = await axios.post<PredictionResponse>(
      "http://127.0.0.1:8080/v1/predict",
      {
        video_filenames: videoFilenames,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Prediction failed", error);
    throw error;
  }
};