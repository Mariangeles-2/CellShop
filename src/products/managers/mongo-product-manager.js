import Product from "../models/product.model.js";

class MongoProductManager {

    //Obtener todos los productos con paginación y filtros
    static async getProducts(options = {}) {
        try {
            const {
                limit = 10,
                page = 1,
                sort,
                category,
                availability
            } = options;

            // Filtros
            const filters = {};

            // Si hay category, filtrar por categoría específica
            if (category) {
                filters.category = category;
            }

            // Si hay availability, filtrar por disponibilidad
            if (availability === 'true') {
                filters.stock = {$gt: 0}; // Productos con stock mayor a 0
            } else if (availability === 'false') {
                filters.stock = 0; // Productos sin stock
            }

            // Ordenar por precio
            let sortPrice = {};
            if (sort === 'asc') {
                sortPrice.price = 1;
            } else if (sort === 'desc') {
                sortPrice.price = -1;
            }

            // Consultar con paginación
            const skip = (page - 1) * limit;
            const products = await Product.find(filters)
                .sort(sortPrice)
                .limit(limit)
                .skip(skip)
                .lean();

            // Contar total de productos buscados
            const totalProductSearch = await Product.countDocuments(filters);
            const totalPages = Math.ceil(totalProductSearch / limit);

            // Calcular páginas anterior y siguiente
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;
            const prevPage = hasPrevPage ? page - 1 : null;
            const nextPage = hasNextPage ? page + 1 : null;

            // Construir links (necesitarás ajustar la URL base según tu configuración)
            const baseUrl = '/api/products';
            const buildQueryString = (pageNum) => {
                const params = new URLSearchParams();
                if (pageNum) params.append('page', pageNum.toString());
                if (limit !== 10) params.append('limit', limit.toString());
                if (sort) params.append('sort', sort);
                if (category) params.append('category', category);
                if (availability) params.append('availability', availability);
                return params.toString() ? `?${params.toString()}` : '';
            };

            const prevLink = hasPrevPage ? `${baseUrl}${buildQueryString(prevPage)}` : null;
            const nextLink = hasNextPage ? `${baseUrl}${buildQueryString(nextPage)}` : null;

            return {
                status: 'success',
                payload: products,
                totalPages,
                prevPage,
                nextPage,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink,
                nextLink
            };

        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw new Error('Error al obtener productos de la base de datos');
        }
    }

    //Obtener producto por ID
    static async getProductById(id) {
        const product = await Product.findById(id);
        if (!product) {
            const error = new Error(`Producto con ID ${id} no encontrado`);
            error.code = 'PRODUCT_NOT_FOUND';
            throw error;
        }
        return product;
    }

    //Agregar nuevo producto
    static async addProduct(productData) {
        // Verificar código duplicado
        const existingProduct = await Product.findOne({code: productData.code});
        if (existingProduct) {
            const error = new Error(`Ya existe un producto con el código ${productData.code}`);
            error.code = 'DUPLICATE_CODE';
            throw error;
        }

        try {
            const newProduct = new Product(productData);
            await newProduct.save();
            return newProduct;
        } catch (error) {
            console.error('Error al agregar producto:', error);
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                throw new Error(`Error de validación: ${messages.join(', ')}`);
            }
            throw error;
        }
    }

    //Modificar producto
    static async updateProduct(id, updates) {

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            const error = new Error(`Producto con ID ${id} no encontrado`);
            error.code = 'PRODUCT_NOT_FOUND';
            throw error;
        }

        return updatedProduct;
    }

    //Eliminar producto
    static async deleteProduct(id) {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            const error = new Error(`Producto con ID ${id} no encontrado`);
            error.code = 'PRODUCT_NOT_FOUND';
            throw error;
        }
        return {message: 'Producto eliminado exitosamente', product: deletedProduct};
    }
}

export default MongoProductManager;
