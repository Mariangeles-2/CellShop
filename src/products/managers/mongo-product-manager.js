import Product from "../models/product.model.js";

class MongoProductManager {

    //Obtener todos los productos con paginación y filtros
    static async getProducts(options = {}) {
        try {
            const {
                limit = 10,
                page = 1,
                sort,
                query
            } = options;

            // Filtros - query representa el tipo de elemento que quiero buscar
            const filters = {};
            
            // Si hay query, aplicar filtro (en caso de no recibir query, realizar búsqueda general)
            if (query) {
                // Aquí puedes definir qué tipo de filtro aplicar basado en el query
                // Por ejemplo, si query es una categoría
                filters.category = query;
            }

            // Ordenamiento solo por precio (asc/desc)
            let sortOption = {};
            if (sort === 'asc') {
                sortOption.price = 1;
            } else if (sort === 'desc') {
                sortOption.price = -1;
            }

            // Consulta con paginación
            const skip = (page - 1) * limit;
            const products = await Product.find(filters)
                .sort(sortOption)
                .limit(limit)
                .skip(skip)
                .lean();

            // Contar total de documentos
            const totalDocs = await Product.countDocuments(filters);
            const totalPages = Math.ceil(totalDocs / limit);

            return {
                docs: products,
                totalDocs,
                limit,
                totalPages,
                page,
                pagingCounter: skip + 1,
                hasPrevPage: page > 1,
                hasNextPage: page < totalPages,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < totalPages ? page + 1 : null
            };

        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw new Error('Error al obtener productos de la base de datos');
        }
    }

    //Obtener producto por ID
    static async getProductById(id) {
        try {
            const product = await Product.findById(id);
            if (!product) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }
            return product;
        } catch (error) {
            console.error('Error al obtener producto:', error);
            throw new Error('Error al obtener el producto de la base de datos');
        }
    }

    //Agregar nuevo producto
    static async addProduct(productData) {
        try {
            // Validación que el código no exista
            const existingProduct = await Product.findOne({ code: productData.code });
            if (existingProduct) {
                throw new Error(`Ya existe un producto con el código ${productData.code}`);
            }

            const newProduct = new Product(productData);
            await newProduct.save();
            return newProduct;

        } catch (error) {
            console.error('Error al agregar producto:', error);
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                throw new Error(`Error de validación: ${messages.join(', ')}`);
            }
            throw new Error('Error al agregar producto a la base de datos');
        }
    }

    //Actualizar producto
    static async updateProduct(id, updates) {
        try {
            // Validación que el código no exista
            if (updates.code) {
                const existingProduct = await Product.findOne({
                    code: updates.code,
                    _id: { $ne: id }
                });
                if (existingProduct) {
                    throw new Error(`Ya existe otro producto con el código ${updates.code}`);
                }
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                updates,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!updatedProduct) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }

            return updatedProduct;

        } catch (error) {
            console.error('Error al actualizar producto:', error);
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                throw new Error(`Error de validación: ${messages.join(', ')}`);
            }
            throw new Error('Error al actualizar producto en la base de datos');
        }
    }

    //Eliminar producto
    static async deleteProduct(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            if (!deletedProduct) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }
            return { message: 'Producto eliminado exitosamente', product: deletedProduct };
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            throw new Error('Error al eliminar producto de la base de datos');
        }
    }
}

export default MongoProductManager;