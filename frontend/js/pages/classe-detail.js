class ClasseDetailPage {
    constructor(id) { this.id = id; this.classe = null; this.eleves = []; this.tabActif = 'liste'; }
    async render(p) {
        const m = document.getElementById('main-content');
        m.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:0.75rem">Chargement...</p></div>`;
        try { const cr = await apiGet(`/classes/${this.id}/stats`); this.classe = cr.data || {}; const er = await apiGet(`/eleves/classe/${this.id}`); this.eleves = er.data || []; for (const e of this.eleves) { e.statut = e.statut || '?'; e.init = (e.prenom||'').charAt(0)+(e.nom||'').charAt(0); } await this.afficher(m); }
        catch(e) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--text-muted)"></i><p style="color:var(--text-secondary)">${e.message}</p></div>`; }
    }
    async afficher(m) {
        const c = this.classe;
        const searchRendu = await CL.render('forms/search-bar', { id: 'search-eleves', placeholder: 'Rechercher un élève...', oninput: "classeDetail.filtrer();var c=document.getElementById('search-eleves-clear');if(c)c.style.display=this.value?'':'none'", onclear: 'classeDetail.filtrer()' });
        m.innerHTML = `<div class="classe-detail-container">
  <div class="classe-header-bar">
    <button class="btn btn-ghost" onclick="router.navigate('dashboard')"><i class="fas fa-arrow-left"></i> Retour</button>
    <div class="classe-header-info"><h2>${c.nom_classe || 'Classe '+this.id}</h2><p><i class="fas fa-user-graduate"></i> ${c.nb_eleves||0} élèves<span>|</span><i class="fas fa-user-check" style="color:var(--success)"></i> ${c.presents||0} présents aujourd'hui</p></div>
    <button class="btn btn-primary" onclick="classeDetail.ouvrirModalAjouter()"><i class="fas fa-user-plus"></i> Ajouter un élève</button>
  </div>
  <div class="tab-switcher">
    <button class="tab-btn ${this.tabActif==='liste'?'active':''}" onclick="classeDetail.switchTab('liste')"><i class="fas fa-list"></i> Liste</button>
    <button class="tab-btn ${this.tabActif==='presences'?'active':''}" onclick="classeDetail.switchTab('presences')"><i class="fas fa-calendar-check"></i> Présences du jour</button>
  </div>
  ${searchRendu}
  <div id="tab-content"></div></div>`;
        this.renderTab();
    }
    async switchTab(tab) { this.tabActif = tab; this.renderTab(); }
    renderTab() { const tc = document.getElementById('tab-content'); if (tc) tc.innerHTML = this.tabActif === 'liste' ? this.tabListe() : this.tabPresences(); }
    tabListe() {
        return `<div class="table-container"><table class="data-table"><thead><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Genre</th><th style="text-align:center">Statut</th><th style="width:110px;text-align:center">Actions</th></tr></thead>
  <tbody>${this.eleves.length ? this.eleves.map(e => `<tr class="clickable-row eleve-row" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}" onclick="router.navigate('eleves/${e.id}')">
    <td><strong style="color:var(--primary)">${e.matricule}</strong></td><td>${e.nom}</td><td>${e.prenom}</td>
    <td><span class="badge badge-info"><i class="fas fa-${e.genre==='M'?'mars':'venus'}"></i> ${e.genre==='M'?'M':'F'}</span></td>
    <td style="text-align:center"><span class="badge badge-${e.statut==='present'?'success':e.statut==='absent'?'danger':e.statut==='retard'?'warning':'info'}"><i class="fas fa-${e.statut==='present'?'check':e.statut==='absent'?'times':e.statut==='retard'?'clock':'question'}"></i> ${e.statut||'?'}</span></td>
    <td style="text-align:center"><div class="actions-cell" style="justify-content:center">
      <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();router.navigate('eleves/${e.id}')" title="Profil"><i class="fas fa-eye"></i></button>
      <button class="btn btn-sm btn-success" onclick="event.stopPropagation();classeDetail.pointer(${e.id},'present')" title="Présent"><i class="fas fa-check"></i></button>
      <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();classeDetail.pointer(${e.id},'absent')" title="Absent"><i class="fas fa-times"></i></button>
    </div></td></tr>`).join('') : `<tr class="empty-row"><td colspan="6"><i class="fas fa-user-slash empty-icon"></i><p>Aucun élève dans cette classe</p><button class="btn btn-primary btn-sm" onclick="classeDetail.ouvrirModalAjouter()"><i class="fas fa-user-plus"></i> Ajouter un élève</button></td></tr>`}
  </tbody></table></div>`;
    }
    tabPresences() {
        const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return `<p style="color:var(--text-secondary);margin-bottom:1rem"><i class="fas fa-calendar-alt"></i> ${today}</p>
  <div class="presences-grid">${this.eleves.map(e => `<div class="presence-card presences-item" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}">
    <div class="avatar" style="background:var(--gradient-${e.genre==='F'?'3':'1'})">${e.init}</div>
    <div class="info"><strong>${e.prenom} ${e.nom}</strong><span>${e.matricule}</span></div>
    <div class="actions">
      <button class="btn btn-sm btn-success" onclick="classeDetail.pointer(${e.id},'present')" title="Présent"><i class="fas fa-check"></i></button>
      <button class="btn btn-sm btn-warning" onclick="classeDetail.pointer(${e.id},'retard')" title="Retard"><i class="fas fa-clock"></i></button>
      <button class="btn btn-sm btn-danger" onclick="classeDetail.pointer(${e.id},'absent')" title="Absent"><i class="fas fa-times"></i></button>
    </div></div>`).join('')}</div>`;
    }
    async pointer(eleveId, statut) {
        try { const r = await API.pointerPresence({ eleve_id: eleveId, statut, methode_pointage: 'MANUEL' }); if (r.success) { const e = this.eleves.find(el => el.id == eleveId); if (e) e.statut = statut; this.renderTab(); } }
        catch(e) { alert('Erreur: '+e.message); }
    }
    filtrer() { const q = document.getElementById('search-eleves')?.value.toLowerCase() || ''; document.querySelectorAll('.eleve-row, .presences-item').forEach(el => { el.style.display = el.dataset.nom.includes(q) ? '' : 'none'; }); }
    async ouvrirModalAjouter() {
        const overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.id = 'modal-ajouter';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
        overlay.innerHTML = `<div class="modal" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-user-plus"></i> Ajouter un élève</h3><button class="modal-close" onclick="document.getElementById('modal-ajouter').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body"><form id="form-ajouter" onsubmit="return false">
    <div class="input-group"><label class="input-label">Nom <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="aj-nom" required></div></div>
    <div class="input-group"><label class="input-label">Prénom <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="aj-prenom" required></div></div>
    <div class="input-group"><label class="input-label">Date de naissance <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-calendar input-icon"></i><input type="date" class="form-input" id="aj-date" required></div></div>
    <div class="input-group"><label class="input-label">Genre <span class="required">*</span></label><div class="select-wrapper"><select class="form-select" id="aj-genre" required><option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option></select><i class="fas fa-chevron-down select-arrow"></i></div></div>
    <div class="input-group"><label class="input-label">Adresse</label><div class="input-wrapper"><i class="fas fa-map-marker-alt input-icon"></i><input type="text" class="form-input" id="aj-adresse"></div></div>
    <div class="input-group"><label class="input-label">Classe <span class="required">*</span></label><div class="input-wrapper" style="cursor:pointer" onclick="classeDetail.ouvrirModalClasses()"><i class="fas fa-graduation-cap input-icon"></i><input type="text" class="form-input" id="aj-classe-nom" readonly placeholder="Cliquer pour choisir..." value="${this.classe?.nom_classe || ''}" required><input type="hidden" id="aj-classe-id" value="${this.id}"><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none"></i></div></div>
  </form></div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-ajouter').remove()">Annuler</button><button class="btn btn-primary" onclick="classeDetail.ajouter()"><i class="fas fa-save"></i> Enregistrer</button></div></div>`;
        document.body.appendChild(overlay);
    }
    async ouvrirModalClasses() {
        const classesRes = await apiGet('/classes'); const classes = classesRes.data || [];
        const overlay2 = document.createElement('div'); overlay2.className = 'modal-overlay nested'; overlay2.id = 'modal-classes';
        overlay2.onclick = e => { if (e.target === overlay2) overlay2.remove(); };
        overlay2.innerHTML = `<div class="modal" style="max-width:400px" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-graduation-cap"></i> Choisir une classe</h3><button class="modal-close" onclick="document.getElementById('modal-classes').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body" style="display:flex;flex-direction:column;gap:0.4rem;max-height:300px;overflow-y:auto">${classes.map(c => `<div class="ui-card card-hoverable" onclick="document.getElementById('aj-classe-nom').value='${c.nom_classe}';document.getElementById('aj-classe-id').value='${c.id}';document.getElementById('modal-classes').remove()" style="cursor:pointer"><div style="padding:0.7rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-users" style="color:var(--primary)"></i><span style="font-size:0.9rem;font-weight:500">${c.nom_classe}</span></div></div>`).join('')}</div></div>`;
        document.body.appendChild(overlay2);
    }
    async ajouter() {
        const data = { nom: document.getElementById('aj-nom')?.value, prenom: document.getElementById('aj-prenom')?.value, date_naissance: document.getElementById('aj-date')?.value, genre: document.getElementById('aj-genre')?.value, adresse: document.getElementById('aj-adresse')?.value, classe_id: document.getElementById('aj-classe-id')?.value };
        if (!data.nom || !data.prenom || !data.date_naissance || !data.genre || !data.classe_id) { alert('Champs requis manquants'); return; }
        try { const r = await API.createEleve(data); if (r.success) { document.getElementById('modal-ajouter')?.remove(); await this.render(); } else alert(r.message); }
        catch(e) { alert('Erreur: '+e.message); }
    }
}