document.addEventListener('DOMContentLoaded', () => {
    const modal    = document.getElementById('login-modal');
    const form     = document.getElementById('login-form');

    document.addEventListener('click', (e) => {
    if (e.target.matches('#btn-open-login')) {
        modal.classList.remove('hidden');
    }
    if (e.target.matches('#btn-close-login')) {
        modal.classList.add('hidden');
    }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(form).entries());
        data.administrador = !!data.administrador;

        try {
            const res = await fetch('http://localhost:3001/usuaris/login', {
                method: 'POST',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Error al servidor');

            const usuari = await res.json();
            alert(`Benvingut/da, ${usuari.nom}!`);
            form.reset();
            modal.classList.add('hidden');
        }
        catch (err) {
            console.error(err);
            alert('No s’ha pogut iniciar sessió');
        }
    });
});