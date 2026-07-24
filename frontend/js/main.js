let dashboard;
async function initApp() {
    if (!authService.isAuth()) { window.location.href = '/login.html'; return; }
    const user = authService.getUser(), initiales = (user?.nom_complet || 'A').charAt(0);
    if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');
    try { const h = await CL.loadTemplate('/composants/layout/header.html'); document.getElementById('header-container').innerHTML = h.replace('>A<', `>${initiales}<`).replace('>Admin<', `>${user?.nom_complet || 'Admin'}<`); updateThemeIcon(); } catch(e) {}
    try { const s = await CL.loadTemplate('/composants/layout/sidebar.html'); document.getElementById('sidebar-container').innerHTML = s; document.getElementById('sidebar-container').style.display = 'none'; } catch(e) {}
    for (const c of ['button','input','select','modal','card','table','badge','alert','loader','textarea']) { try { CL.register(`ui/${c}`, await CL.loadTemplate(`/composants/ui/${c}.html`)); } catch(e) {} }
    try { CL.register('forms/search-bar', await CL.loadTemplate('/composants/forms/search-bar.html')); } catch(e) {}
    dashboard = new DashboardPage();
    router.add('dashboard', () => { hideSidebar(); dashboard.render(); });
    router.add('classe/:id', (p) => { showSidebar(); new ClasseDetailPage(p.id).render(); });
    router.add('eleves/:id', (p) => new ProfilElevePage(p.id).render());
    router.add('presences', () => new PresencesPage().render());
    router.add('pointage', () => new PointagePage().render());
    const route = window.location.hash.slice(1) || 'dashboard'; router.navigate(route);
}
function toggleTheme() {
    const btn = document.getElementById('theme-toggle'); if (!btn) return;
    btn.classList.add('switching');
    setTimeout(() => { document.body.classList.toggle('light'); localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark'); updateThemeIcon(); btn.classList.remove('switching'); }, 300);
}
function updateThemeIcon() { const i = document.querySelector('#theme-toggle i'); if (i) i.className = document.body.classList.contains('light') ? 'fas fa-sun' : 'fas fa-moon'; }
function showSidebar() { const sb = document.getElementById('sidebar-container'); if (sb) sb.style.display = ''; const btn = document.getElementById('menu-toggle-btn'); if (btn) btn.style.display = ''; }
function hideSidebar() { const sb = document.getElementById('sidebar-container'); if (sb) sb.style.display = 'none'; const btn = document.getElementById('menu-toggle-btn'); if (btn) btn.style.display = 'none'; }
function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('collapsed'); }
function closeModal(id) { const m = document.getElementById(`${id}-overlay`); if (m) m.remove(); }
function confirmModal(id) { closeModal(id); }
class ClasseDetailPage { constructor(id) { this.id = id; } async render() { document.getElementById('main-content').innerHTML = `<div style="padding:2rem"><h2><i class="fas fa-users"></i> Classe ${this.id}</h2><p style="color:var(--text-secondary)">En construction...</p></div>`; } }
class PresencesPage { async render() { document.getElementById('main-content').innerHTML = `<div style="padding:2rem"><h2><i class="fas fa-calendar-check"></i> Présences</h2><p style="color:var(--text-secondary)">En construction...</p></div>`; } }
class PointagePage { async render() { document.getElementById('main-content').innerHTML = `<div style="padding:2rem"><h2><i class="fas fa-qrcode"></i> Pointage</h2><p style="color:var(--text-secondary)">En construction...</p></div>`; } }
document.addEventListener('DOMContentLoaded', initApp);