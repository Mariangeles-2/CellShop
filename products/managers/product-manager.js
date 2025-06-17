import fs from "fs";
import {randomUUID} from "crypto";
import createError from "http-errors"

export default class ProductManager {

    static async getProducts() {
        const productos = await fs.promises.readFile("products/database/products.json", "utf8");
        return JSON.parse(productos);
    }

    static async getProductById(pid) {
        return ProductManager.getProducts()
            .then(products => products.find(p => p.id === pid));
    }

    static async addProduct(newProduct) {
        return ProductManager.getProducts()
            .then(async products => {
                const newProductWithId = {...newProduct, id: randomUUID()};
                products.push(newProductWithId);
                await fs.promises.writeFile("products/database/products.json", JSON.stringify(products));
                return newProductWithId;
            });
    }

    static async modifyProduct(pid, productModifications) {
        const products = await ProductManager.getProducts();
        const position = products.findIndex(p => p.id === pid);
        if (position === -1) {
            throw createError(404, "Product Not Found");
        }
        const {id, ...modifications} = productModifications;
        products[position] = {...products[position], ...modifications};
        await fs.promises.writeFile("products/database/products.json", JSON.stringify(products));
        return products[position];
    }

    static async deleteProduct(pid) {
        const productList = await ProductManager.getProducts().then(products => products.filter(product => product.id !== pid));
        await fs.promises.writeFile("products/database/products.json", JSON.stringify(productList));
    }

    static async checkIfProductExist(pid) {
        return ProductManager.getProductById(pid)
            .then(product => product !== undefined);
    }
}




