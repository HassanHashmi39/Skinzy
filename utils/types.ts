export type SkinAnalysisResult = {
  skinType: string;
  skinTone: string;
  detectedDisease?: string;
  conditionLevel?: string;
  confidence?: string;
  advice?: string;
  doctor?: string;
  is_uncertain?: boolean;
  issues: {
    acne: number;
    pigmentation: number;
    dryness: number;
    oiliness: number;
    darkCircles: number;
    sensitivity: number;
  };
  recommendations: any[];
  dos?: string[];
  donts?: string[];
  remedies?: string[];
  morningRoutine?: string[];
  nightRoutine?: string[];
  imageUrl?: string;
  createdAt?: string;
  _id?: string;
};

