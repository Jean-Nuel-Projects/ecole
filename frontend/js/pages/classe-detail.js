class ClasseDetailPage {
    constructor(id) { this.id = id; this.classe = null; this.eleves = []; this.tabActif = 'liste'; }
    async render(p) {
        const m = document.getElementById('main-content');
        m.innerHTML = `<div style="text-align:center;padding:3rem"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:0.75rem">Chargement...</p></div>`;
        try { const cr = await API.getClasseStats(this.id); this.classe = cr.data || {}; const er = await API.getElevesByClasse(this.id); this.eleves = er.data || []; for (const e of this.eleves) { e.statut = e.statut || '?'; e.init = (e.prenom||'').charAt(0)+(e.nom||'').charAt(0); } await this.afficher(m); }
        catch(e) { m.innerHTML = `<div style="text-align:center;padding:3rem"><i class="fas fa-exclamation-triangle" style="font-size:2.5rem;color:var(--text-muted)"></i><p style="color:var(--text-secondary)">${e.message}</p></div>`; }
    }
    async afficher(m) {
        const c = this.classe;
        const searchRendu = await CL.render('forms/search-bar', { id: 'search-eleves', placeholder: 'Rechercher un élève...', oninput: "classeDetail.filtrer();var c=document.getElementById('search-eleves-clear');if(c)c.style.display=this.value?'':'none'", onclear: 'classeDetail.filtrer()' });
        m.innerHTML = `<div class="classe-detail-container">
  <div class="classe-header-bar"><button class="btn btn-ghost" onclick="router.navigate('dashboard')"><i class="fas fa-arrow-left"></i> Retour</button><div class="classe-header-info"><h2>${c.nom_classe||'Classe '+this.id}</h2><p><i class="fas fa-user-graduate"></i> ${c.nb_eleves||0} élèves<span>|</span><i class="fas fa-user-check" style="color:var(--success)"></i> ${c.presents||0} présents aujourd'hui</p></div><button class="btn btn-primary" onclick="classeDetail.ouvrirModalAjouter()"><i class="fas fa-user-plus"></i> Ajouter un élève</button></div>
  <div class="tab-switcher"><button class="tab-btn ${this.tabActif==='liste'?'active':''}" onclick="classeDetail.switchTab('liste')"><i class="fas fa-list"></i> Liste</button><button class="tab-btn ${this.tabActif==='presences'?'active':''}" onclick="classeDetail.switchTab('presences')"><i class="fas fa-calendar-check"></i> Présences du jour</button></div>
  ${searchRendu}<div id="tab-content"></div></div>`;
        this.renderTab();
    }
    async switchTab(tab) { this.tabActif = tab; this.renderTab(); }
    renderTab() { const tc = document.getElementById('tab-content'); if (tc) tc.innerHTML = this.tabActif === 'liste' ? this.tabListe() : this.tabPresences(); }

    tabListe() {
        return `<div class="table-container"><table class="data-table"><thead><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Genre</th><th style="text-align:center">Statut</th><th style="width:110px;text-align:center">Actions</th></tr></thead>
  <tbody>${this.eleves.length?this.eleves.map(e=>`<tr class="clickable-row eleve-row" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}" onclick="router.navigate('eleves/${e.id}')">
    <td><strong style="color:var(--primary)">${e.matricule}</strong></td><td>${e.nom}</td><td>${e.prenom}</td>
    <td><span class="badge badge-info"><i class="fas fa-${e.genre==='M'?'mars':'venus'}"></i> ${e.genre==='M'?'M':'F'}</span></td>
    <td style="text-align:center"><span class="badge badge-${e.statut==='present'?'success':e.statut==='absent'?'danger':e.statut==='retard'?'warning':e.statut==='justifie'?'info':'info'}"><i class="fas fa-${e.statut==='present'?'check':e.statut==='absent'?'times':e.statut==='retard'?'clock':e.statut==='justifie'?'check-circle':'question'}"></i> ${e.statut==='present'?'Présent':e.statut==='absent'?'Absent':e.statut==='retard'?'Retard':e.statut==='justifie'?'Justifié':'?'}</span></td>
    <td style="text-align:center"><div class="actions-cell" style="justify-content:center">
      <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();router.navigate('eleves/${e.id}')" title="Profil"><i class="fas fa-eye"></i></button>
      <button class="btn btn-sm btn-success" onclick="event.stopPropagation();classeDetail.pointer(${e.id},'present')" title="Présent"><i class="fas fa-check"></i></button>
      <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();classeDetail.pointer(${e.id},'absent')" title="Absent"><i class="fas fa-times"></i></button>
    </div></td></tr>`).join(''):`<tr class="empty-row"><td colspan="6"><i class="fas fa-user-slash empty-icon"></i><p>Aucun élève</p><button class="btn btn-primary btn-sm" onclick="classeDetail.ouvrirModalAjouter()"><i class="fas fa-user-plus"></i> Ajouter</button></td></tr>`}</tbody></table></div>`;
    }

    tabPresences() {
        const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        return `<p style="color:var(--text-secondary);margin-bottom:1rem"><i class="fas fa-calendar-alt"></i> ${today}</p>
  <div class="table-container"><table class="data-table"><thead><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th style="text-align:center">Statut</th><th style="text-align:center">Justification</th><th style="width:140px;text-align:center">Actions</th></tr></thead>
  <tbody>${this.eleves.length?this.eleves.map(e=>{
    const bc=e.statut==='present'?'success':e.statut==='absent'?'danger':e.statut==='retard'?'warning':e.statut==='justifie'?'info':'info';
    const bi=e.statut==='present'?'check':e.statut==='absent'?'times':e.statut==='retard'?'clock':e.statut==='justifie'?'check-circle':'question';
    const bl=e.statut==='present'?'Présent':e.statut==='absent'?'Absent':e.statut==='retard'?'Retard':e.statut==='justifie'?'Justifié':'?';
    const jl=e.justification==='malade'?'Malade':e.justification==='endeuille'?'Endeuillé':e.justification==='pas_motif'?'Pas de motif':'—';
    return `<tr class="presences-item" data-nom="${e.nom.toLowerCase()} ${e.prenom.toLowerCase()}">
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

    async pointer(eleveId, statut) {
        try { const r=await API.pointerPresence({eleve_id:eleveId,statut,methode_pointage:'MANUEL'}); if(r.success){const e=this.eleves.find(el=>el.id==eleveId);if(e){e.statut=statut;e.justification=null;}this.renderTab();}else this.ouvrirAlert('Erreur',r.message||'Échec','error'); }
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
        try {
            const statut=(justification==='malade'||justification==='endeuille')?'justifie':'absent';
            const r=await API.pointerPresence({eleve_id:eleveId,statut,justification,methode_pointage:'MANUEL'});
            if(r.success){const e=this.eleves.find(el=>el.id==eleveId);if(e){e.statut=statut;e.justification=justification;}this.renderTab();}
            else this.ouvrirAlert('Erreur',r.message||'Échec','error');
        }catch(e){this.ouvrirAlert('Erreur',e.message,'error');}
    }

    filtrer(){const q=document.getElementById('search-eleves')?.value.toLowerCase()||'';document.querySelectorAll('.eleve-row,.presences-item').forEach(el=>{el.style.display=el.dataset.nom.includes(q)?'':'none';});}

    ouvrirAlert(titre,message,type){
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.style.zIndex='2000';overlay.id='alert-'+Date.now();
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        const icones={error:'exclamation-circle',success:'check-circle',warning:'exclamation-triangle',info:'info-circle'};
        const couleurs={error:'var(--danger)',success:'var(--success)',warning:'var(--warning)',info:'var(--info)'};
        overlay.innerHTML=`<div class="modal" style="max-width:380px;text-align:center" onclick="event.stopPropagation()"><div class="modal-body" style="padding:2rem 1.5rem"><i class="fas fa-${icones[type]||'info-circle'}" style="font-size:2.5rem;color:${couleurs[type]||'var(--primary)'};margin-bottom:0.75rem;display:block"></i><h3 style="margin-bottom:0.5rem">${titre}</h3><p style="color:var(--text-secondary);font-size:0.9rem">${message}</p><button class="btn btn-primary" style="margin-top:1.25rem;width:100%" onclick="document.getElementById('${overlay.id}').remove()">OK</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async ouvrirModalAjouter(){
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-ajouter';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        const aOption=['1ère','2ème','3ème','4ème'].some(n=>this.classe?.nom_classe?.includes(n));
        overlay.innerHTML=`<div class="modal" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-user-plus"></i> Ajouter un élève</h3><button class="modal-close" onclick="document.getElementById('modal-ajouter').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body"><form id="form-ajouter" onsubmit="return false">
    <div class="input-group"><label class="input-label">Nom <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="aj-nom" required></div></div>
    <div class="input-group"><label class="input-label">Prénom <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-user input-icon"></i><input type="text" class="form-input" id="aj-prenom" required></div></div>
    <div class="input-group"><label class="input-label">Date de naissance <span class="required">*</span></label><div class="input-wrapper"><i class="fas fa-calendar input-icon"></i><input type="date" class="form-input" id="aj-date" required></div></div>
    <div class="input-group"><label class="input-label">Genre <span class="required">*</span></label><div class="select-wrapper"><select class="form-select" id="aj-genre" required><option value="">Sélectionner</option><option value="M">Masculin</option><option value="F">Féminin</option></select><i class="fas fa-chevron-down select-arrow"></i></div></div>
    <div class="input-group"><label class="input-label">Adresse</label><div class="input-wrapper"><i class="fas fa-map-marker-alt input-icon"></i><input type="text" class="form-input" id="aj-adresse"></div></div>
    <div class="input-group"><label class="input-label">Classe <span class="required">*</span></label><div class="input-wrapper" style="cursor:pointer" onclick="classeDetail.ouvrirModalClasses()"><i class="fas fa-graduation-cap input-icon"></i><input type="text" class="form-input" id="aj-classe-nom" readonly placeholder="Cliquer pour choisir..." value="${this.classe?.nom_classe||''}" required><input type="hidden" id="aj-classe-id" value="${this.id}"><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.8rem"></i></div></div>
    ${aOption?`<div class="input-group"><label class="input-label">Option <span class="required">*</span></label><div class="input-wrapper" style="cursor:pointer" onclick="classeDetail.ouvrirModalOptionsPourAjout()"><i class="fas fa-cog input-icon"></i><input type="text" class="form-input" id="aj-option-nom" readonly placeholder="Cliquer pour choisir..." required><input type="hidden" id="aj-option-id" value=""><i class="fas fa-chevron-down" style="position:absolute;right:0.8rem;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:0.8rem"></i></div></div>`:''}
  </form></div><div class="modal-footer"><button class="btn btn-ghost" onclick="document.getElementById('modal-ajouter').remove()">Annuler</button><button class="btn btn-primary" onclick="classeDetail.ajouter()"><i class="fas fa-save"></i> Enregistrer</button></div></div>`;
        document.body.appendChild(overlay);
    }

    async ouvrirModalClasses(){
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-classes';overlay.style.zIndex='1100';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div style="text-align:center;padding:3rem"><div class="spinner"></div></div>`;document.body.appendChild(overlay);
        try{
            const instId=this.classe?.institution_id;const url=instId?`/classes/institution/${instId}`:'/classes';
            const classesRes=await apiGet(url);const classes=classesRes.data||[];
            overlay.innerHTML=`<div class="modal" style="max-width:420px" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-graduation-cap"></i> Choisir une classe</h3><button class="modal-close" onclick="document.getElementById('modal-classes').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body" style="display:flex;flex-direction:column;gap:0.4rem;max-height:320px;overflow-y:auto">${classes.length?classes.map(c=>`<div class="ui-card card-hoverable" onclick="document.getElementById('aj-classe-nom').value='${c.nom_classe.replace(/'/g,"\\'")}';document.getElementById('aj-classe-id').value='${c.id}';document.getElementById('modal-classes').remove()" style="cursor:pointer"><div style="padding:0.7rem 1rem;display:flex;align-items:center;gap:0.6rem"><i class="fas fa-users" style="color:var(--primary)"></i><div style="flex:1"><span style="font-size:0.9rem;font-weight:500">${c.nom_classe}</span><p style="color:var(--text-muted);font-size:0.75rem">${c.nb_eleves||0} élèves</p></div><i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem"></i></div></div>`).join(''):'<p style="text-align:center;color:var(--text-muted);padding:1rem">Aucune classe trouvée</p>'}</div></div>`;
        }catch(e){overlay.innerHTML=`<div class="modal" style="max-width:380px;text-align:center"><div class="modal-body" style="padding:2rem"><i class="fas fa-exclamation-circle" style="font-size:2.5rem;color:var(--danger);margin-bottom:0.75rem;display:block"></i><h3>Erreur</h3><p>${e.message}</p><button class="btn btn-primary" style="margin-top:1rem;width:100%" onclick="document.getElementById('modal-classes').remove()">OK</button></div></div>`;}
    }

    async ouvrirModalOptionsPourAjout(){
        const classeId=document.getElementById('aj-classe-id')?.value||this.id;
        const overlay=document.createElement('div');overlay.className='modal-overlay';overlay.id='modal-options-ajout';overlay.style.zIndex='1200';
        overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};
        overlay.innerHTML=`<div style="text-align:center;padding:3rem"><div class="spinner"></div></div>`;document.body.appendChild(overlay);
        try{
            const res=await API.getClasseOptions(classeId);const options=res.data||[];
            const icns={CG:'chart-line',MG:'cogs',BC:'flask',MP:'calculator',PE:'book',EL:'bolt',CT:'cut'};
            overlay.innerHTML=`<div class="modal" style="max-width:420px" onclick="event.stopPropagation()"><div class="modal-header"><h3><i class="fas fa-cog"></i> Choisir une option</h3><button class="modal-close" onclick="document.getElementById('modal-options-ajout').remove()"><i class="fas fa-times"></i></button></div>
  <div class="modal-body" style="display:flex;flex-direction:column;gap:0.4rem;max-height:320px;overflow-y:auto">${options.length?options.map(o=>`<div class="ui-card card-hoverable" onclick="document.getElementById('aj-option-nom').value='${o.nom.replace(/'/g,"\\'")}';document.getElementById('aj-option-id').value='${o.classe_option_id}';document.getElementById('modal-options-ajout').remove()" style="cursor:pointer"><div style="padding:0.7rem 1rem;display:flex;align-items:center;gap:0.6rem"><div style="width:36px;height:36px;border-radius:8px;background:var(--gradient-1);display:flex;align-items:center;justify-content:center;color:white;font-size:0.85rem"><i class="fas fa-${icns[o.code]||'book'}"></i></div><div style="flex:1"><span style="font-size:0.9rem;font-weight:500">${o.nom}</span><p style="color:var(--text-muted);font-size:0.75rem">${o.code} · ${o.nb_eleves||0} élèves</p></div><i class="fas fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem"></i></div></div>`).join(''):'<p style="text-align:center;color:var(--text-muted);padding:1rem">Aucune option disponible</p>'}</div></div>`;
        }catch(e){overlay.innerHTML=`<div class="modal" style="max-width:380px;text-align:center"><div class="modal-body" style="padding:2rem"><i class="fas fa-exclamation-circle" style="font-size:2.5rem;color:var(--danger);margin-bottom:0.75rem;display:block"></i><h3>Erreur</h3><p>${e.message}</p><button class="btn btn-primary" style="margin-top:1rem;width:100%" onclick="document.getElementById('modal-options-ajout').remove()">OK</button></div></div>`;}
    }

    async ajouter(){
        const nom=document.getElementById('aj-nom')?.value?.trim(),prenom=document.getElementById('aj-prenom')?.value?.trim(),date_naissance=document.getElementById('aj-date')?.value,genre=document.getElementById('aj-genre')?.value,adresse=document.getElementById('aj-adresse')?.value?.trim(),classe_id=document.getElementById('aj-classe-id')?.value,option_id=document.getElementById('aj-option-id')?.value;
        if(!nom||!prenom||!date_naissance||!genre||!classe_id){this.ouvrirAlert('Champs requis','Veuillez remplir tous les champs obligatoires.','warning');return;}
        const aOption=['1ère','2ème','3ème','4ème'].some(n=>this.classe?.nom_classe?.includes(n));
        if(aOption&&!option_id){this.ouvrirAlert('Option requise','Veuillez sélectionner une option.','warning');return;}
        try{
            const data={nom,prenom,date_naissance,genre,adresse,classe_id:parseInt(classe_id)};
            if(option_id)data.classe_option_id=parseInt(option_id);
            const r=await API.createEleve(data);
            if(r.success){document.getElementById('modal-ajouter')?.remove();await this.render();}
            else this.ouvrirAlert('Erreur',r.message||'Échec','error');
        }catch(e){this.ouvrirAlert('Erreur',e.message,'error');}
    }
}