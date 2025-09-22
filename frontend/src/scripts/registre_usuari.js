document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    if (!form) return; // No és la pàgina de registre

    const errorBox = document.getElementById('register-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const data = Object.fromEntries(new FormData(form).entries());
        data.administrador = false; // administrador decidit a la BBDD

        try {
            const res = await fetch('http://localhost:3001/usuaris', {
                method: 'POST',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Error creando el usuario');

            // un cop registrat, enviar a login
            window.location.href = '/../src/pages/login.html';
        } catch (err) {
            console.error(err);
            errorBox.textContent = 'No ha sido posible crear el usuario.';
            errorBox.style.display = 'block';
        }
    });
});
