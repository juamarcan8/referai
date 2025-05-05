import { JSX } from "react";

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

export interface ModelResult {
  
  model: string;
  prediction: number;
}

export interface SinglePrediction {
  filename: string;
  is_foul: boolean;
  foul_confidence: number;
  no_foul_confidence: number;
  severity: SeverityPrediction;
  foul_model_results: ModelResult[];
  severity_model_results: ModelResult[];
}

export interface PredictResponse {
  results: SinglePrediction[];
}