import fs from "fs";
import {randomUUID} from "crypto";
import createError from "http-errors"

export default class ProductManager {

    // Obtiene todos los productos
    static async getProducts() {
        const productos = await fs.promises.readFile("src/products/database/products.json", "utf8");
        return JSON.parse(productos);
    }

    // Busca un producto por su ID
    static async getProductById(pid) {
        return ProductManager.getProducts()
            .then(products => products.find(p => p.id === pid));
    }

    // Agrega un nuevo producto y con ID
    static async addProduct(newProduct) {
        return ProductManager.getProducts()
            .then(async products => {
                const newProductWithId = {...newProduct, id: randomUUID()};
                products.push(newProductWithId);
                await fs.promises.writeFile("src/products/database/products.json", JSON.stringify(products));
                return newProductWithId;
            });
    }

    // Modifica un producto existente por ID
    static async modifyProduct(pid, productModifications) {
        const products = await ProductManager.getProducts();
        const position = products.findIndex(p => p.id === pid);
        if (position === -1) {
            throw createError(404, "Product Not Found");
        }
        const {id, ...modifications} = productModifications;
        products[position] = {...products[position], ...modifications};
        await fs.promises.writeFile("src/products/database/products.json", JSON.stringify(products));
        return products[position];
    }

    // Elimina un producto por ID
    static async deleteProduct(pid) {
        const productList = await ProductManager.getProducts().then(products => products.filter(product => product.id !== pid));
        await fs.promises.writeFile("src/products/database/products.json", JSON.stringify(productList));
    }

    // Verifica existencia de un producto por ID
    static async checkIfProductExist(pid) {
        return ProductManager.getProductById(pid)
            .then(product => product !== undefined);
    }
}




