/* Injecta header i footer des de /src/components */
async function inject(path, selector) {
    try {
        const res  = await fetch(path);
        const html = await res.text();
        document.querySelector(selector).innerHTML = html;
    } catch (e) {
        console.error(`No s'ha pogut carregar ${path}:`, e);
    }
}
  
document.addEventListener('DOMContentLoaded', () => {
    inject('/src/components/header.html', 'header');
    inject('/src/components/footer.html', 'footer');
});
  