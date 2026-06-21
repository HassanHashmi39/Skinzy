export type DiseaseInfo = {
  disease: string;
  severity: string;
  description: string;
  symptoms: string[];
  causes: string[];
  morning_routine: string[];
  night_routine: string[];
  recommended_ingredients: string[];
  recommended_products: string[];
  home_remedies: string[];
  things_to_avoid: string[];
  doctor_when: string;
};

export const diseaseData: Record<string, DiseaseInfo> = {
  "acne_vulgaris": {
    "disease": "Acne Vulgaris",
    "severity": "Mild to Severe",
    "description": "A common skin condition that happens when hair follicles become plugged with oil and dead skin cells.",
    "symptoms": [
      "Pimples",
      "Whiteheads",
      "Blackheads",
      "Painful cysts",
      "Oily skin"
    ],
    "causes": [
      "Excess oil (sebum) production",
      "Bacteria",
      "Inflammation",
      "Hormonal changes"
    ],
    "morning_routine": [
      "Gentle cleanser",
      "Salicylic Acid (0.5–2%)",
      "Oil-free moisturizer",
      "SPF 30–50 sunscreen"
    ],
    "night_routine": [
      "Cleanser",
      "Benzoyl Peroxide OR Adapalene",
      "Moisturizer"
    ],
    "recommended_ingredients": [
      "Salicylic Acid",
      "Benzoyl Peroxide",
      "Niacinamide",
      "Adapalene"
    ],
    "recommended_products": [
      "Salicylic Acid Cleanser",
      "Niacinamide Serum",
      "Oil-free Moisturizer"
    ],
    "home_remedies": [
      "Fresh aloe vera gel",
      "Ice compress (5-10 minutes) for inflamed pimples",
      "Green tea (cooled) as a gentle facial rinse or compress",
      "Honey spot application (15-20 minutes, then rinse)",
      "Drink enough water",
      "Eat more fruits and vegetables"
    ],
    "things_to_avoid": [
      "Toothpaste on pimples",
      "Lemon juice directly on skin",
      "Scrubbing pimples"
    ],
    "doctor_when": "If over-the-counter products haven't helped after several weeks, or if acne is severe/painful and leaving scars."
  },
  "actinic_keratosis": {
    "disease": "Actinic Keratosis",
    "severity": "Moderate (Pre-cancerous)",
    "description": "Rough, scaly patch on the skin that develops from years of exposure to the sun. It is considered a precancer.",
    "symptoms": [
      "Rough, dry or scaly patch of skin",
      "Flat to slightly raised patch or bump",
      "Itching or burning"
    ],
    "causes": [
      "Years of sun damage",
      "Frequent use of tanning beds"
    ],
    "morning_routine": [
      "Gentle cleanser",
      "Moisturizer",
      "SPF 50+ (Reapply every 2 hours)"
    ],
    "night_routine": [
      "Gentle Cleanser",
      "Rich Moisturizer"
    ],
    "recommended_ingredients": [
      "Ceramides",
      "Hyaluronic Acid"
    ],
    "recommended_products": [
      "Mineral sunscreen",
      "Ceramide moisturizer"
    ],
    "home_remedies": [
      "Use sunscreen daily",
      "Wear a hat outdoors",
      "Stay in the shade during peak sunlight",
      "Keep skin moisturized"
    ],
    "things_to_avoid": [
      "Sunburn",
      "DIY removal"
    ],
    "doctor_when": "Must see a doctor. Doctor treatments often include cryotherapy or prescription creams."
  },
  "basal_cell_carcinoma": {
    "disease": "Basal Cell Carcinoma",
    "severity": "High (Skin Cancer)",
    "description": "A type of skin cancer that begins in the basal cells. It often appears as a slightly transparent bump on the skin.",
    "symptoms": [
      "Pearly or waxy bump",
      "Flat, flesh-colored or brown scar-like lesion",
      "Bleeding or scabbing sore that heals and returns"
    ],
    "causes": [
      "Long-term ultraviolet (UV) radiation exposure"
    ],
    "morning_routine": [
      "Gentle Cleanser",
      "Daily sunscreen SPF 50+"
    ],
    "night_routine": [
      "Gentle Cleanser",
      "Basic Moisturizer"
    ],
    "recommended_ingredients": [],
    "recommended_products": [
      "Broad-spectrum Mineral SPF 50+"
    ],
    "home_remedies": [
      "None. Seek prompt medical treatment. Home remedies cannot cure it."
    ],
    "things_to_avoid": [
      "None. Seek prompt medical treatment."
    ],
    "doctor_when": "Immediate dermatologist evaluation. Surgical removal is commonly recommended."
  },
  "bullous_disease": {
    "disease": "Bullous Disease",
    "severity": "High",
    "description": "A group of rare skin conditions that cause large, fluid-filled blisters to develop on the skin.",
    "symptoms": [
      "Large fluid-filled blisters",
      "Itching",
      "Redness"
    ],
    "causes": [
      "Autoimmune dysfunction",
      "Medication reactions"
    ],
    "morning_routine": [
      "Extremely gentle cleansing",
      "Sterile dressing application"
    ],
    "night_routine": [
      "Extremely gentle cleansing",
      "Prescription medicines application"
    ],
    "recommended_ingredients": [],
    "recommended_products": [
      "Sterile dressings",
      "Prescribed ointments"
    ],
    "home_remedies": [
      "Keep blisters clean",
      "Cover with sterile dressing if advised",
      "Avoid friction"
    ],
    "things_to_avoid": [
      "Popping blisters"
    ],
    "doctor_when": "Requires immediate medical management and prescription medicines."
  },
  "cellulitis": {
    "disease": "Cellulitis",
    "severity": "High (Bacterial Infection)",
    "description": "A common, potentially serious bacterial skin infection causing redness, swelling, and pain.",
    "symptoms": [
      "Redness",
      "Swelling",
      "Fever",
      "Pain",
      "Warmth in the affected area"
    ],
    "causes": [
      "Bacteria (Staphylococcus or Streptococcus) entering through a break in the skin"
    ],
    "morning_routine": [
      "Gentle washing"
    ],
    "night_routine": [
      "Gentle washing"
    ],
    "recommended_ingredients": [],
    "recommended_products": [],
    "home_remedies": [
      "Rest",
      "Elevate the affected area (if possible)",
      "Stay hydrated"
    ],
    "things_to_avoid": [
      "Delaying medical care",
      "Applying random creams instead of seeking treatment"
    ],
    "doctor_when": "Immediate medical attention required. Needs antibiotics prescribed by a clinician."
  },
  "comedones": {
    "disease": "Comedones",
    "severity": "Mild",
    "description": "Small, flesh-colored, white, or dark bumps that give skin a rough texture (Blackheads & Whiteheads).",
    "symptoms": [
      "Blackheads",
      "Whiteheads",
      "Rough skin texture"
    ],
    "causes": [
      "Clogged pores",
      "Excess oil production",
      "Dead skin cells"
    ],
    "morning_routine": [
      "Salicylic Acid cleanser",
      "Light Moisturizer",
      "SPF 30+"
    ],
    "night_routine": [
      "Cleanser",
      "Retinoid (like Adapalene)",
      "Moisturizer"
    ],
    "recommended_ingredients": [
      "Salicylic Acid",
      "Niacinamide",
      "Retinoids"
    ],
    "recommended_products": [
      "Salicylic Acid Cleanser",
      "Niacinamide Serum",
      "Clay Mask (Weekly)"
    ],
    "home_remedies": [
      "Warm steam for 5-10 minutes (occasionally)",
      "Clay mask once weekly",
      "Wash face twice daily",
      "Change pillowcases regularly"
    ],
    "things_to_avoid": [
      "Squeezing blackheads"
    ],
    "doctor_when": "Consult a dermatologist if over-the-counter retinoids and BHAs do not clear them up."
  },
  "eczema_atopic_dermatitis": {
    "disease": "Atopic Dermatitis (Eczema)",
    "severity": "Moderate",
    "description": "A condition that makes your skin red and itchy. It's common in children but can occur at any age.",
    "symptoms": [
      "Dry, itchy skin",
      "Red to brownish-gray patches",
      "Small, raised bumps"
    ],
    "causes": [
      "Genetics",
      "Immune system dysfunction",
      "Environmental triggers"
    ],
    "morning_routine": [
      "Fragrance-free cleanser",
      "Ceramide cream",
      "Gentle SPF"
    ],
    "night_routine": [
      "Fragrance-free cleanser",
      "Thick moisturizer",
      "Petroleum jelly on dry areas"
    ],
    "recommended_ingredients": [
      "Ceramides",
      "Oatmeal",
      "Glycerin"
    ],
    "recommended_products": [
      "Ceramide Moisturizer",
      "Colloidal Oatmeal Bath"
    ],
    "home_remedies": [
      "Colloidal oatmeal bath",
      "Coconut oil (if it doesn't irritate your skin)",
      "Aloe vera gel",
      "Petroleum jelly on very dry areas",
      "Use a humidifier in dry weather"
    ],
    "things_to_avoid": [
      "Hot showers",
      "Fragranced soaps"
    ],
    "doctor_when": "If it affects sleep/daily activities, looks infected, or doesn't improve with basic care."
  },
  "exanthems_and_drug_eruptions": {
    "disease": "Drug Eruptions",
    "severity": "Moderate to High",
    "description": "A rash or skin eruption that usually occurs as a reaction to a medication.",
    "symptoms": [
      "Widespread red rash",
      "Itching",
      "Hives"
    ],
    "causes": [
      "Allergic reaction to medication"
    ],
    "morning_routine": [
      "Gentle, cool washing"
    ],
    "night_routine": [
      "Gentle, cool washing"
    ],
    "recommended_ingredients": [
      "Aloe Vera (for soothing)"
    ],
    "recommended_products": [
      "Calamine lotion",
      "Gentle fragrance-free moisturizer"
    ],
    "home_remedies": [
      "Cool compresses",
      "Fragrance-free moisturizer",
      "Wear loose cotton clothing",
      "Do not stop prescription medicines without medical advice."
    ],
    "things_to_avoid": [
      "Stopping prescription medicines without medical advice."
    ],
    "doctor_when": "Doctor should identify and stop the offending medicine. Seek immediate care if accompanied by fever or breathing issues."
  },
  "fungal_infection_tinea_faciei": {
    "disease": "Fungal Infection (Tinea Faciei)",
    "severity": "Mild to Moderate",
    "description": "A fungal infection of the skin of the face causing red, itchy, scaly patches.",
    "symptoms": [
      "Red, itchy, scaly patches",
      "Ring-shaped rash",
      "Slight raised borders"
    ],
    "causes": [
      "Dermatophyte fungi"
    ],
    "morning_routine": [
      "Wash face with mild soap",
      "Apply Antifungal cream"
    ],
    "night_routine": [
      "Wash face",
      "Continue Antifungal cream application"
    ],
    "recommended_ingredients": [
      "Clotrimazole",
      "Terbinafine",
      "Ketoconazole"
    ],
    "recommended_products": [
      "Antifungal cream"
    ],
    "home_remedies": [
      "Keep the skin dry",
      "Wash towels frequently",
      "Use separate towels",
      "Wear clean pillow covers"
    ],
    "things_to_avoid": [
      "Steroid creams unless prescribed"
    ],
    "doctor_when": "If the rash does not improve after 2 weeks of over-the-counter antifungal use."
  },
  "herpes_simplex_cold_sores": {
    "disease": "Herpes Simplex (Cold Sores)",
    "severity": "Mild to Moderate",
    "description": "A viral infection causing tiny, fluid-filled blisters on and around your lips.",
    "symptoms": [
      "Tingling and itching",
      "Fluid-filled blisters",
      "Oozing and crusting"
    ],
    "causes": [
      "Herpes simplex virus (HSV-1)"
    ],
    "morning_routine": [
      "Keep area clean",
      "Apply Petroleum jelly or antiviral ointment"
    ],
    "night_routine": [
      "Keep area clean",
      "Apply ointment"
    ],
    "recommended_ingredients": [
      "Lysine",
      "Acyclovir",
      "Docosanol"
    ],
    "recommended_products": [
      "Cold Sore Ointment",
      "Petroleum Jelly"
    ],
    "home_remedies": [
      "Ice pack wrapped in cloth",
      "Petroleum jelly to reduce cracking",
      "Stay hydrated",
      "Get enough rest"
    ],
    "things_to_avoid": [
      "Touching the sores",
      "Sharing cups, towels, or lip products during an outbreak"
    ],
    "doctor_when": "Prescription antivirals can reduce symptoms if started early. See a doctor if it doesn't heal within 2 weeks."
  },
  "lupus": {
    "disease": "Lupus (Cutaneous)",
    "severity": "High",
    "description": "An autoimmune disease where the body's immune system mistakenly attacks healthy tissue, often causing a butterfly-shaped rash on the face.",
    "symptoms": [
      "Butterfly-shaped rash across cheeks and nose",
      "Sun sensitivity",
      "Discoid (coin-shaped) lesions"
    ],
    "causes": [
      "Autoimmune dysfunction",
      "Genetics",
      "Sunlight trigger"
    ],
    "morning_routine": [
      "Extremely gentle cleanser",
      "Thick moisturizer",
      "SPF 50+ (Crucial)"
    ],
    "night_routine": [
      "Gentle cleanser",
      "Hydrating moisturizer"
    ],
    "recommended_ingredients": [
      "Ceramides",
      "Hyaluronic Acid"
    ],
    "recommended_products": [
      "Broad-spectrum Mineral SPF 50+"
    ],
    "home_remedies": [
      "Strict sun protection",
      "Adequate sleep",
      "Stress management",
      "Gentle skincare"
    ],
    "things_to_avoid": [
      "Sun exposure without protection"
    ],
    "doctor_when": "Requires ongoing medical management by a Rheumatologist or Dermatologist."
  },
  "melanoma": {
    "disease": "Melanoma",
    "severity": "High (Dangerous Skin Cancer)",
    "description": "The most serious type of skin cancer, develops in the cells (melanocytes) that produce melanin.",
    "symptoms": [
      "Asymmetrical mole",
      "Irregular borders",
      "Changes in color",
      "Diameter larger than a pencil eraser",
      "Evolving shape or size"
    ],
    "causes": [
      "UV radiation exposure",
      "Genetics"
    ],
    "morning_routine": [
      "Immediate Dermatologist Visit"
    ],
    "night_routine": [
      "Immediate Dermatologist Visit"
    ],
    "recommended_ingredients": [],
    "recommended_products": [],
    "home_remedies": [
      "None. Requires urgent medical evaluation."
    ],
    "things_to_avoid": [
      "None. Requires urgent medical evaluation."
    ],
    "doctor_when": "Immediate dermatologist visit is critical. No home treatment."
  },
  "melasma": {
    "disease": "Melasma",
    "severity": "Mild to Moderate",
    "description": "A common skin problem causing brown to gray-brown patches, usually on the face.",
    "symptoms": [
      "Brown or grayish patches on cheeks, nose bridge, forehead, or chin"
    ],
    "causes": [
      "Sun exposure",
      "Hormonal changes (pregnancy, birth control)"
    ],
    "morning_routine": [
      "Gentle Cleanser",
      "Vitamin C Serum",
      "SPF 50+ Sunscreen"
    ],
    "night_routine": [
      "Cleanser",
      "Azelaic Acid or Niacinamide",
      "Moisturizer"
    ],
    "recommended_ingredients": [
      "Vitamin C",
      "Azelaic Acid",
      "Niacinamide",
      "Kojic Acid"
    ],
    "recommended_products": [
      "Vitamin C Brightening Wash",
      "Niacinamide Serum",
      "SPF 50+ Sunscreen"
    ],
    "home_remedies": [
      "Aloe vera gel",
      "Daily sunscreen",
      "Wear hats outdoors",
      "Avoid unnecessary sun exposure"
    ],
    "things_to_avoid": [
      "Unnecessary sun exposure"
    ],
    "doctor_when": "If over-the-counter brightening ingredients don't work, a doctor can prescribe Hydroquinone or recommend chemical peels."
  },
  "milia": {
    "disease": "Milia",
    "severity": "Mild",
    "description": "Tiny white bumps that appear across a baby's nose, chin or cheeks, but can also affect adults.",
    "symptoms": [
      "Small, hard white bumps",
      "Usually around the eyes and cheeks"
    ],
    "causes": [
      "Trapped dead skin cells (keratin) under the skin's surface"
    ],
    "morning_routine": [
      "Gentle cleanser",
      "Light moisturizer",
      "SPF"
    ],
    "night_routine": [
      "Cleanser",
      "Retinoid",
      "Moisturizer"
    ],
    "recommended_ingredients": [
      "Retinol",
      "Salicylic Acid",
      "Glycolic Acid"
    ],
    "recommended_products": [
      "Youth Serum (Retinol)",
      "SA Smoothing Cleanser"
    ],
    "home_remedies": [
      "Warm compress",
      "Gentle cleansing",
      "Mild exfoliation if suitable"
    ],
    "things_to_avoid": [
      "Popping with needles"
    ],
    "doctor_when": "If they are persistent and bothersome, a dermatologist can easily extract them safely."
  },
  "normal": {
    "disease": "Normal / Healthy Skin",
    "severity": "None",
    "description": "Well-balanced skin that is neither too oily nor too dry.",
    "symptoms": [
      "Smooth texture",
      "No severe sensitivity",
      "Barely visible pores"
    ],
    "causes": [
      "Good genetics",
      "Proper skincare routine",
      "Healthy lifestyle"
    ],
    "morning_routine": [
      "Cleanser",
      "Vitamin C Serum",
      "Moisturizer",
      "SPF 30-50"
    ],
    "night_routine": [
      "Cleanser",
      "Moisturizer"
    ],
    "recommended_ingredients": [
      "Hyaluronic Acid",
      "Vitamin C",
      "Niacinamide"
    ],
    "recommended_products": [
      "Gentle Cleanser",
      "Daily Moisturizer",
      "Sunscreen"
    ],
    "home_remedies": [
      "Drink plenty of water",
      "Eat a balanced diet",
      "Sleep 7-9 hours",
      "Wear sunscreen daily"
    ],
    "things_to_avoid": [
      "Sleeping with makeup on",
      "Over-exfoliating"
    ],
    "doctor_when": "Not required unless you notice new, unusual moles or persistent changes."
  },
  "perioral_dermatitis": {
    "disease": "Perioral Dermatitis",
    "severity": "Moderate",
    "description": "An inflammatory rash involving the skin around the mouth.",
    "symptoms": [
      "Red, bumpy rash around the mouth",
      "Mild itching or burning"
    ],
    "causes": [
      "Topical steroid use",
      "Heavy cosmetics",
      "Fluorinated toothpaste"
    ],
    "morning_routine": [
      "Gentle fragrance-free cleanser",
      "Light moisturizer"
    ],
    "night_routine": [
      "Gentle cleanser",
      "Light moisturizer"
    ],
    "recommended_ingredients": [
      "Azelaic Acid",
      "Ceramides"
    ],
    "recommended_products": [
      "Dermive Oil Free Moisturizer",
      "Extremely Gentle Cleanser"
    ],
    "home_remedies": [
      "Wash with lukewarm water",
      "Use gentle fragrance-free products",
      "Keep the area clean"
    ],
    "things_to_avoid": [
      "Steroid creams (unless prescribed)",
      "Heavy makeup around the mouth"
    ],
    "doctor_when": "Often requires a prescription of oral or topical antibiotics from a dermatologist."
  },
  "psoriasis": {
    "disease": "Psoriasis",
    "severity": "Moderate to Severe",
    "description": "A skin disease that causes red, itchy scaly patches, most commonly on the knees, elbows, trunk and scalp.",
    "symptoms": [
      "Red patches of skin covered with thick, silvery scales",
      "Dry, cracked skin that may bleed",
      "Itching, burning or soreness"
    ],
    "causes": [
      "Immune system issue",
      "Genetics",
      "Stress trigger"
    ],
    "morning_routine": [
      "Gentle Cleanser",
      "Thick Moisturizer",
      "SPF"
    ],
    "night_routine": [
      "Gentle Cleanser",
      "Thick Ointment or Moisturizer"
    ],
    "recommended_ingredients": [
      "Urea",
      "Ceramides",
      "Salicylic Acid (for scaling)"
    ],
    "recommended_products": [
      "Urea-based creams",
      "Ceramide moisturizers"
    ],
    "home_remedies": [
      "Oatmeal bath",
      "Coconut oil (if tolerated)",
      "Aloe vera gel",
      "Moisturize frequently",
      "Get moderate sunlight only with medical guidance"
    ],
    "things_to_avoid": [
      "Stress",
      "Skin injury",
      "Smoking"
    ],
    "doctor_when": "Must be managed by a doctor. Prescriptions range from topical steroids to biologics."
  },
  "rosacea": {
    "disease": "Rosacea",
    "severity": "Moderate",
    "description": "A common skin condition that causes blushing or flushing and visible blood vessels in your face.",
    "symptoms": [
      "Facial blushing or flushing",
      "Visible veins",
      "Swollen bumps (sometimes resembling acne)",
      "Burning sensation"
    ],
    "causes": [
      "Genetics",
      "Environmental triggers",
      "Immune system overreaction"
    ],
    "morning_routine": [
      "Gentle cleanser",
      "Light moisturizer",
      "Mineral SPF 30+"
    ],
    "night_routine": [
      "Gentle cleanser",
      "Azelaic Acid (if recommended)",
      "Moisturizer"
    ],
    "recommended_ingredients": [
      "Azelaic Acid",
      "Ceramides",
      "Niacinamide"
    ],
    "recommended_products": [
      "Anti-redness serums",
      "Mineral Sunscreen"
    ],
    "home_remedies": [
      "Cool compress",
      "Aloe vera gel (if tolerated)",
      "Gentle cleansing",
      "Stress reduction"
    ],
    "things_to_avoid": [
      "Very hot drinks",
      "Spicy foods (if they trigger flares)",
      "Alcohol (if it triggers symptoms)"
    ],
    "doctor_when": "See a dermatologist for proper diagnosis and prescription treatments like Metronidazole."
  },
  "seborrheic_keratosis": {
    "disease": "Seborrheic Keratosis",
    "severity": "Mild (Benign)",
    "description": "One of the most common noncancerous skin growths in older adults. It usually appears as a brown, black or light tan growth.",
    "symptoms": [
      "Slightly elevated, waxy or scaly bump",
      "Pasted-on appearance",
      "Brown, black or tan color"
    ],
    "causes": [
      "Aging",
      "Genetics"
    ],
    "morning_routine": [
      "Regular cleansing",
      "Moisturizer"
    ],
    "night_routine": [
      "Regular cleansing",
      "Moisturizer"
    ],
    "recommended_ingredients": [
      "Alpha Hydroxy Acids (for gentle exfoliation, though won't remove them)"
    ],
    "recommended_products": [
      "Standard Skincare Routine"
    ],
    "home_remedies": [
      "Moisturize dry surrounding skin",
      "Avoid scratching the growth"
    ],
    "things_to_avoid": [
      "Attempting to cut or remove it yourself",
      "Scratching the growth"
    ],
    "doctor_when": "Doctor can easily freeze (cryotherapy) or scrape them off if they are bothersome or easily irritated."
  },
  "urticaria": {
    "disease": "Urticaria (Hives)",
    "severity": "Moderate",
    "description": "An outbreak of swollen, pale red bumps or plaques (wheals) on the skin that appear suddenly.",
    "symptoms": [
      "Itchy, raised red welts",
      "Swelling",
      "Blanching (center turns white when pressed)"
    ],
    "causes": [
      "Allergic reactions (food, medication, bug bites)",
      "Stress",
      "Infection"
    ],
    "morning_routine": [
      "Cool shower",
      "Gentle moisturizer"
    ],
    "night_routine": [
      "Cool shower",
      "Soothing lotion"
    ],
    "recommended_ingredients": [
      "Calamine",
      "Aloe Vera",
      "Menthol (for cooling)"
    ],
    "recommended_products": [
      "Calamine Lotion",
      "Antihistamines (Oral)"
    ],
    "home_remedies": [
      "Cool compress",
      "Wear loose cotton clothes",
      "Stay cool",
      "Avoid known allergy triggers"
    ],
    "things_to_avoid": [
      "Known allergy triggers"
    ],
    "doctor_when": "If accompanied by swelling of the lips/throat or difficulty breathing, seek EMERGENCY medical care. Otherwise, consult a doctor if they last longer than a few days."
  },
  "vascular_tumors": {
    "disease": "Vascular Tumors",
    "severity": "Moderate to High",
    "description": "Growths composed of blood vessels. Can range from benign hemangiomas to more serious conditions.",
    "symptoms": [
      "Red or purple bumps",
      "Soft swelling on the skin"
    ],
    "causes": [
      "Abnormal proliferation of blood vessels"
    ],
    "morning_routine": [
      "Gentle washing"
    ],
    "night_routine": [
      "Gentle washing"
    ],
    "recommended_ingredients": [],
    "recommended_products": [],
    "home_remedies": [
      "None. Medical evaluation is recommended."
    ],
    "things_to_avoid": [
      "None. Medical evaluation is recommended."
    ],
    "doctor_when": "Needs dermatologist evaluation for proper diagnosis and potential laser treatment or removal."
  },
  "vasculitis": {
    "disease": "Vasculitis (Cutaneous)",
    "severity": "High",
    "description": "Inflammation of the blood vessels in the skin, which can cause restricted blood flow.",
    "symptoms": [
      "Red or purple spots (petechiae or purpura)",
      "Hives",
      "Ulcers or lumps"
    ],
    "causes": [
      "Infection",
      "Medication reaction",
      "Autoimmune disease"
    ],
    "morning_routine": [
      "Gentle washing"
    ],
    "night_routine": [
      "Gentle washing"
    ],
    "recommended_ingredients": [],
    "recommended_products": [],
    "home_remedies": [
      "Rest",
      "Stay hydrated",
      "Protect affected skin from injury"
    ],
    "things_to_avoid": [
      "Ignoring medical assessment"
    ],
    "doctor_when": "Requires immediate medical assessment by a physician to identify the underlying cause and protect internal organs."
  },
  "warts": {
    "disease": "Warts",
    "severity": "Mild",
    "description": "Small, rough, and hard growths that are similar in color to the rest of the skin.",
    "symptoms": [
      "Small, fleshy, grainy bumps",
      "Flesh-colored, white, pink or tan",
      "Sprinkled with black pinpoints (clotted blood vessels)"
    ],
    "causes": [
      "Human papillomavirus (HPV) infection"
    ],
    "morning_routine": [
      "Wash area",
      "Apply over-the-counter Salicylic acid treatment"
    ],
    "night_routine": [
      "Wash area",
      "Apply treatment and cover with bandage"
    ],
    "recommended_ingredients": [
      "Salicylic Acid (High concentration)"
    ],
    "recommended_products": [
      "Salicylic Acid Wart Remover"
    ],
    "home_remedies": [
      "Keep the wart clean and dry",
      "Cover it if it's being rubbed",
      "Do not pick or bite the wart"
    ],
    "things_to_avoid": [
      "Sharing nail clippers or towels",
      "Scratching, which can spread the virus"
    ],
    "doctor_when": "If they are painful, spreading rapidly, or don't respond to home treatments. Doctor can use cryotherapy."
  }
};
