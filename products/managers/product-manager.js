import fs from "fs";
import {randomUUID} from "crypto";

export default class ProductManager {

    static async modifyProduct(pid, productModifications) {
        const products = await ProductManager.getProducts();
        const position = products.findIndex(p => p.id === pid);
        if (position === -1) return null;

        const {id, ...modifications} = productModifications;
        products[position] = {...products[position], ...modifications};

        await fs.promises.writeFile("products/database/products.json", JSON.stringify(products));
        return products[position];
    }

    static async getProducts() {
        const products = await fs.promises.readFile("products/database/products.json", "utf8");
        return JSON.parse(products)
    }

    static async getProductById(pid) {
        return ProductManager.getProducts().then(products => products.find(p => p.id === pid));
    }

    static async addProduct(newProduct) {
        const newProductsList = await ProductManager.getProducts().then(products => {
            products.push({...newProduct, id: randomUUID()})
            return products
        })

        await fs.promises.writeFile("products/database/products.json", JSON.stringify(newProductsList))
    }

    static async deleteProduct(pid) {
        const productList = await ProductManager.getProducts().then(products => products.filter(product => product.id !== pid))

        await fs.promises.writeFile("products/database/products.json", JSON.stringify(productList))
    }
}




