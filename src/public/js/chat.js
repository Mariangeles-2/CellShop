// Cliente del chat en vivo
const socket = io();
let user;

// Solicitud del nombre del usuario
Swal.fire({
    title: "Bienvenido!",
    input: "text",
    text: "Ingresá tu nombre",
    inputValidator: (value) => {
        if (!value) {
            return "¡Tenés que escribir tu nombre!";
        }
    },
    allowOutsideClick: false,
}).then((result) => {
    user = result.value;

    document.getElementById("chatBoxContainer").style.display = "block";

    // Nuevo usuario conectado
    socket.emit("login", user);
});

// Input de chat
const chatBox = document.getElementById("chatBox");

// Enter del usuario
chatBox.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        const message = chatBox.value.trim();
        if (message.length > 0) {
            socket.emit("new-msg", {
                user,
                message,
            });
            chatBox.value = "";
        }
    }
});

// Mensajes recibidos
socket.on("all-msgs", (data) => {
    const log = document.getElementById("messageLogs");
    log.innerHTML = "";
    data.forEach((msg) => {
        const isOwn = msg.user === user;
        log.innerHTML += `<div class="message ${isOwn ? "user" : "other"}"><strong>${msg.user}:</strong> ${msg.message}</div>`;
    });
    log.scrollTop = log.scrollHeight; // Hace scroll abajo
});

// Nuevo usuario conectado
socket.on("new-user", async (username) => {
    await Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        title: `${username} se unió al chat`,
        icon: 'info'
    });
});

