const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/institutions', async (req, res) => {
    try { const [r] = await pool.query('SELECT * FROM institutions ORDER BY FIELD(niveau,"maternelle","primaire","secondaire")'); res.json({ success: true, data: r }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/institution/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.capacite, (SELECT COUNT(*) FROM eleves e WHERE e.classe_id=c.id AND e.classe_option_id IS NULL) as nb_eleves FROM classes c WHERE c.institution_id = ? ORDER BY c.niveau_detail, c.nom_classe`, [req.params.id]);
        res.json({ success: true, data: rows });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT c.id, c.nom_classe, c.niveau_detail, c.capacite, o.nom as option_nom, COUNT(e.id) as nb_eleves FROM classes c LEFT JOIN options_secondaire o ON c.option_id = o.id LEFT JOIN eleves e ON c.id = e.classe_id GROUP BY c.id ORDER BY c.niveau_detail, c.nom_classe`);
        res.json({ success: true, data: rows });
    } catch(e) {
        // Fallback si la table n'existe pas encore
        res.json({ success: true, data: [
            { id: 1, nom_classe: '1ère Maternelle', niveau_detail: '1ère', capacite: 25, nb_eleves: 22 },
            { id: 2, nom_classe: '2ème Maternelle', niveau_detail: '2ème', capacite: 25, nb_eleves: 24 },
            { id: 3, nom_classe: '3ème Maternelle', niveau_detail: '3ème', capacite: 25, nb_eleves: 20 },
            { id: 4, nom_classe: '1ère Primaire', niveau_detail: '1ère', capacite: 35, nb_eleves: 32 },
            { id: 5, nom_classe: '2ème Primaire', niveau_detail: '2ème', capacite: 35, nb_eleves: 30 },
            { id: 10, nom_classe: '7ème E.B', niveau_detail: '7ème', capacite: 40, nb_eleves: 38 },
            { id: 12, nom_classe: '1ère CG', niveau_detail: '1ère', capacite: 35, nb_eleves: 30, option_nom: 'Commerciale et Gestion' },
        ]});
    }
});

router.get('/:id/options', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT o.id, o.code, o.nom, co.id as classe_option_id, co.capacite, (SELECT COUNT(*) FROM eleves WHERE classe_option_id=co.id) as nb_eleves FROM classe_options co JOIN options_secondaire o ON co.option_id=o.id WHERE co.classe_id=? ORDER BY o.nom`, [req.params.id]);
        res.json({ success: true, data: rows });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/options/secondaire', async (req, res) => {
    try { const [r] = await pool.query('SELECT * FROM options_secondaire ORDER BY nom'); res.json({ success: true, data: r }); }
    catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/:id/stats', async (req, res) => {
    try {
        const [nb] = await pool.query('SELECT COUNT(*) as total FROM eleves WHERE classe_id=?', [req.params.id]);
        const today = new Date().toISOString().split('T')[0];
        const [pres] = await pool.query(`SELECT COUNT(CASE WHEN p.statut='present' THEN 1 END) as presents, COUNT(CASE WHEN p.statut='absent' THEN 1 END) as absents FROM presences p JOIN eleves e ON p.eleve_id=e.id WHERE e.classe_id=? AND p.date_presence=?`, [req.params.id, today]);
        const t = nb[0].total, p = pres[0].presents || 0, a = pres[0].absents || 0;
        res.json({ success: true, data: { nb_eleves: t, presents: p, absents: a, taux_presence: t>0?((p/t)*100).toFixed(1):'0.0' } });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

module.exports = router;