import users from "../users/database/users.js";

// Devuelve un usuario aleatorio
export function getRandomUser() {
    const index = Math.floor(Math.random() * users.length);
    return users[index];
}

// Valida los datos de un usuario
export function validateUser(user) {
    const {firstName, lastName, age, email, phone, password} = user;
    if (
        !firstName || !lastName || !email || !phone || !password ||
        typeof firstName !== "string" ||
        typeof lastName !== "string" ||
        typeof email !== "string" ||
        typeof phone !== "string" ||
        typeof password !== "string" ||
        !Number.isInteger(Number(age)) || Number(age) < 0
    ) {
        return "Datos inválidos o faltantes"
    }
}


