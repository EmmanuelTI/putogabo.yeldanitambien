const logoutBtn = document.getElementById('logoutBtn');

logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        // Obtén el token de donde lo tengas guardado (localStorage, cookie, etc.)
        const token = localStorage.getItem('token'); // Ejemplo usando localStorage

        if (!token) {
            alert('No hay sesión activa.');
            return;
        }

        const response = await fetch('http://localhost:4000/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            // Elimina el token localmente para "cerrar sesión" en frontend
            localStorage.removeItem('token');
            // Redirige a login o página inicial
            window.location.href = '../login/login.html'; 
        } else {
            alert('Error al cerrar sesión: ' + data.message);
        }

    } catch (error) {
        console.error('Error en logout:', error);
        alert('Error al cerrar sesión');
    }
});
