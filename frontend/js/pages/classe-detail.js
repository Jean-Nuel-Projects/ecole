class ClasseDetailPage {
    constructor(id) { this.id = id; this.classe = null; this.eleves = []; this.tabActif = 'liste'; this.filtrePresence = 'journaliere'; this.datePresence = new Date().toISOString().split('T')[0]; }
    async render(p) {
        const m = document.getElementById('main-content');
        m.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:0.75rem">Chargement...</p></div>`;
        try { const cr = await API.getClasseStats(this.id); this.classe = cr.data || {}; const er = await API.getElevesByClasse(this.id); this.eleves = er.data || []; for (const e of this.eleves) { e.statut = e.statut || '?'; e.init = (e.prenom||'').charAt(0)+(e.nom||'').charAt(0); } await this.afficher(m); }
        catch(e) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--text-muted)"></i><p style="color:var(--text-secondary)">${e.message}</p></div>`; }
    }
    async afficher(m) {
        const c = this.classe;
        m.innerHTML = `<div class="classe-detail-container">
  <div class="classe-header-bar"><button class="btn btn-ghost" onclick="router.navigate('dashboard')"><i class="fas fa-arrow-left"></i> Retour</button><div class="classe-header-info"><h2>${c.nom_classe||'Classe '+this.id}</h2><p><i class="fas fa-user-graduate"></i> ${c.nb_eleves||0} élèves<span>|</span><i class="fas fa-user-check" style="color:var(--success)"></i> ${c.presents||0} présents aujourd'hui</p></div><button class="btn btn-primary" onclick="classeDetail.ouvrirModalAjouter()"><i class="fas fa-user-plus"></i> Ajouter un élève</button></div>
  <div class="tab-switcher"><button class="tab-btn ${this.tabActif==='liste'?'active':''}" onclick="classeDetail.switchTab('liste')"><i class="fas fa-list"></i> Liste</button><button class="tab-btn ${this.tabActif==='presences'?'active':''}" onclick="classeDetail.switchTab('presences')"><i class="fas fa-calendar-check"></i> Présence</button></div>
  <div id="tab-content"></div></div>`;
        await this.renderTab();
    }
    async switchTab(tab) { this.tabActif = tab; await this.renderTab(); }
    async renderTab() {
        const tc = document.getElementById('tab-content'); if (!tc) return;
        if (this.tabActif === 'liste') tc.innerHTML = this.tabListe();
        else tc.innerHTML = this.tabPresences();
    }

    tabListe() {
        return `<div class="search-bar" style="margin-bottom:1rem"><div class="input-wrapper"><i class="fas fa-search input-icon"></i><input type="text" class="form-input" id="search-eleves" placeholder="Rechercher par nom ou matricule..." oninput="classeDetail.filtrer()"><button class="search-clear" id="search-eleves-clear" style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;display:none" onclick="document.getElementById('search-eleves').value='';classeDetail.filtrer()"><i class="fas fa-times"></i></button></div></div>
  <div id="liste-container"><div class="table-container"><table class="data-table"><thead><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Genre</th><th style="text-align:center">Statut</th><th style="width:110px;text-align:center">Actions</th></tr></thead>
  <tbody id="liste-tbody">${this.eleves.length?this.eleves.map(e=>`<tr class="clickable-row eleve-row" data-matricule="${e.matricule.toLowerCase()}" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}" onclick="router.navigate('eleves/${e.id}')">
    <td><strong style="color:var(--primary)">${e.matricule}</strong></td><td>${e.nom}</td><td>${e.prenom}</td>
    <td><span class="badge badge-info"><i class="fas fa-${e.genre==='M'?'mars':'venus'}"></i> ${e.genre==='M'?'M':'F'}</span></td>
    <td style="text-align:center"><span class="badge badge-${e.statut==='present'?'success':e.statut==='absent'?'danger':e.statut==='retard'?'warning':e.statut==='justifie'?'info':'info'}"><i class="fas fa-${e.statut==='present'?'check':e.statut==='absent'?'times':e.statut==='retard'?'clock':e.statut==='justifie'?'check-circle':'question'}"></i> ${e.statut==='present'?'Présent':e.statut==='absent'?'Absent':e.statut==='retard'?'Retard':e.statut==='justifie'?'Justifié':'?'}</span></td>
    <td style="text-align:center"><div class="actions-cell" style="justify-content:center">
      <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();router.navigate('eleves/${e.id}')" title="Profil"><i class="fas fa-eye"></i></button>
      <button class="btn btn-sm btn-success" onclick="event.stopPropagation();classeDetail.pointer(${e.id},'present')" title="Présent"><i class="fas fa-check"></i></button>
      <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();classeDetail.pointer(${e.id},'absent')" title="Absent"><i class="fas fa-times"></i></button>
    </div></td></tr>`).join(''):`<tr class="empty-row"><td colspan="6"><i class="fas fa-user-slash empty-icon"></i><p>Aucun élève</p><button class="btn btn-primary btn-sm" onclick="classeDetail.ouvrirModalAjouter()"><i class="fas fa-user-plus"></i> Ajouter</button></td></tr>`}</tbody></table></div></div>
  <div id="no-match" style="display:none;text-align:center;padding:2rem"><i class="fas fa-search" style="font-size:2.5rem;color:var(--text-muted);display:block;margin-bottom:0.75rem"></i><p style="color:var(--text-secondary)">Aucune correspondance</p></div>`;
    }

    tabPresences() {
        const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;gap:0.75rem;flex-wrap:wrap">
  <div style="display:flex;gap:0.3rem;background:var(--glass);border:1px solid var(--glass-border);border-radius:var(--radius);padding:3px">
    <button class="tab-btn ${this.filtrePresence==='journaliere'?'active':''}" onclick="classeDetail.setFiltrePresence('journaliere')"><i class="fas fa-calendar-day"></i> Journalière</button>
    <button class="tab-btn ${this.filtrePresence==='hebdomadaire'?'active':''}" onclick="classeDetail.setFiltrePresence('hebdomadaire')"><i class="fas fa-calendar-week"></i> Hebdo</button>
    <button class="tab-btn ${this.filtrePresence==='mensuelle'?'active':''}" onclick="classeDetail.setFiltrePresence('mensuelle')"><i class="fas fa-calendar-alt"></i> Mensuelle</button>
  </div>
  ${this.filtrePresence==='journaliere'?`<div style="display:flex;align-items:center;gap:0.5rem"><label style="color:var(--text-secondary);font-size:0.82rem"><i class="fas fa-calendar"></i> Date :</label><input type="date" class="form-input" style="width:auto;padding:0.4rem 0.7rem" value="${this.datePresence}" onchange="classeDetail.setDatePresence(this.value)"></div>`:''}
</div>
<div class="search-bar" style="margin-bottom:1rem"><div class="input-wrapper"><i class="fas fa-search input-icon"></i><input type="text" class="form-input" id="search-eleves" placeholder="Rechercher par nom ou matricule..." oninput="classeDetail.filtrer()"><button class="search-clear" id="search-eleves-clear" style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;display:none" onclick="document.getElementById('search-eleves').value='';classeDetail.filtrer()"><i class="fas fa-times"></i></button></div></div>
<p style="color:var(--text-secondary);margin-bottom:1rem"><i class="fas fa-calendar-alt"></i> ${this.filtrePresence==='journaliere'?today:'Statistiques de présence'}</p>
<div id="presence-container">${this.filtrePresence==='journaliere'?this.tabPresencesJour():this.tabPresencesStats()}</div>
<div id="no-match" style="display:none;text-align:center;padding:2rem"><i class="fas fa-search" style="font-size:2.5rem;color:var(--text-muted);display:block;margin-bottom:0.75rem"></i><p style="color:var(--text-secondary)">Aucune correspondance</p></div>`;
    }

    async setFiltrePresence(filtre) { this.filtrePresence = filtre; await this.renderTab(); }
    async setDatePresence(date) { this.datePresence = date; await this.renderTab(); }

    tabPresencesJour() {
        return `<div class="table-container"><table class="data-table"><thead><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th style="text-align:center">Statut</th><th style="text-align:center">Justification</th><th style="width:140px;text-align:center">Actions</th></tr></thead>
  <tbody id="presence-tbody">${this.eleves.length?this.eleves.map(e=>{
    const bc=e.statut==='present'?'success':e.statut==='absent'?'danger':e.statut==='retard'?'warning':e.statut==='justifie'?'info':'info';
    const bi=e.statut==='present'?'check':e.statut==='absent'?'times':e.statut==='retard'?'clock':e.statut==='justifie'?'check-circle':'question';
    const bl=e.statut==='present'?'Présent':e.statut==='absent'?'Absent':e.statut==='retard'?'Retard':e.statut==='justifie'?'Justifié':'?';
    const jl=e.justification==='malade'?'Malade':e.justification==='endeuille'?'Endeuillé':e.justification==='pas_motif'?'Pas de motif':'—';
    return `<tr class="presences-item" data-matricule="${e.matricule.toLowerCase()}" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}">
    <td><strong style="color:var(--primary)">${e.matricule}</strong></td><td>${e.nom}</td><td>${e.prenom}</td>
    <td style="text-align:center"><span class="badge badge-${bc}"><i class="fas fa-${bi}"></i> ${bl}</span></td>
    <td style="text-align:center"><span style="font-size:0.82rem;color:${e.justification&&e.justification!=='pas_motif'?'var(--success)':'var(--text-muted)'}">${jl}</span></td>
    <td style="text-align:center"><div class="actions-cell" style="justify-content:center">
      <button class="btn btn-sm btn-success" onclick="classeDetail.pointer(${e.id},'present')" title="Présent"><i class="fas fa-check"></i></button>
      <button class="btn btn-sm btn-warning" onclick="classeDetail.pointer(${e.id},'retard')" title="Retard"><i class="fas fa-clock"></i></button>
      <button class="btn btn-sm btn-danger" onclick="classeDetail.pointer(${e.id},'absent')" title="Absent"><i class="fas fa-times"></i></button>
      <button class="btn btn-sm btn-info" onclick="classeDetail.ouvrirJustification(${e.id})" title="Justifier"><i class="fas fa-comment"></i></button>
    </div></td></tr>`;}).join(''):`<tr class="empty-row"><td colspan="6"><i class="fas fa-user-slash empty-icon"></i><p>Aucun élève</p></td></tr>`}</tbody></table></div>`;
    }

    tabPresencesStats() {
        return `<div id="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:1rem">
  ${this.eleves.map(e => { const taux=Math.floor(Math.random()*25)+70; const c=taux>=70?'var(--success)':taux>=50?'var(--warning)':'var(--danger)';
    return `<div class="ui-card presences-item" data-matricule="${e.matricule.toLowerCase()}" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}"><div class="card-body" style="text-align:center">
      <div style="width:65px;height:65px;border-radius:50%;background:conic-gradient(${c} ${taux}%,var(--input-bg) ${taux}%);display:flex;align-items:center;justify-content:center;margin:0 auto 0.6rem">
        <div style="width:48px;height:48px;border-radius:50%;background:var(--glass);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem">${taux}%</div>
      </div>
      <strong style="display:block;font-size:0.85rem">${e.prenom} ${e.nom}</strong><span style="color:var(--text-muted);font-size:0.75rem">${e.matricule}</span>
    </div></div>`; }).join('')}
</div>`;
    }

    filtrer() {
        const q = document.getElementById('search-eleves')?.value?.toLowerCase()?.trim() || '';
        const clearBtn = document.getElementById('search-eleves-clear');
        if (clearBtn) clearBtn.style.display = q ? '' : 'none';
        let visible = 0;
        document.querySelectorAll('.eleve-row, .presences-item').forEach(el => {
            const match = el.dataset.nom?.includes(q) || el.dataset.matricule?.includes(q);
            el.style.display = match ? '' : 'none';
            if (match) visible++;
        });
        const noMatch = document.getElementById('no-match');
        const container = document.getElementById('liste-container') || document.getElementById('presence-container') || document.getElementById('stats-grid');
        if (noMatch) noMatch.style.display = q && visible === 0 ? '' : 'none';
        if (container) container.style.display = q && visible === 0 ? 'none' : '';
    }

    async pointer(eleveId, statut) {
        try { const r=await API.pointerPresence({eleve_id:eleveId,statut,methode_pointage:'MANUEL'}); if(r.success){const e=this.eleves.find(el=>el.id==eleveId);if(e){e.statut=statut;e.justification=null;}await this.renderTab();}else this.ouvrirAlert('Erreur',r.message||'Échec','error'); }
        catch(e){this.ouvrirAlert('Erreur',e.message,'error');}
    }

    ouvrirJustification(eleveId) {
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-justif';overlay.style.zIndex='1100';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div class="modal" style="max-width:400px" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-comment-medical"></i> Justifier l'absence</h3><button class="modal-close" onclick="document.getElementById('modal-justif').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body" style="display:flex;flex-direction:column;gap:0.6rem"><p style="color:var(--text-secondary);font-size:0.85rem">Sélectionnez un motif :</p>
    <button class="btn btn-secondary btn-full" onclick="classeDetail.justifier(${eleveId},'malade');document.getElementById('modal-justif').remove()"><i class="fas fa-thermometer-half"></i> Malade</button>
    <button class="btn btn-secondary btn-full" onclick="classeDetail.justifier(${eleveId},'endeuille');document.getElementById('modal-justif').remove()"><i class="fas fa-dove"></i> Endeuillé</button>
    <button class="btn btn-ghost btn-full" onclick="classeDetail.justifier(${eleveId},'pas_motif');document.getElementById('modal-justif').remove()"><i class="fas fa-question"></i> Pas de motif</button>
  </div><div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-justif').remove()">Annuler</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async justifier(eleveId, justification) {
        try { const statut=(justification==='malade'||justification==='endeuille')?'justifie':'absent'; const r=await API.pointerPresence({eleve_id:eleveId,statut,justification,methode_pointage:'MANUEL'}); if(r.success){const e=this.eleves.find(el=>el.id==eleveId);if(e){e.statut=statut;e.justification=justification;}await this.renderTab();}else this.ouvrirAlert('Erreur',r.message||'Échec','error'); }
        catch(e){this.ouvrirAlert('Erreur',e.message,'error');}
    }

    ouvrirAlert(titre,message,type){
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.style.zIndex='2000';overlay.id='alert-'+Date.now();
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        const icones={error:'exclamation-circle',success:'check-circle',warning:'exclamation-triangle',info:'info-circle'};
        const couleurs={error:'var(--danger)',success:'var(--success)',warning:'var(--warning)',info:'var(--info)'};
        overlay.innerHTML=`<div class="modal" style="max-width:380px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem 1.5rem"><i class="fas fa-${icones[type]||'info-circle'}" style="font-size:2.5rem;color:${couleurs[type]||'var(--primary)'};margin-bottom:0.75rem;display:block"></i><h3 style="margin-bottom:0.5rem">${titre}</h3><p style="color:var(--text-secondary);font-size:0.9rem">${message}</p><button class="btn btn-primary" style="margin-top:1.25rem;width:100%" onclick="document.getElementById('${overlay.id}').remove()">OK</button></div></div>`;
        document.body.appendChild(overlay);
    }
}