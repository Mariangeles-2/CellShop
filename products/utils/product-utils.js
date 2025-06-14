export default function validateProduct(body) {
    const {title, description, price, thumbnail, code, stock} = body;
    if (!title || typeof title !== "string") return "Title is required and must be a string.";
    if (!description || typeof description !== "string") return "Description is required and must be a string.";
    if (!price || typeof price !== "number") return "Price is required and must be a number.";
    if (!thumbnail || typeof thumbnail !== "string") return "Thumbnail is required and must be a URL.";
    if (!code || typeof code !== "string") return "Code is required and must be a string.";
    if (!stock || !Number.isInteger(stock) || stock < 0) return "Stock is required and must be a non-negative integer.";
    return null;
}
