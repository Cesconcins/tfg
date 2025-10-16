document.addEventListener('DOMContentLoaded', () => {
    const form  = document.getElementById('login-form');
    if (!form) return; // No és la pàgina de login

    const errorBox = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';
        const data = Object.fromEntries(new FormData(form).entries());

        try {
            const res = await fetch('http://localhost:3001/usuaris/login', {
                method: 'POST',
                headers: { 'Content-Type':'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Credenciales incorrectas o error al servidor');

            const usuari = await res.json();

            // “Sessió” simple: guarda usuari (sense seguretat)
            localStorage.setItem('sessio_usuari', JSON.stringify(usuari));

            // Redirigeix inici
            window.location.href = '/../index.html';
        } catch (err) {
            console.error(err);
            errorBox.textContent = 'No ha sido posible iniciar sessión. Revisa las credenciales.';
            errorBox.style.display = 'block';
        }
    });
});