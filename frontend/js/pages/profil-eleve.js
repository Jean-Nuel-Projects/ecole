class ProfilElevePage {
    constructor(id) { this.id = id; }
    async render() {
        const main = document.getElementById('main-content');
        main.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p>Chargement du profil...</p></div>`;
        try {
            const res = await API.getEleve(this.id);
            if (!res.success || !res.data) { main.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-user-slash" style="font-size:3rem;color:var(--text-light)"></i><h3>Élève non trouvé</h3></div>`; return; }
            const e = res.data, init = (e.prenom||'').charAt(0)+(e.nom||'').charAt(0), age = new Date().getFullYear() - new Date(e.date_naissance).getFullYear();
            const respHTML = (e.responsables||[]).map(r => `<div style="background:var(--bg);border-radius:8px;padding:1rem;margin-bottom:0.5rem">
  <strong>${r.nom_complet}</strong> <span class="badge badge-info">${r.lien_parente}</span>
  <div style="display:flex;gap:0.5rem;margin-top:0.5rem;flex-wrap:wrap">
    ${r.telephone ? `<a href="tel:${r.telephone}" class="btn btn-sm btn-primary"><i class="fas fa-phone"></i></a>` : ''}
    ${r.whatsapp||r.telephone ? `<a href="https://wa.me/${r.whatsapp||r.telephone}" target="_blank" class="btn btn-sm btn-success"><i class="fab fa-whatsapp"></i></a>` : ''}
    ${r.email ? `<a href="mailto:${r.email}" class="btn btn-sm btn-outline"><i class="fas fa-envelope"></i></a>` : ''}
  </div></div>`).join('');
            main.innerHTML = `<div>
  <button class="btn btn-ghost" onclick="history.back()" style="margin-bottom:1.5rem"><i class="fas fa-arrow-left"></i> Retour</button>
  <div class="profil-header">
    <div class="profil-avatar-large">${init}</div>
    <div style="flex:1"><h2>${e.prenom} ${e.nom}</h2>
      <div style="display:flex;gap:1rem;color:var(--text-light);margin-top:0.5rem;flex-wrap:wrap"><span><i class="fas fa-id-card"></i> ${e.matricule}</span><span><i class="fas fa-graduation-cap"></i> ${e.classe_nom||'N/A'}</span><span><i class="fas fa-calendar"></i> ${new Date(e.date_inscription).toLocaleDateString('fr-FR')}</span><span><i class="fas fa-birthday-cake"></i> ${age} ans</span></div>
    </div>
  </div>
  <div class="profil-grid">
    <div class="profil-section"><h3 style="margin-bottom:1rem"><i class="fas fa-address-card"></i> Identité</h3>
      <div class="info-liste"><div class="info-item"><span class="info-label">Né(e) le</span><span class="info-value">${new Date(e.date_naissance).toLocaleDateString('fr-FR')}</span></div><div class="info-item"><span class="info-label">Genre</span><span class="info-value"><span class="badge badge-info"><i class="fas fa-${e.genre==='M'?'mars':'venus'}"></i> ${e.genre==='M'?'Masculin':'Féminin'}</span></span></div><div class="info-item"><span class="info-label">Adresse</span><span class="info-value">${e.adresse||'Non renseignée'}</span></div></div>
      ${respHTML ? `<h3 style="margin:1.5rem 0 1rem"><i class="fas fa-users"></i> Responsables</h3>${respHTML}` : ''}
    </div>
    <div><div class="profil-section"><h3 style="margin-bottom:1rem"><i class="fas fa-chart-bar"></i> Fréquentation</h3><p style="text-align:center;font-size:2rem;font-weight:bold;color:var(--success)">${e.taux_presence||0}%</p></div></div>
  </div></div>`;
        } catch(e) { main.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:3rem;color:var(--danger)"></i><p>Erreur</p></div>`; }
    }
}