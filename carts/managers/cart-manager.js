import fs from "fs";
import {randomUUID} from "crypto";

export default class CartManager {
    static async getCarts() {
        const carts = await fs.promises.readFile("carts/database/carts.json", "utf-8");
        return JSON.parse(carts);
    }

    static async addCart() {
        const carts = await CartManager.getCarts();
        const newCart = {
            id: randomUUID(),
            products: []
        };
        carts.push(newCart);
        await fs.promises.writeFile("carts/database/carts.json", JSON.stringify(carts));
        return newCart;
    }

    static async getCartById(cid) {
        return CartManager.getCarts().then(carts => carts.find(cart => cart.id === cid));
    }

    static async addProductToCart(cid, pid) {
        await CartManager.getCartById(cid).then(async (cart) => {
            const productToAdd = cart.products.find(p => p.id === pid);
            const carts = await CartManager.getCarts();
            if (productToAdd) {
                productToAdd.quantity++;
            } else {
                cart.products.push(
                    {
                        id: pid,
                        quantity: 1,
                    }
                );
            }
            const position = carts.findIndex(c => c.id === cid);
            carts[position] = cart;
            await fs.promises.writeFile("carts/database/carts.json", JSON.stringify(carts));
        });
    }
}
