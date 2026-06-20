/**
 * SKIN DISEASE DETECTION ENGINE
 * Identifies actual skin conditions from trained model
 */

export interface DiseaseInfo {
  name: string;
  urdu: string;
  emoji: string;
  severity_levels: string[];
  symptoms: string[];
  causes: string[];
  treatment: string[];
  products: string[];
}

export interface ModelPredictions {
  acne: number;
  dry: number;
  oily: number;
  normal: number;
  pigmentation: number;
}

export interface AnalysisResult {
  disease: string;
  confidence: number;
  message: string;
  urdu_message: string;
  full_analysis: DiseaseInfo;
  modelScores?: ModelPredictions;
}

export class SkinDiseaseDetector {
  private diseases: Record<string, DiseaseInfo>;

  constructor() {
    this.diseases = {
      acne: {
        name: 'Acne Vulgaris',
        urdu: 'مہاسے',
        emoji: '🔴',
        severity_levels: ['Mild', 'Moderate', 'Severe', 'Cystic'],
        symptoms: [
          'Blackheads and whiteheads',
          'Red inflamed pimples',
          'Pustules (pus-filled bumps)',
          'Cystic acne (deep, painful nodules)',
          'Oily skin',
          'Possible scarring',
        ],
        causes: [
          'Bacteria (Cutibacterium acnes)',
          'Excess sebum production',
          'Hair follicle clogging',
          'Hormonal changes',
          'Poor skincare routine',
          'Diet (dairy, high glycemic foods)',
        ],
        treatment: [
          '🧼 Salicylic acid cleanser (2x daily)',
          '💊 Benzoyl peroxide (2.5-10%)',
          '🧴 Oil-free moisturizer',
          '⚕️ Dermatologist: Retinoids, Antibiotics, Isotretinoin (severe)',
          '🌞 Sunscreen SPF 30+',
          '☀️ Avoid: Dairy, high sugar, oil-based cosmetics',
        ],
        products: [
          'Salicylic Acid Cleanser - CeraVe',
          'Benzoyl Peroxide 5% - Neutrogena',
          'Niacinamide + Zinc - The Ordinary',
          'Azelaic Acid 20% - The Ordinary',
        ],
      },
      dry: {
        name: 'Dermatitis / Xerosis (Dry Skin Condition)',
        urdu: 'خشک جلد',
        emoji: '🏜️',
        severity_levels: ['Mild Dryness', 'Moderate Dryness', 'Severe Xerosis', 'Eczema-like'],
        symptoms: [
          'Tightness, especially after cleansing',
          'Visible flaking or scaling',
          'Rough, sandpaper-like texture',
          'Itching (pruritis)',
          'Redness or irritation',
          'Fine lines appear more pronounced',
        ],
        causes: [
          'Low humidity environment',
          'Over-washing or hot water',
          'Harsh soaps/detergents',
          'Genetics (atopic predisposition)',
          'Nutritional deficiency',
          'Underlying conditions (eczema, psoriasis)',
        ],
        treatment: [
          '💧 Hydrating cleanser (low pH)',
          '🧴 Rich moisturizing cream (ceramides, hyaluronic acid)',
          '🌡️ Humidifier at night',
          '🧴 Apply moisturizer to damp skin',
          '💊 Hydrating masks 2-3x/week',
          '⚕️ Dermatologist: Topical corticosteroids if severe',
        ],
        products: [
          'Hydrating Facial Cleanser - CeraVe',
          'Hyaluronic Acid 2% + B5 - The Ordinary',
          'Ceramide Moisturizing Cream - Cetaphil',
          'Humectant Toner - Isntree',
        ],
      },
      oily: {
        name: 'Seborrheic / Oily Skin Condition',
        urdu: 'تیل والی جلد',
        emoji: '💧',
        severity_levels: ['Mild Oiliness', 'Moderate Sebum', 'Severe Oiliness', 'Seborrhea'],
        symptoms: [
          'Shiny appearance, especially T-zone',
          'Large, visible pores',
          'Frequent breakouts',
          'Foundation wear-off by mid-day',
          'Greasy hair (if present)',
          'Possible seborrheic dermatitis (flaky, oily scalp)',
        ],
        causes: [
          'Overactive sebaceous glands',
          'Genetics',
          'Hormonal fluctuations (puberty, menstrual cycle)',
          'Hot/humid climate',
          'Improper skincare (too many heavy products)',
          'Stress',
        ],
        treatment: [
          '🧼 Foaming gel or micellar cleanser',
          '🧊 Oil-free, water-based moisturizer',
          '🥒 Niacinamide serum (regulates sebum)',
          '🧖 Weekly clay or charcoal mask',
          '💊 Salicylic acid 2-3x/week',
          '☀️ Mattifying sunscreen',
        ],
        products: [
          'Foaming Gel Cleanser - La Roche-Posay',
          'Niacinamide 10% + Zinc 1% - The Ordinary',
          'Clay Mask - Aztec Secret',
          'Mattifying Primer - Benefit',
        ],
      },
      normal: {
        name: 'Healthy / Normal Skin',
        urdu: 'صحت مند جلد',
        emoji: '✅',
        severity_levels: ['Optimal', 'Well-Balanced'],
        symptoms: [
          'Smooth, radiant texture',
          'Balanced oil production',
          'Few or no breakouts',
          'No excessive dryness or oiliness',
          'Even skin tone',
          'Good blood circulation',
        ],
        causes: [
          'Genetics (good skin predisposition)',
          'Consistent skincare routine',
          'Healthy diet and hydration',
          'Good sleep and stress management',
          'Sun protection habits',
        ],
        treatment: [
          '✓ Maintain daily skincare routine',
          '✓ Gentle cleanser morning & night',
          '✓ Light moisturizer',
          '✓ Daily SPF 30+ sunscreen',
          '✓ Weekly gentle exfoliation',
          '✓ Stay hydrated (8+ glasses water/day)',
        ],
        products: [
          'Gentle Skin Cleanser - Cetaphil',
          'Daily Moisturizing Lotion - CeraVe',
          "Daily UV Defender SPF 50 - L'Oreal",
          'Gentle Exfoliator - Cosrx',
        ],
      },
      pigmentation: {
        name: 'Hyperpigmentation / Melasma / Post-Inflammatory Hyperpigmentation',
        urdu: 'داغ / رنگین جلد',
        emoji: '🌑',
        severity_levels: ['Mild Spots', 'Moderate Discoloration', 'Severe Melasma', 'Extensive PIH'],
        symptoms: [
          'Dark brown or black patches',
          'Uneven skin tone',
          'Sun spots (age spots, lentigines)',
          'Melasma (symmetric patches on cheeks/forehead)',
          'Post-inflammatory hyperpigmentation (after acne)',
          'Freckles or increased freckling',
        ],
        causes: [
          'Excessive sun exposure (UV damage)',
          'Genetics (darker skin tones more prone)',
          'Hormonal changes (pregnancy, birth control)',
          'Post-inflammatory (acne, eczema scars)',
          'Certain medications (minocycline)',
          'Aging',
        ],
        treatment: [
          '🌞 Strict SPF 50+ sunscreen (daily!)',
          '🧴 Vitamin C serum (brightening)',
          '💊 Hydroquinone 2-4% (dermatologist prescribed)',
          '🧴 Retinoids/Tretinoin (cell turnover)',
          '⚕️ Laser treatment (professional)',
          '🧖 Niacinamide + kojic acid serum',
        ],
        products: [
          'Vitamin C Brightening Serum - SkinCeuticals',
          'Azelaic Acid 20% - The Ordinary',
          'Niacinamide + Kojic Acid - Cosrx',
          'SPF 50+ Sunscreen - Neutrogena',
        ],
      },
    };
  }

  analyzeImage(modelPredictions: ModelPredictions): AnalysisResult {
    let primaryDisease: string | null = null;
    let maxScore = 0;

    for (const [disease, score] of Object.entries(modelPredictions)) {
      if (score > maxScore) {
        maxScore = score;
        primaryDisease = disease;
      }
    }

    if (!primaryDisease || maxScore < 0.3) {
      return {
        disease: 'normal',
        confidence: 0.95,
        message: '✅ Your skin appears HEALTHY with no detected conditions!',
        urdu_message: '✅ آپ کی جلد صحت مند ہے!',
        full_analysis: this.diseases.normal,
      };
    }

    return {
      disease: primaryDisease,
      confidence: maxScore,
      message: `🔍 DETECTED: ${this.diseases[primaryDisease].name}`,
      urdu_message: `🔍 محسوس ہوا: ${this.diseases[primaryDisease].urdu}`,
      full_analysis: this.diseases[primaryDisease],
      modelScores: modelPredictions,
    };
  }

  getDetailedReport(diseaseKey: string): DiseaseInfo {
    return this.diseases[diseaseKey] || this.diseases.normal;
  }

  getAllDiseases(): Record<string, DiseaseInfo> {
    return this.diseases;
  }
}
