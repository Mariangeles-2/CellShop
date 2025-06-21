import {Router} from "express";
import {validateUser} from "../users/utils.js";
import users from "../users/database/users.js";

const usersRouter = Router();

usersRouter.post("/", (req, res) => {
    const newUser = req.body

    const validationError = validateUser(newUser);
    if (validationError) {
        return res.status(400).json({error: validationError})
    }

    const {email, phone} = newUser
    const exists = users.some(
        user => user.email === email || user.phone === phone
    );
    if (exists) {
        return res.status(400).json({error: "El usuario ya existe (email o teléfono duplicado)"});
    }

    users.push(newUser);
    res.status(201).json({message: "Usuario registrado correctamente", user: newUser});
});

export default usersRouter;


