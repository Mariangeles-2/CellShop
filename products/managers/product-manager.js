import fs from "fs";

export default class ProductManager {
    static async getProducts() {
        const products = await fs.promises.readFile("products/database/products.json", "utf8");
        return JSON.parse(products)
    }

    static async getProductById(pid) {
        return ProductManager.getProducts().then(products => products.find(p => p.id === pid));
    }

    static async addProduct (newProduct) {
        const newProductsList = await ProductManager.getProducts().then(products => {
            products.push(newProduct)
            return products
        })

        await fs.promises.writeFile("products/database/products.json", JSON.stringify(newProductsList))
    }
}




