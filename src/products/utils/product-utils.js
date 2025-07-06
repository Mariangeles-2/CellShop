// Valida que un producto tenga los campos requeridos y tipo
export function validateProductFull(product) {
    const {title, description, price, thumbnail, code, stock} = product;
    if (!title || typeof title !== "string") return "Title is required and must be a string.";
    if (!description || typeof description !== "string") return "Description is required and must be a string.";
    if (!price || typeof price !== "number") return "Price is required and must be a number.";
    if (!thumbnail || typeof thumbnail !== "string") return "Thumbnail is required and must be a URL.";
    if (!code || typeof code !== "string") return "Code is required and must be a string.";
    if (!stock || !Number.isInteger(stock) || stock < 0) return "Stock is required and must be a non-negative integer.";
    return null;
}

// Valida los campos de un producto
export function validateProductPartial(product) {
    const {title, description, price, thumbnail, code, stock} = product;
    if (title && typeof title !== "string") return "Title must be a string.";
    if (description && typeof description !== "string") return "Description must be a string.";
    if (price && typeof price !== "number") return "Price must be a number.";
    if (thumbnail && typeof thumbnail !== "string") return "Thumbnail must be a URL.";
    if (code && typeof code !== "string") return "Code must be a string.";
    if (stock && !Number.isInteger(stock) || stock < 0) return "Stock must be a non-negative integer.";
    return null;
}
