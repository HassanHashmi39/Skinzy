const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skinzy';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');
    
    await Product.deleteMany({});
    
    const products = [
        // ACNE & COMEDONES
        { name: 'MandelAC Serum (Mandelic Acid)', description: 'Targets acne, Gentle exfoliation, Dermatologist recommended', type: 'product', price: 1598, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', targetDiseases: ['acne_vulgaris', 'comedones'] },
        { name: 'PanOxyl Benzoyl Peroxide 5% Wash', description: 'Kills acne-causing bacteria, reduces inflammation', type: 'product', price: 1250, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/pan/pan10460/l/34.jpg', targetDiseases: ['acne_vulgaris', 'comedones'] },
        { name: 'Glycolic Acid 7% Toning Solution', description: 'Chemical exfoliation for blackheads and whiteheads', type: 'product', price: 2100, imageUrl: 'https://images.unsplash.com/photo-1629367304193-27ccfcc94943?auto=format&fit=crop&w=600&q=80', targetDiseases: ['comedones', 'acne_vulgaris', 'milia'] },
        
        // ECZEMA & PSORIASIS
        { name: 'Aveeno Eczema Therapy Cream', description: 'Soothes itching and repairs skin barrier', type: 'product', price: 1450, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/avo/avo05244/l/1.jpg', targetDiseases: ['eczema_atopic_dermatitis', 'psoriasis'] },
        { name: 'Cortizone 10 Maximum Strength', description: 'Reduces redness and inflammation (short-term use)', type: 'product', price: 850, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/ctz/ctz10464/l/16.jpg', targetDiseases: ['eczema_atopic_dermatitis', 'perioral_dermatitis'] },
        { name: 'Coal Tar Ointment', description: 'Slows down rapid skin cell growth in psoriasis', type: 'product', price: 1100, imageUrl: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=600&q=80', targetDiseases: ['psoriasis'] },
        { name: 'Salicylic Acid Scalp Treatment', description: 'Removes thick scales on the scalp', type: 'product', price: 1800, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', targetDiseases: ['psoriasis', 'seborrheic_keratosis'] },

        // ROSACEA & SENSITIVE SKIN
        { name: "Paula's Choice 10% Azelaic Acid", description: 'Reduces redness, swelling, and rosacea bumps', type: 'product', price: 1950, imageUrl: 'https://theskinfit.com/cdn/shop/files/Jenpharm_MandelAC_Serum_20ml_2.png?v=1768385233', targetDiseases: ['rosacea', 'acne_vulgaris', 'melasma'] },
        { name: 'Centella Asiatica (Cica) Serum', description: 'Calms highly irritated and flushed skin', type: 'product', price: 2400, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80', targetDiseases: ['rosacea', 'perioral_dermatitis', 'normal'] },

        // MELASMA & PIGMENTATION
        { name: 'The Ordinary Niacinamide 10% + Zinc 1%', description: 'Fades stubborn dark patches and melasma', type: 'product', price: 2800, imageUrl: 'https://dermasation.com/cdn/shop/files/Retinol-face-serum_78d94f24-d199-4200-9223-71f5ff8b9d8e.jpg?v=1758120365', targetDiseases: ['melasma'] },
        { name: 'Kojic Acid Brightening Soap', description: 'Evens out skin tone naturally', type: 'product', price: 650, imageUrl: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=600&q=80', targetDiseases: ['melasma'] },

        // FUNGAL INFECTIONS
        { name: 'Lotrimin AF Antifungal Cream', description: 'Treats ringworm and tinea infections', type: 'product', price: 450, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/lot/lot01222/l/9.jpg', targetDiseases: ['fungal_infection_tinea_faciei'] },
        { name: 'Nizoral Anti-Dandruff Shampoo', description: 'Medicated wash for fungal overgrowth', type: 'product', price: 850, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/jnj/jnj05016/l/11.jpg', targetDiseases: ['fungal_infection_tinea_faciei'] },

        // VIRAL (WARTS & COLD SORES)
        { name: 'Compound W Wart Plasters', description: 'Painlessly removes common warts over time', type: 'product', price: 550, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cmw/cmw10102/l/2.jpg', targetDiseases: ['warts'] },
        { name: 'Compound W Freeze Off', description: 'Over-the-counter cryotherapy for warts', type: 'product', price: 1950, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cmw/cmw10103/l/1.jpg', targetDiseases: ['warts'] },
        { name: 'Abreva Cold Sore Cream', description: 'Speeds healing of cold sores on lips', type: 'product', price: 1200, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/gsk/gsk01344/l/1.jpg', targetDiseases: ['herpes_simplex_cold_sores'] },

        // URTICARIA & ALLERGIES
        { name: 'Benadryl Itch Relief Cream', description: 'Topical antihistamine for hives and rashes', type: 'product', price: 600, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/bdy/bdy01010/l/4.jpg', targetDiseases: ['urticaria', 'exanthems_and_drug_eruptions'] },
        { name: 'Menthol Soothing Calamine Lotion', description: 'Cooling relief for itchy bug bites and hives', type: 'product', price: 450, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/hml/hml00401/l/4.jpg', targetDiseases: ['urticaria', 'bullous_disease'] },

        // SEVERE/MEDICAL SUPPORT (Cellulitis, Lupus, Cancers, Vasculitis)
        // These conditions need RX, but we provide supportive care products
        { name: 'Hibiclens Antiseptic Wash', description: 'Prevents secondary infections on broken skin', type: 'product', price: 950, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/hbc/hbc10234/l/1.jpg', targetDiseases: ['cellulitis', 'bullous_disease'] },
        { name: 'CeraVe Healing Ointment', description: 'Protects compromised skin barriers', type: 'product', price: 3200, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cet/cet88917/l/24.jpg', targetDiseases: ['lupus', 'vasculitis', 'bullous_disease', 'exanthems_and_drug_eruptions'] },
        { name: 'Neutrogena Sheer Zinc Face SPF 50', description: 'Maximum UV protection for photosensitive conditions', type: 'product', price: 2100, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/neu/neu01041/l/10.jpg', targetDiseases: ['lupus', 'melanoma', 'basal_cell_carcinoma', 'actinic_keratosis', 'melasma', 'normal'] },

        // GENERAL EVERYDAY ESSENTIALS
        { name: 'Cetaphil Gentle Skin Cleanser', description: 'Removes excess oil, Gentle on sensitive skin', type: 'product', price: 2500, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cet/cet88874/l/10.jpg', targetDiseases: ['normal', 'eczema_atopic_dermatitis', 'psoriasis'] },
        { name: 'CeraVe Renewing SA Cleanser', description: 'Exfoliating, For rough & bumpy skin, With ceramides', type: 'product', price: 3800, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cet/cet88917/l/24.jpg', targetDiseases: ['comedones', 'milia', 'seborrheic_keratosis'] },
        { name: 'Olay Regenerist Micro-Sculpting Cream', description: 'Reduces fine lines, Deeply hydrates', type: 'product', price: 950, imageUrl: 'https://jenpharm.com/cdn/shop/files/Dermive-oil-free.png?v=1767271488', targetDiseases: ['normal', 'actinic_keratosis'] },
        { name: 'The Ordinary Niacinamide 10%', description: 'Pore tightening, Oil control, Brightens tone', type: 'product', price: 1850, imageUrl: 'https://beautyvoc.com.pk/cdn/shop/files/VitaminCFacewash.jpg?v=1762189678', targetDiseases: ['normal', 'acne_vulgaris', 'rosacea', 'melasma'] },
        { name: 'CeraVe Resurfacing Retinol Serum', description: 'Anti-aging, Cell renewal, Vibrant skin', type: 'product', price: 2150, imageUrl: 'https://jenpharm.com/cdn/shop/files/Dermive-oil-free.png?v=1767271488', targetDiseases: ['normal', 'milia'] },
        { name: 'Vince Vitamin C Face Wash', description: 'Deep cleansing, Skin brightening, Budget friendly', type: 'product', price: 899, imageUrl: 'https://beautyvoc.com.pk/cdn/shop/files/VitaminCFacewash.jpg?v=1762189678', targetDiseases: ['normal', 'melasma', 'actinic_keratosis'] },
        
        // REQUESTED AI RECOMMENDATION PRODUCTS
        { name: 'Salicylic Acid Cleanser', description: 'Gentle exfoliating cleanser with salicylic acid', type: 'product', price: 2200, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/cet/cet88917/l/24.jpg', targetDiseases: ['normal', 'acne_vulgaris', 'comedones', 'milia'] },
        { name: 'Niacinamide Serum', description: 'Reduces blemishes and congestion', type: 'product', price: 1500, imageUrl: 'https://beautyvoc.com.pk/cdn/shop/files/VitaminCFacewash.jpg?v=1762189678', targetDiseases: ['normal', 'acne_vulgaris', 'rosacea', 'melasma'] },
        { name: 'Clay Mask (Weekly)', description: 'Deep cleansing clay mask for weekly use', type: 'product', price: 1200, imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80', targetDiseases: ['normal', 'comedones', 'acne_vulgaris'] },
        { name: 'Daily Moisturizing Lotion', description: 'Lightweight, oil-free hydration for everyday use', type: 'product', price: 1800, imageUrl: 'https://jenpharm.com/cdn/shop/files/Dermive-oil-free.png?v=1767271488', targetDiseases: ['normal', 'eczema_atopic_dermatitis', 'rosacea'] },
        { name: 'Daily UV Defender SPF 50', description: 'Broad spectrum UVA/UVB protection', type: 'product', price: 2100, imageUrl: 'https://jenpharm.com/cdn/shop/files/3_8.jpg?v=1767272401', targetDiseases: ['normal', 'melasma', 'lupus', 'actinic_keratosis'] },
        { name: 'Gentle Exfoliator', description: 'Mild chemical exfoliator for smooth skin texture', type: 'product', price: 2400, imageUrl: 'https://images.unsplash.com/photo-1629367304193-27ccfcc94943?auto=format&fit=crop&w=600&q=80', targetDiseases: ['normal', 'comedones', 'milia'] },
        
        // REMEDIES
        { name: 'Rose Water & Glycerin Toner', description: '2 tbsp Rose Water, 1 tsp Glycerin, 1 cup Distilled Water', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&w=600&q=80', targetDiseases: ['normal', 'eczema_atopic_dermatitis', 'rosacea', 'perioral_dermatitis'] },
        { name: 'Turmeric & Honey Face Mask', description: '1 tsp Turmeric Powder, 2 tbsp Raw Honey, 1 tbsp Yogurt', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1615486171448-4d6d21650119?auto=format&fit=crop&w=600&q=80', targetDiseases: ['normal', 'acne_vulgaris', 'melasma'] },
        { name: 'Aloe Vera Gel Treatment', description: 'Fresh Aloe Vera Gel (from plant) Or Pure 100% Aloe Vera Gel', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cb5b8eecd34?auto=format&fit=crop&w=600&q=80', targetDiseases: ['normal', 'acne_vulgaris', 'sunburn', 'urticaria', 'exanthems_and_drug_eruptions', 'fungal_infection_tinea_faciei'] },
        { name: 'Green Tea Ice Cubes', description: '2 Green Tea Bags, 1 cup Boiling Water, Ice Cube Tray', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1627492225672-9fc31a684b39?auto=format&fit=crop&w=600&q=80', targetDiseases: ['normal', 'rosacea', 'melasma'] },
        { name: 'Cucumber & Milk Face Pack', description: '1/2 Cucumber (grated), 2 tbsp Milk, 1 tsp Gram Flour', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1449339854873-750e6913301b?auto=format&fit=crop&w=600&q=80', targetDiseases: ['normal', 'actinic_keratosis'] },
        { name: 'Gram Flour & Yogurt Scrub', description: '2 tbsp Gram Flour, 1 tbsp Yogurt, Pinch of Turmeric', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=600&q=80', targetDiseases: ['comedones', 'milia'] },
        { name: 'Neem & Tea Tree Spot Treatment', description: '5-6 Neem Leaves, 2 drops Tea Tree Oil, 1 tsp Honey', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', targetDiseases: ['acne_vulgaris', 'comedones'] },
        { name: 'Virgin Coconut Oil Moisturizer', description: 'Virgin Coconut Oil', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1611078500755-e97072c4e3b1?auto=format&fit=crop&w=600&q=80', targetDiseases: ['eczema_atopic_dermatitis', 'psoriasis'] },
        { name: 'Cold Compress Therapy', description: 'Clean cloth soaked in ice cold water. Apply to affected area to reduce swelling and heat.', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1550503032-4752b04f7f5d?auto=format&fit=crop&w=600&q=80', targetDiseases: ['herpes_simplex_cold_sores', 'cellulitis', 'bullous_disease', 'vascular_tumors', 'vasculitis', 'melanoma', 'basal_cell_carcinoma', 'lupus'] },
        { name: 'Apple Cider Vinegar Dab', description: 'Dilute ACV with water (1:3 ratio). Apply to warts with a cotton swab.', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1582210872650-20518dc90eeb?auto=format&fit=crop&w=600&q=80', targetDiseases: ['warts', 'seborrheic_keratosis'] },
        { name: 'Honey Spot Application', description: 'Raw honey applied directly to pimples (15-20 minutes, then rinse)', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1587049352847-4d4b126a61fc?auto=format&fit=crop&w=600&q=80', targetDiseases: ['acne_vulgaris'] },
        { name: 'Clay Mask', description: 'Once weekly to draw out impurities and reduce oil', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=600&q=80', targetDiseases: ['comedones'] },
        { name: 'Warm Steam & Compress', description: 'Warm steam for 5-10 minutes occasionally to open pores', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1598300057065-27c1a2d52575?auto=format&fit=crop&w=600&q=80', targetDiseases: ['comedones', 'milia'] },
        { name: 'Aveeno Eczema Therapy Cream', description: 'Finely ground oatmeal in a lukewarm bath to soothe itching', type: 'remedy', price: 0, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/avo/avo05244/l/1.jpg', targetDiseases: ['eczema_atopic_dermatitis', 'psoriasis'] },
        { name: 'Aquaphor Healing Ointment', description: 'Apply to very dry areas and cracked skin to lock in moisture', type: 'remedy', price: 0, imageUrl: 'https://cloudinary.images-iherb.com/image/upload/f_auto,q_auto:eco/images/aqu/aqu63345/l/28.jpg', targetDiseases: ['eczema_atopic_dermatitis', 'herpes_simplex_cold_sores'] },
        { name: 'Cool Compress Therapy', description: 'Clean cloth soaked in cool water to reduce inflammation', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1550503032-4752b04f7f5d?auto=format&fit=crop&w=600&q=80', targetDiseases: ['exanthems_and_drug_eruptions', 'urticaria', 'rosacea'] },
        { name: 'Gentle Fragrance-Free Moisturizer', description: 'Basic hydration to protect the skin barrier', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=600&q=80', targetDiseases: ['actinic_keratosis', 'exanthems_and_drug_eruptions', 'seborrheic_keratosis', 'normal'] },
        { name: 'Daily Sun Protection', description: 'Wear a hat outdoors, stay in shade, use sunscreen', type: 'remedy', price: 0, imageUrl: 'https://images.unsplash.com/photo-1556228720-192a67285a21?auto=format&fit=crop&w=600&q=80', targetDiseases: ['actinic_keratosis', 'lupus', 'melasma', 'normal'] },
    ];
    
    await Product.insertMany(products);
    console.log('Seed successful. Added ' + products.length + ' items.');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
