
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector(".login__form");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const gmail = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ gmail, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                // Guarda el token, username y role en localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                localStorage.setItem("role", data.role);

                // Redirige a la página protegida
                window.location.href = "../dashboard/index.html";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });



    // === FORMULARIO REGISTRO ===
    const registerForm = document.querySelector(".login__register .login__form");
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const gmail = document.getElementById("emailCreate").value;
        const username = `${document.getElementById("names").value} ${document.getElementById("surnames").value}`;
        const password = document.getElementById("passwordCreate").value;
        const role = document.getElementById("rolecreate").value;

        try {
            const response = await fetch("http://localhost:4000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gmail, username, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                // Opcional: redirigir al login
                document.getElementById("loginButtonAccess").click();
            } else {
                alert(data.message || "Error en registro");
            }
        } catch (error) {
            console.error("Error en registro:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
});
