document.addEventListener('DOMContentLoaded', async () => {
        // esperar a que el header estigui injectat
    await new Promise(r => setTimeout(r, 0));

    const el = id => document.getElementById(id);

    const waitFor = (sel, tries = 100) => new Promise(resolve => {
        (function loop(i){
        const el = document.querySelector(sel);
        if (el || i <= 0) return resolve(el);
        setTimeout(() => loop(i-1), 30);
        })(tries);
    });
    await waitFor('.main-nav')
    
    const show = (id, on) => { const n = el(id); if (n) n.classList[on ? 'remove' : 'add']('hidden'); };

    try {
        const res = await fetch('http://localhost:3001/usuaris/whoami', { credentials: 'include' });

        if (res.ok) {
            const u = await res.json();

            const isAdmin = !!Number(u?.administrador);

            // Mostra/amaga
            show('nav-login', false);
            show('nav-register', false);
            show('nav-perfil', true);
            show('nav-logout', true);
            show('nav-admin', isAdmin);

            const btn = document.getElementById('btn-logout');
            if (btn) {
                btn.onclick = async () => {
                    await fetch('http://localhost:3001/usuaris/logout', { method: 'POST', credentials: 'include' });
                    // neteja UI
                    show('nav-admin', false);
                    show('nav-perfil', false);
                    show('nav-logout', false);
                    show('nav-login', true);
                    show('nav-register', true);
                    // ves a inici
                    location.href = '/public/index.html';
                };
            }

        } else {
            // 401 → no loguejat
            show('nav-login', true);
            show('nav-register', true);
            show('nav-perfil', false);
            show('nav-logout', false);
            show('nav-admin', false);
        }
    } catch (e) {
        console.error('auth_ui:', e);
        show('nav-login', true);
        show('nav-register', true);
        show('nav-perfil', false);
        show('nav-logout', false);
        show('nav-admin', false);
    }
});
