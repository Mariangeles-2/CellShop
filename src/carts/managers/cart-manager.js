import fs from "fs";
import {randomUUID} from "crypto";
import ProductManager from "../../products/managers/product-manager.js";
import createHttpError from "http-errors";

export default class CartManager {
    static async getCarts() {
        const carts = await fs.promises.readFile("src/carts/database/carts.json", "utf-8");
        return JSON.parse(carts);
    }

    static async addCart() {
        const carts = await CartManager.getCarts();
        const newCart = CartManager.#createNewCart();
        carts.push(newCart);
        await fs.promises.writeFile("src/carts/database/carts.json", JSON.stringify(carts));
        return newCart;
    }

    static #createNewCart() {
        return {
            id: randomUUID(),
            products: []
        };
    }

    static async getCartById(cid) {
        return CartManager.getCarts()
            .then(carts => carts.find(cart => cart.id === cid));
    }

    static async addProductToCart(cid, pid) {
        const cart = await CartManager.getCartById(cid);
        if (!cart) {
            throw createHttpError(404, "Cart not found");
        }
        await CartManager.#validateProduct(pid);
        CartManager.#addOrUpdateProduct(cart, pid);
        await CartManager.#saveCart(cart);
    }

    static async #validateProduct(pid) {
        const productExist = await ProductManager.checkIfProductExist(pid);
        if (!productExist) {
            throw createHttpError(400, "Id de producto inválido");
        }
    }

    static #addOrUpdateProduct(cart, pid) {
        const productToAdd = cart.products.find(p => p.id === pid);
        if (productToAdd) {
            productToAdd.quantity++;
        } else {
            cart.products.push({id: pid, quantity: 1});
        }
    }

    static async #saveCart(cart) {
        const carts = await CartManager.getCarts();
        const position = carts.findIndex(c => c.id === cart.id);
        carts[position] = cart;
        await fs.promises.writeFile("src/carts/database/carts.json", JSON.stringify(carts));
    }
}
