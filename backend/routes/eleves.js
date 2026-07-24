const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const pool = require('../config/database');

router.get('/classe/:classeId', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT e.id, e.matricule, e.nom, e.prenom, e.genre, e.date_naissance, p.statut, p.justification FROM eleves e LEFT JOIN presences p ON e.id=p.eleve_id AND p.date_presence=CURDATE() WHERE e.classe_id=? ORDER BY e.nom, e.prenom`, [req.params.classeId]);
        res.json({ success: true, data: rows });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [eleve] = await pool.query(`SELECT e.*, c.nom_classe as classe_nom FROM eleves e LEFT JOIN classes c ON e.classe_id=c.id WHERE e.id=?`, [req.params.id]);
        if (!eleve.length) return res.status(404).json({ success: false, message: 'Élève non trouvé' });
        const [responsables] = await pool.query('SELECT * FROM responsables WHERE eleve_id=?', [req.params.id]);
        const [presences] = await pool.query('SELECT date_presence, statut, justification FROM presences WHERE eleve_id=? ORDER BY date_presence DESC LIMIT 30', [req.params.id]);
        const [stats] = await pool.query(`SELECT COUNT(CASE WHEN statut='present' THEN 1 END) as presents, COUNT(CASE WHEN statut='absent' THEN 1 END) as absents, COUNT(CASE WHEN statut='retard' THEN 1 END) as retards, COUNT(*) as total FROM presences WHERE eleve_id=?`, [req.params.id]);
        const s = stats[0];
        res.json({ success: true, data: { ...eleve[0], responsables, presences, stats_presence: s, taux_presence: s.total>0?((s.presents/s.total)*100).toFixed(1):0 } });
    } catch(e) { res.status(500).json({ success: false, error: e.message }); }
});

router.post('/', async (req, res) => {
    const conn = await pool.getConnection();
    try {
        const { nom, prenom, date_naissance, genre, adresse, classe_id, classe_option_id, responsables } = req.body;
        const matricule = 'ELV' + Date.now();
        const qrData = JSON.stringify({ matricule, nom, prenom, classe_id });
        const qrCode = await QRCode.toDataURL(qrData);
        await conn.beginTransaction();
        const [r] = await conn.query('INSERT INTO eleves (matricule, nom, prenom, date_naissance, genre, adresse, classe_id, classe_option_id, qr_code, date_inscription) VALUES (?,?,?,?,?,?,?,?,?,CURDATE())', [matricule, nom, prenom, date_naissance, genre, adresse||null, classe_id, classe_option_id||null, qrCode]);
        if (responsables && responsables.length) { for (const resp of responsables) { await conn.query('INSERT INTO responsables (eleve_id, nom_complet, lien_parente, telephone, email, whatsapp) VALUES (?,?,?,?,?,?)', [r.insertId, resp.nom_complet, resp.lien_parente, resp.telephone, resp.email||null, resp.whatsapp||null]); } }
        await conn.commit();
        res.status(201).json({ success: true, data: { id: r.insertId, matricule, qr_code: qrCode } });
    } catch(e) { await conn.rollback(); res.status(500).json({ success: false, error: e.message }); }
    finally { conn.release(); }
});

module.exports = router;