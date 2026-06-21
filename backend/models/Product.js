const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['remedy', 'product'], 
        required: true 
    },
    price: { 
        type: Number 
    },
    imageUrl: { 
        type: String 
    },
    targetDiseases: [{
        type: String
    }],
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
