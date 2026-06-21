"""
STANDALONE SKIN DISEASE DETECTION API
==========================================
Flask API for skin disease identification
Can be integrated into any frontend/website

Endpoints:
- POST /api/diagnose - Upload image and get diagnosis
- GET /api/disease/<disease_name> - Get detailed disease info
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torchvision.transforms as transforms
from PIL import Image, ImageFilter, ImageStat
import io
import csv
import os
import json
import re
import sys
from collections import defaultdict
import numpy as np

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# ============================================================================
# MODEL LOADING
# ============================================================================

device = torch.device("cpu")
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_OUTPUT_DIR = os.path.join(SCRIPT_DIR, "active_model")
LEGACY_MODEL_PATH = os.path.join(SCRIPT_DIR, "pytorch_model.pth")
MODEL_CANDIDATE_PATHS = [
    os.path.join(MODEL_OUTPUT_DIR, "skin_best_model_optimized.pth"),
    os.path.join(MODEL_OUTPUT_DIR, "skin_best_model.pth"),
    os.path.join(MODEL_OUTPUT_DIR, "skin_efficientnet_b3_best.pth"),
    os.path.join(MODEL_OUTPUT_DIR, "skin_model_output", "skin_best_model_optimized.pth"),
    os.path.join(SCRIPT_DIR, "skin_best_model_optimized.pth"),
    LEGACY_MODEL_PATH,
]
CLASS_NAMES_CANDIDATE_PATHS = [
    os.path.join(MODEL_OUTPUT_DIR, "class_names.json"),
    os.path.join(MODEL_OUTPUT_DIR, "skin_model_output", "class_names.json"),
    os.path.join(SCRIPT_DIR, "class_names.json"),
    os.path.join(SCRIPT_DIR, "metadata.json"),
]
METADATA_DIR = os.path.join(SCRIPT_DIR, "metadata")
DEFAULT_CLASS_NAMES = ['acne', 'dry', 'oily', 'normal', 'pigmentation']
DEFAULT_IMAGE_SIZE = 224

from torchvision import models


def normalize_key(value):
    return re.sub(r'[^a-z0-9]+', '', str(value).lower())


def safe_text(value):
    if value is None:
        return ""
    return str(value).strip()


def split_items(value):
    text = safe_text(value)
    if not text or text.lower() in {"none", "null", "nan"}:
        return []
    pieces = re.split(r"[;\n]+", text)
    return [piece.strip().rstrip(".") for piece in pieces if piece and piece.strip()]


def unique_list(values):
    items = []
    seen = set()
    for value in values:
        if not value:
            continue
        if value in seen:
            continue
        seen.add(value)
        items.append(value)
    return items


def assess_image_quality(image):
    grayscale = image.convert("L").resize((128, 128))
    stat = ImageStat.Stat(grayscale)
    brightness = stat.mean[0]
    contrast = stat.stddev[0]

    edges = grayscale.filter(ImageFilter.FIND_EDGES)
    edge_stat = ImageStat.Stat(edges)
    edge_strength = edge_stat.mean[0]

    issues = []
    if brightness < 25:
        issues.append("too_dark")
    elif brightness > 235:
        issues.append("too_bright")

    if contrast < 8:
        issues.append("low_contrast")

    if edge_strength < 5:
        issues.append("blurry")

    severe_quality_issue = (
        brightness < 20
        or brightness > 240
        or (contrast < 6 and edge_strength < 4)
    )

    return {
        "brightness": round(brightness, 2),
        "contrast": round(contrast, 2),
        "edge_strength": round(edge_strength, 2),
        "issues": issues,
        "severe_quality_issue": severe_quality_issue,
    }


def load_class_names():
    for path in CLASS_NAMES_CANDIDATE_PATHS:
        if not os.path.exists(path):
            continue
        try:
            with open(path, "r", encoding="utf-8") as file:
                data = json.load(file)
            if isinstance(data, list) and data:
                return data
            if isinstance(data, dict) and isinstance(data.get("classes"), list) and data["classes"]:
                return data["classes"]
        except Exception:
            continue
    return DEFAULT_CLASS_NAMES


def resolve_model_path():
    for path in MODEL_CANDIDATE_PATHS:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("No trained model checkpoint found.")


def build_model(architecture, num_classes):
    # --- EfficientNet-V2-M (from train_high_accuracy.py) ---
    if architecture == "efficientnet_v2_m":
        try:
            model = models.efficientnet_v2_m(weights=None)
        except (TypeError, AttributeError):
            model = models.efficientnet_v2_m(pretrained=False)
        in_features = model.classifier[1].in_features
        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(p=0.4),
            torch.nn.Linear(in_features, 512),
            torch.nn.BatchNorm1d(512),
            torch.nn.SiLU(inplace=True),
            torch.nn.Dropout(p=0.3),
            torch.nn.Linear(512, num_classes)
        )
        return model

    # --- EfficientNet-V2-S (fallback from train_high_accuracy.py) ---
    if architecture == "efficientnet_v2_s":
        try:
            model = models.efficientnet_v2_s(weights=None)
        except (TypeError, AttributeError):
            model = models.efficientnet_v2_s(pretrained=False)
        in_features = model.classifier[1].in_features
        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(p=0.4),
            torch.nn.Linear(in_features, 512),
            torch.nn.BatchNorm1d(512),
            torch.nn.SiLU(inplace=True),
            torch.nn.Dropout(p=0.3),
            torch.nn.Linear(512, num_classes)
        )
        return model

    # --- EfficientNet-B4 (fallback from train_high_accuracy.py) ---
    if architecture == "efficientnet_b4":
        try:
            model = models.efficientnet_b4(weights=None)
        except (TypeError, AttributeError):
            model = models.efficientnet_b4(pretrained=False)
        in_features = model.classifier[1].in_features
        model.classifier = torch.nn.Sequential(
            torch.nn.Dropout(p=0.4),
            torch.nn.Linear(in_features, 512),
            torch.nn.BatchNorm1d(512),
            torch.nn.SiLU(inplace=True),
            torch.nn.Dropout(p=0.3),
            torch.nn.Linear(512, num_classes)
        )
        return model

    # --- EfficientNet-B3 (from original train_colab.py) ---
    if architecture == "efficientnet_b3":
        try:
            model = models.efficientnet_b3(weights=None)
        except TypeError:
            model = models.efficientnet_b3(pretrained=False)
        in_features = model.classifier[1].in_features
        model.classifier[1] = torch.nn.Linear(in_features, num_classes)
        return model

    # --- ResNet-18 (legacy fallback) ---
    try:
        model = models.resnet18(weights=None)
    except TypeError:
        model = models.resnet18(pretrained=False)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    return model


def load_checkpoint():
    model_path = resolve_model_path()
    checkpoint = torch.load(model_path, map_location=device)

    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        architecture = checkpoint.get("architecture", "resnet18")
        class_names = checkpoint.get("class_names") or load_class_names()
        image_size = int(checkpoint.get("image_size", DEFAULT_IMAGE_SIZE))
        state_dict = checkpoint["model_state_dict"]
    else:
        architecture = "resnet18"
        class_names = load_class_names()
        image_size = DEFAULT_IMAGE_SIZE
        state_dict = checkpoint

    model = build_model(architecture, len(class_names))
    model.load_state_dict(state_dict)
    model = model.to(device)
    model.eval()

    return {
        "model": model,
        "model_path": model_path,
        "architecture": architecture,
        "class_names": class_names,
        "image_size": image_size,
    }


def load_csv_rows(csv_path):
    if not os.path.exists(csv_path):
        return []
    with open(csv_path, "r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def build_runtime_disease_database(class_names):
    # Try metadata dir first, then fallback to current directory
    def get_csv_path(filename):
        p1 = os.path.join(METADATA_DIR, filename)
        p2 = os.path.join(SCRIPT_DIR, filename)
        return p1 if os.path.exists(p1) else p2

    products_rows = load_csv_rows(get_csv_path("products.csv"))
    remedies_rows = load_csv_rows(get_csv_path("remedies.csv"))
    severity_rows = load_csv_rows(get_csv_path("severity.csv"))

    runtime = defaultdict(lambda: {
        "name_en": "",
        "name_ur": "",
        "emoji": "🩺",
        "severity": [],
        "symptoms": [],
        "causes": [],
        "treatment": [],
        "products": [],
        "remedies": [],
    })

    def ensure_entry(condition_name):
        key = normalize_key(condition_name)
        entry = runtime[key]
        if not entry["name_en"]:
            entry["name_en"] = condition_name
            entry["name_ur"] = condition_name
        return entry

    for row in products_rows:
        condition_name = safe_text(row.get("Condition"))
        if not condition_name:
            continue
        entry = ensure_entry(condition_name)
        product_name = safe_text(row.get("Name"))
        brand_name = safe_text(row.get("Brand"))
        if product_name:
            entry["products"].append({
                "name": product_name,
                "brand": brand_name,
                "category": safe_text(row.get("Category")),
                "price": safe_text(row.get("Price")),
                "tier": safe_text(row.get("Tier")),
            })

    for row in remedies_rows:
        condition_name = safe_text(row.get("Condition"))
        if not condition_name:
            continue
        entry = ensure_entry(condition_name)
        for remedy_value in [row.get("Remedy_1"), row.get("Remedy_2"), row.get("Remedy_3")]:
            remedy_text = safe_text(remedy_value)
            if remedy_text:
                entry["remedies"].append(remedy_text)
                entry["treatment"].append(remedy_text)

    for row in severity_rows:
        condition_name = safe_text(row.get("Condition"))
        if not condition_name:
            continue
        entry = ensure_entry(condition_name)

        severity_value = safe_text(row.get("Severity"))
        if severity_value:
            entry["severity"].append(severity_value)

        sub_issue = safe_text(row.get("Sub_Issue"))
        if sub_issue and sub_issue.lower() != "none":
            entry["symptoms"].append(sub_issue)

        advice = safe_text(row.get("Advice"))
        if advice:
            entry["treatment"].append(f"Advice: {advice}")

        doctor_required = safe_text(row.get("Doctor_Required"))
        if doctor_required:
            entry["treatment"].append(f"Doctor required: {doctor_required}")

        for field_name, label in [
            ("Dos", "Dos"),
            ("Donts", "Donts"),
            ("Morning_Routine", "Morning routine"),
            ("Night_Routine", "Night routine"),
        ]:
            field_value = safe_text(row.get(field_name))
            if field_value:
                for item in split_items(field_value):
                    entry["treatment"].append(f"{label}: {item}")

    for class_name in class_names:
        ensure_entry(class_name)

    runtime_database = {}
    for normalized_key, entry in runtime.items():
        entry["severity"] = unique_list(entry["severity"])
        entry["symptoms"] = unique_list(entry["symptoms"])
        entry["causes"] = unique_list(entry["causes"]) or [
            "Condition-specific causes are not explicitly listed in the metadata."
        ]
        entry["treatment"] = unique_list(entry["treatment"]) or [
            "See the condition-specific advice in the metadata."
        ]
        entry["products"] = entry["products"]
        entry["remedies"] = unique_list(entry["remedies"])
        runtime_database[normalized_key] = entry

    return runtime_database


MODEL_INFO = load_checkpoint()
MODEL_PATH = MODEL_INFO["model_path"]
MODEL_ARCHITECTURE = MODEL_INFO["architecture"]
CLASSES = MODEL_INFO["class_names"]
IMAGE_SIZE = MODEL_INFO["image_size"]
model = MODEL_INFO["model"]
RUNTIME_DISEASE_DATABASE = build_runtime_disease_database(CLASSES)

print(f"[INFO] Model loaded successfully from {MODEL_PATH}")
print(f"[INFO] Architecture: {MODEL_ARCHITECTURE} | Classes: {len(CLASSES)} | Image size: {IMAGE_SIZE}")

# ============================================================================
# DISEASE DATABASE (Same as disease-detector.js)
# ============================================================================

DISEASE_DATABASE = {
    'acne': {
        'name_en': 'Acne Vulgaris',
        'name_ur': 'مہاسے',
        'emoji': '🔴',
        'severity': ['Mild Acne', 'Moderate Acne', 'Severe Acne', 'Cystic Acne'],
        'symptoms': [
            'Blackheads and whiteheads',
            'Red inflamed pimples',
            'Pustules (pus-filled bumps)',
            'Cystic acne (deep, painful nodules)',
            'Oily skin',
            'Possible scarring'
        ],
        'causes': [
            'Bacteria (Cutibacterium acnes)',
            'Excess sebum production',
            'Hair follicle clogging',
            'Hormonal changes',
            'Poor skincare routine',
            'Diet (dairy, high glycemic foods)'
        ],
        'treatment': [
            '🧼 Salicylic acid cleanser (2x daily)',
            '💊 Benzoyl peroxide (2.5-10%)',
            '🧴 Oil-free moisturizer',
            '⚕️ Dermatologist: Retinoids, Antibiotics, Isotretinoin (severe)',
            '🌞 Sunscreen SPF 30+',
            '☀️ Avoid: Dairy, high sugar, oil-based cosmetics'
        ],
        'products': [
            {'name': 'Salicylic Acid Cleanser', 'brand': 'CeraVe'},
            {'name': 'Benzoyl Peroxide 5%', 'brand': 'Neutrogena'},
            {'name': 'Niacinamide + Zinc', 'brand': 'The Ordinary'},
            {'name': 'Azelaic Acid 20%', 'brand': 'The Ordinary'}
        ]
    },
    'dry': {
        'name_en': 'Dermatitis / Xerosis (Dry Skin Condition)',
        'name_ur': 'خشک جلد',
        'emoji': '🏜️',
        'severity': ['Mild Dryness', 'Moderate Dryness', 'Severe Xerosis', 'Eczema-like'],
        'symptoms': [
            'Tightness, especially after cleansing',
            'Visible flaking or scaling',
            'Rough, sandpaper-like texture',
            'Itching (pruritis)',
            'Redness or irritation',
            'Fine lines appear more pronounced'
        ],
        'causes': [
            'Low humidity environment',
            'Over-washing or hot water',
            'Harsh soaps/detergents',
            'Genetics (atopic predisposition)',
            'Nutritional deficiency',
            'Underlying conditions (eczema, psoriasis)'
        ],
        'treatment': [
            '💧 Hydrating cleanser (low pH)',
            '🧴 Rich moisturizing cream (ceramides, hyaluronic acid)',
            '🌡️ Humidifier at night',
            '🧴 Apply moisturizer to damp skin',
            '💊 Hydrating masks 2-3x/week',
            '⚕️ Dermatologist: Topical corticosteroids if severe'
        ],
        'products': [
            {'name': 'Hydrating Facial Cleanser', 'brand': 'CeraVe'},
            {'name': 'Hyaluronic Acid 2% + B5', 'brand': 'The Ordinary'},
            {'name': 'Ceramide Moisturizing Cream', 'brand': 'Cetaphil'},
            {'name': 'Humectant Toner', 'brand': 'Isntree'}
        ]
    },
    'oily': {
        'name_en': 'Seborrheic / Oily Skin Condition',
        'name_ur': 'تیل والی جلد',
        'emoji': '💧',
        'severity': ['Mild Oiliness', 'Moderate Sebum', 'Severe Oiliness', 'Seborrhea'],
        'symptoms': [
            'Shiny appearance, especially T-zone',
            'Large, visible pores',
            'Frequent breakouts',
            'Foundation wear-off by mid-day',
            'Greasy hair (if present)',
            'Possible seborrheic dermatitis'
        ],
        'causes': [
            'Overactive sebaceous glands',
            'Genetics',
            'Hormonal fluctuations',
            'Hot/humid climate',
            'Improper skincare',
            'Stress'
        ],
        'treatment': [
            '🧼 Foaming gel or micellar cleanser',
            '🧊 Oil-free, water-based moisturizer',
            '🥒 Niacinamide serum (regulates sebum)',
            '🧖 Weekly clay or charcoal mask',
            '💊 Salicylic acid 2-3x/week',
            '☀️ Mattifying sunscreen'
        ],
        'products': [
            {'name': 'Foaming Gel Cleanser', 'brand': 'La Roche-Posay'},
            {'name': 'Niacinamide 10% + Zinc 1%', 'brand': 'The Ordinary'},
            {'name': 'Clay Mask', 'brand': 'Aztec Secret'},
            {'name': 'Mattifying Primer', 'brand': 'Benefit'}
        ]
    },
    'normal': {
        'name_en': 'Healthy / Normal Skin',
        'name_ur': 'صحت مند جلد',
        'emoji': '✅',
        'severity': ['Optimal', 'Well-Balanced'],
        'symptoms': [
            'Smooth, radiant texture',
            'Balanced oil production',
            'Few or no breakouts',
            'No excessive dryness or oiliness',
            'Even skin tone'
        ],
        'causes': [
            'Genetics (good skin predisposition)',
            'Consistent skincare routine',
            'Healthy diet and hydration',
            'Good sleep and stress management'
        ],
        'treatment': [
            '✓ Maintain daily skincare routine',
            '✓ Gentle cleanser morning & night',
            '✓ Light moisturizer',
            '✓ Daily SPF 30+ sunscreen',
            '✓ Weekly gentle exfoliation',
            '✓ Stay hydrated (8+ glasses water/day)'
        ],
        'products': [
            {'name': 'Gentle Skin Cleanser', 'brand': 'Cetaphil'},
            {'name': 'Daily Moisturizing Lotion', 'brand': 'CeraVe'},
            {'name': 'Daily UV Defender SPF 50', 'brand': 'L\'Oreal'},
            {'name': 'Gentle Exfoliator', 'brand': 'Cosrx'}
        ]
    },
    'pigmentation': {
        'name_en': 'Hyperpigmentation / Melasma',
        'name_ur': 'داغ / رنگین جلد',
        'emoji': '🌑',
        'severity': ['Mild Spots', 'Moderate Discoloration', 'Severe Melasma', 'Extensive PIH'],
        'symptoms': [
            'Dark brown or black patches',
            'Uneven skin tone',
            'Sun spots (age spots, lentigines)',
            'Melasma (symmetric patches)',
            'Post-inflammatory hyperpigmentation',
            'Freckles or increased freckling'
        ],
        'causes': [
            'Excessive sun exposure (UV damage)',
            'Genetics (darker skin tones more prone)',
            'Hormonal changes (pregnancy, birth control)',
            'Post-inflammatory (acne, eczema scars)',
            'Certain medications',
            'Aging'
        ],
        'treatment': [
            '🌞 Strict SPF 50+ sunscreen (daily!)',
            '🧴 Vitamin C serum (brightening)',
            '💊 Hydroquinone 2-4% (dermatologist prescribed)',
            '🧴 Retinoids/Tretinoin (cell turnover)',
            '⚕️ Laser treatment (professional)',
            '🧖 Niacinamide + kojic acid serum'
        ],
        'products': [
            {'name': 'Vitamin C Brightening Serum', 'brand': 'SkinCeuticals'},
            {'name': 'Azelaic Acid 20%', 'brand': 'The Ordinary'},
            {'name': 'Niacinamide + Kojic Acid', 'brand': 'Cosrx'},
            {'name': 'SPF 50+ Sunscreen', 'brand': 'Neutrogena'}
        ]
    }
}

# ============================================================================
# IMAGE PREPROCESSING
# ============================================================================

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                        std=[0.229, 0.224, 0.225])
])


def get_disease_entry(disease_name):
    if disease_name in DISEASE_DATABASE:
        return DISEASE_DATABASE[disease_name]

    normalized_name = normalize_key(disease_name)
    if normalized_name in RUNTIME_DISEASE_DATABASE:
        return RUNTIME_DISEASE_DATABASE[normalized_name]

    fallback_name = safe_text(disease_name).replace("_", " ").strip().title() or "Unknown Condition"
    return {
        "name_en": fallback_name,
        "name_ur": fallback_name,
        "emoji": "🩺",
        "severity": [],
        "symptoms": ["No metadata entry was found for this condition."],
        "causes": ["Condition-specific causes are not available in the metadata."],
        "treatment": ["Please review the model output and the available condition metadata."],
        "products": [],
        "remedies": [],
    }

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    """
    Main endpoint for skin disease diagnosis
    
    Request:
        - POST /api/diagnose
        - multipart/form-data with 'image' field
    
    Response:
        {
            "status": "success" or "error",
            "disease": "acne",
            "confidence": 0.95,
            "message": "Acne Vulgaris detected",
            "urdu_message": "مہاسے محسوس ہوا",
            "details": { ... disease details ... },
            "request_retry": false or true (if unclear)
        }
    """
    
    try:
        # Check if image provided
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image provided',
                'request_retry': True
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No image selected',
                'request_retry': True
            }), 400
        
        # Open and process image
        image = Image.open(file.stream).convert('RGB')
        
        # 1. Black image check
        img_np = np.array(image)
        mean_brightness = np.mean(img_np)
        if mean_brightness < 12.0:
            return jsonify({
                'status': 'unclear',
                'confidence': 0.0,
                'message': 'Black image detected. Please upload a clear, visible photo of your skin.',
                'urdu_message': 'سیاہ تصویر پائی گئی ہے۔ براہ کرم جلد کے حصے کی واضح تصویر اپ لوڈ کریں۔',
                'request_retry': True,
                'image_quality': {
                    'brightness': round(mean_brightness, 2),
                    'contrast': 0.0,
                    'edge_strength': 0.0,
                    'issues': ['too_dark', 'black_image'],
                    'severe_quality_issue': True
                },
                'model_scores': {}
            }), 200

        # Calculate skin presence first to contextually understand the image
        r = img_np[:, :, 0].astype(float)
        g = img_np[:, :, 1].astype(float)
        b = img_np[:, :, 2].astype(float)
        
        # Peer et al. RGB skin detection rule
        skin_rgb = (
            (r > 95) & (g > 40) & (b > 20) &
            (np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b) > 15) &
            (np.abs(r - g) > 15) &
            (r > g) & (r > b)
        )
        
        # YCbCr skin detection rule (robust for all skin tones under varying lighting)
        cb = -0.168736 * r - 0.331264 * g + 0.5 * b + 128
        cr = 0.5 * r - 0.418688 * g - 0.081312 * b + 128
        skin_ycbcr = (cb >= 65) & (cb <= 135) & (cr >= 128) & (cr <= 180)
        
        # HSV skin detection rule (highly robust for close-ups & various skin conditions)
        hsv_np = np.array(image.convert("HSV"))
        h = hsv_np[:, :, 0] / 255.0 * 360.0  # scale to 0-360
        s = hsv_np[:, :, 1] / 255.0
        v = hsv_np[:, :, 2] / 255.0
        skin_hsv = (h >= 0) & (h <= 50) & (s >= 0.1) & (s <= 0.9) & (v >= 0.15)

        skin_mask = skin_rgb | skin_ycbcr | skin_hsv
        skin_pixels = np.sum(skin_mask)
        total_pixels = img_np.shape[0] * img_np.shape[1]
        skin_pct = skin_pixels / total_pixels

        # Assess standard image quality (for information only, we do NOT reject)
        image_quality = assess_image_quality(image)

        # Run PyTorch model inference
        image_tensor = transform(image).unsqueeze(0).to(device)
        with torch.inference_mode():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)[0]
        
        # Get predictions
        pred_scores = {CLASSES[i]: float(probabilities[i].cpu()) for i in range(len(CLASSES))}
        sorted_predictions = sorted(pred_scores.items(), key=lambda x: x[1], reverse=True)
        top1_class, top1_conf = sorted_predictions[0]
        top2_class, top2_conf = sorted_predictions[1] if len(sorted_predictions) > 0 else (None, 0.0)

        # Check if the image is a skin image
        # Non-skin images will have very low skin percentage and low prediction confidence.
        # Close-up skin pictures are accepted even if skin_pct is low (because top1_conf will be higher)
        # and normal skin close-ups are accepted because skin_pct will be high.
        is_skin = (skin_pct >= 0.12) or (top1_conf >= 0.30)
        if not is_skin:
            return jsonify({
                'status': 'unclear',
                'confidence': 0.0,
                'message': 'No skin detected. Please upload a clear photo of your skin focusing on the affected area.',
                'urdu_message': 'جلد کی شناخت نہیں ہوسکی۔ براہ کرم اپنی جلد کی واضح تصویر اپ لوڈ کریں۔',
                'request_retry': True,
                'image_quality': {
                    'brightness': round(mean_brightness, 2),
                    'contrast': round(image_quality['contrast'], 2) if 'contrast' in image_quality else 0.0,
                    'edge_strength': round(image_quality['edge_strength'], 2) if 'edge_strength' in image_quality else 0.0,
                    'issues': ['no_skin_detected'],
                    'severe_quality_issue': True
                },
                'model_scores': {}
            }), 200

        # Determine shot type: close-up vs distant
        if skin_pct >= 0.35 or top1_conf >= 0.25:
            shot_type = "close-up"
        else:
            shot_type = "distant"

        predicted_class = top1_class
        confidence_note = None
        if top1_conf < 0.70:
            primary_entry = get_disease_entry(top1_class)
            secondary_entry = get_disease_entry(top2_class) if top2_class else None
            if top1_conf < 0.45:
                confidence_note = f"Low confidence. Primary guess: {primary_entry['name_en']}"
            else:
                confidence_note = f"Moderate confidence. Primary: {primary_entry['name_en']}"

            if secondary_entry and (top1_conf - top2_conf) < 0.12:
                confidence_note += f", also consider: {secondary_entry['name_en']}"

        disease_info = get_disease_entry(predicted_class)

        response_data = {
            'status': 'success',
            'disease': predicted_class,
            'confidence': top1_conf,
            'emoji': disease_info['emoji'],
            'message': f"Detected: {disease_info['name_en']} ({shot_type.title()} View)",
            'urdu_message': f"Detected: {disease_info['name_ur']} ({shot_type.title()} View)",
            'details': {
                'name_en': disease_info['name_en'],
                'name_ur': disease_info['name_ur'],
                'symptoms': disease_info['symptoms'],
                'causes': disease_info['causes'],
                'treatment': disease_info['treatment'],
                'products': disease_info['products'],
                'severity': disease_info.get('severity', []),
                'remedies': disease_info.get('remedies', [])
            },
            'skin_analysis': {
                'skin_detected': True,
                'skin_percentage': round(skin_pct * 100, 2),
                'shot_type': shot_type
            },
            'model_scores': pred_scores,
            'request_retry': False
        }

        if confidence_note:
            response_data['confidence_note'] = confidence_note
            response_data['secondary_condition'] = top2_class
            response_data['secondary_confidence'] = top2_conf

        return jsonify(response_data), 200

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # SMART LOGIC: Handle model uncertainty
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        # If top 2 predictions are too close, ask for clarity
        if top2_class and (top1_conf - top2_conf) < 0.15:
            return jsonify({
                'status': 'unclear',
                'confidence': top1_conf,
                'message': 'Multiple conditions detected (combination skin). Please upload a clearer photo of the specific area.',
                'urdu_message': 'متعدد حالات محسوس ہوے۔ براہ کرم کسی خاص حصے کی واضح تصویر اپ لوڈ کریں۔',
                'request_retry': True,
                'model_scores': pred_scores,
                'note': 'This may be combination skin or unclear image'
            }), 200
        
        # If confidence is too low, ask for retry
        if top1_conf < 0.50:
            return jsonify({
                'status': 'unclear',
                'confidence': top1_conf,
                'message': 'Image not clear enough. Please upload a clearer, well-lit photo of your skin.',
                'urdu_message': 'تصویر صاف نہیں ہے۔ براہ کرم اچھی روشنی میں واضح تصویر اپ لوڈ کریں۔',
                'request_retry': True,
                'model_scores': pred_scores
            }), 200
        
        # If confidence is medium but seems uncertain, be cautious
        predicted_class = top1_class
        confidence_note = None
        if 0.50 <= top1_conf < 0.70:
            # Lower confidence - add secondary recommendation
            primary_entry = get_disease_entry(top1_class)
            secondary_entry = get_disease_entry(top2_class) if top2_class else None
            confidence_note = (
                f"⚠️ Moderate confidence. Primary: {primary_entry['name_en']}"
                + (f", Consider also: {secondary_entry['name_en']}" if secondary_entry else "")
            )
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # DIAGNOSIS MADE - Return full details
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        disease_info = get_disease_entry(predicted_class)

        response_data = {
            'status': 'success',
            'disease': predicted_class,
            'confidence': top1_conf,
            'emoji': disease_info['emoji'],
            'message': f"🔍 Detected: {disease_info['name_en']}",
            'urdu_message': f"🔍 محسوس ہوا: {disease_info['name_ur']}",
            'details': {
                'name_en': disease_info['name_en'],
                'name_ur': disease_info['name_ur'],
                'symptoms': disease_info['symptoms'],
                'causes': disease_info['causes'],
                'treatment': disease_info['treatment'],
                'products': disease_info['products'],
                'severity': disease_info.get('severity', []),
                'remedies': disease_info.get('remedies', [])
            },
            'model_scores': pred_scores,
            'request_retry': False
        }
        
        # Add confidence note if applicable
        if confidence_note:
            response_data['confidence_note'] = confidence_note
            response_data['secondary_condition'] = top2_class
            response_data['secondary_confidence'] = top2_conf
        
        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'request_retry': True
        }), 500

@app.route('/api/disease/<disease_name>', methods=['GET'])
def get_disease_info(disease_name):
    """
    Get detailed disease information
    
    GET /api/disease/acne
    """
    
    supported_names = set(CLASSES) | set(DISEASE_DATABASE.keys())
    if disease_name not in supported_names and normalize_key(disease_name) not in RUNTIME_DISEASE_DATABASE:
        return jsonify({
            'status': 'error',
            'message': f'Disease "{disease_name}" not found'
        }), 404
    
    disease_details = get_disease_entry(disease_name)
    return jsonify({
        'status': 'success',
        'disease': disease_name,
        'details': disease_details
    }), 200

@app.route('/api/diseases', methods=['GET'])
def list_diseases():
    """
    List all supported diseases
    """
    diseases_list = []
    for key in CLASSES:
        info = get_disease_entry(key)
        diseases_list.append({
            'id': key,
            'name_en': info['name_en'],
            'name_ur': info['name_ur'],
            'emoji': info['emoji'],
            'severity': info.get('severity', [])
        })
    
    return jsonify({
        'status': 'success',
        'diseases': diseases_list
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'Skin Disease Detection API is running',
        'model': MODEL_ARCHITECTURE,
        'image_size': IMAGE_SIZE,
        'model_path': MODEL_PATH,
        'classes': CLASSES,
        'class_count': len(CLASSES),
        'version': '1.0'
    }), 200

# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == '__main__':
    server_port = int(os.environ.get("PORT", "5000"))
    print("=" * 60)
    print("🚀 SKIN DISEASE DETECTION API")
    print("=" * 60)
    print(f"\nModel: {MODEL_ARCHITECTURE}")
    print(f"Classes: {len(CLASSES)}")
    print(f"Checkpoint: {MODEL_PATH}")
    print("\nEndpoints:")
    print("  POST /api/diagnose - Upload image & get diagnosis")
    print("  GET  /api/disease/<name> - Get disease details")
    print("  GET  /api/diseases - List all diseases")
    print("  GET  /api/health - Health check")
    print(f"\nServer running on: http://localhost:{server_port}")
    print("=" * 60 + "\n")
    
    app.run(debug=False, host='0.0.0.0', port=server_port)
