const modal    = document.getElementById('register-modal');
const form     = document.getElementById('register-form');

document.addEventListener('click', (e) => {
  if (e.target.matches('#btn-open-register')) {
    modal.classList.remove('hidden');
  }
  if (e.target.matches('#btn-close-register')) {
    modal.classList.add('hidden');
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  data.administrador = !!data.administrador;

  try {
    const res = await fetch('http://localhost:3001/usuaris', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al servidor');

    alert('Usuari creat correctament!');
    form.reset();
    modal.classList.add('hidden');
  } catch (err) {
    console.error(err);
    alert('No s’ha pogut crear l’usuari');
  }
});
