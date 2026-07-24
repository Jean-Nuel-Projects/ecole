const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Pointage d'un élève
router.post('/', async (req, res) => {
    try {
        const { eleve_id, statut, methode_pointage, empreinte_validee } = req.body;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        if (methode_pointage === 'QR+EMPREINTE' && !empreinte_validee) {
            return res.status(400).json({
                success: false,
                message: 'Validation par empreinte digitale requise'
            });
        }

        const [existing] = await pool.query(
            'SELECT id FROM presences WHERE eleve_id = ? AND date_presence = ?',
            [eleve_id, today]
        );

        if (existing.length > 0) {
            await pool.query(
                'UPDATE presences SET statut = ?, heure_arrivee = ?, methode_pointage = ? WHERE id = ?',
                [statut, now, methode_pointage, existing[0].id]
            );
            return res.json({ success: true, message: 'Présence mise à jour' });
        }

        await pool.query(
            `INSERT INTO presences (eleve_id, date_presence, statut, heure_arrivee, methode_pointage) 
             VALUES (?, ?, ?, ?, ?)`,
            [eleve_id, today, statut, now, methode_pointage]
        );

        res.status(201).json({ success: true, message: 'Pointage enregistré avec succès' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Récupérer les présences d'un élève
router.get('/eleve/:eleveId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM presences 
             WHERE eleve_id = ? 
             ORDER BY date_presence DESC 
             LIMIT 30`,
            [req.params.eleveId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Récupérer les présences du jour pour une classe
router.get('/classe/:classeId', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [rows] = await pool.query(
            `SELECT e.id, e.matricule, e.nom, e.prenom, e.genre,
                    p.statut, p.heure_arrivee, p.methode_pointage
             FROM eleves e
             LEFT JOIN presences p ON e.id = p.eleve_id AND p.date_presence = ?
             WHERE e.classe_id = ?
             ORDER BY e.nom, e.prenom`,
            [today, req.params.classeId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;