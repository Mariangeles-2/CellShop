import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

// Esquema para los productos con validaciones
const productSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    title: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
        maxlength: [100, 'El título no puede exceder 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio debe ser mayor a 0']
    },
    thumbnails: [{
        type: String
    }],
    code: {
        type: String,
        required: [true, 'El código es obligatorio'],
        unique: true,
        trim: true,
        uppercase: true
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser negativo'],
        validate: {
            validator: Number.isInteger,
            message: 'El stock debe ser un número entero'
        }
    },
    category: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        trim: true,
        enum: {
            values: ['smartphones', 'tablets', 'accessories', 'smartwatches'],
            message: 'La categoría debe ser: smartphones, tablets, accessories o smartwatches'
        }
    },
}, {
    timestamps: true, // Agrega fecha de creación y de modificación
    versionKey: false
});

// Índices para mejorar performance
productSchema.index({ code: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

// Convertidor de código a mayúsculas
productSchema.pre('save', function(next) {
    if (this.code) {
        this.code = this.code.toUpperCase();
    }
    next();
});

// Formatear el precio
productSchema.virtual('formattedPrice').get(function() {
    return `$${this.price.toLocaleString()}`;
});

// Verificación de disponibilidad
productSchema.methods.isAvailable = function() {
    return this.stock > 0;
};

// Busqueda por categoría
productSchema.statics.findByCategory = function(category) {
    return this.find({ category });
};

// Configuración de toJSON
productSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        return ret;
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
