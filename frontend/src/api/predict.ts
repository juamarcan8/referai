import axios from "axios";

export interface FoulPrediction {
  is_foul: boolean;
  foul_confidence: number;
  no_foul_confidence: number;
}

export interface SeverityPrediction {
  no_card: number;
  red_card: number;
  yellow_card: number;
}

export interface SinglePrediction {
  filename: string;
  is_foul: boolean;
  foul_confidence: number;
  no_foul_confidence: number;
  severity: SeverityPrediction;
}

export interface PredictResponse {
  results: SinglePrediction[];
}

export const sendForPrediction = async (
  videoFilenames: string[]
): Promise<PredictResponse> => {
  const response = await axios.post<PredictResponse>(
    "http://127.0.0.1:8080/v1/predict",
    { video_filenames: videoFilenames }
  );
  return response.data;
};
