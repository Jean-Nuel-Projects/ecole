USE school_management;

-- Institutions
INSERT INTO institutions (nom, niveau, adresse, telephone, email, logo, annee_scolaire) VALUES
('Complexe Scolaire Avenir', 'maternelle', '123 Avenue École, Kinshasa', '+243810000000', 'info@avenir.cd', '/assets/logo-ecole.png', '2024-2025'),
('Complexe Scolaire Avenir', 'primaire', '123 Avenue École, Kinshasa', '+243810000000', 'info@avenir.cd', '/assets/logo-ecole.png', '2024-2025'),
('Complexe Scolaire Avenir', 'secondaire', '123 Avenue École, Kinshasa', '+243810000000', 'info@avenir.cd', '/assets/logo-ecole.png', '2024-2025');

-- Options
INSERT INTO options_secondaire (code, nom, description) VALUES
('CG', 'Commerciale et Gestion', 'Section commerciale'),
('MG', 'Mécanique Générale', 'Section mécanique'),
('BC', 'Bio-Chimie', 'Section bio-chimie'),
('MP', 'Math-Physique', 'Section math-physique'),
('PE', 'Pédagogie', 'Section pédagogique');

-- Classes Maternelle
INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES
(1, '1ère Maternelle', '1ère', 25),
(1, '2ème Maternelle', '2ème', 25),
(1, '3ème Maternelle', '3ème', 25);

-- Classes Primaire
INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES
(2, '1ère Primaire', '1ère', 35),
(2, '2ème Primaire', '2ème', 35),
(2, '3ème Primaire', '3ème', 35),
(2, '4ème Primaire', '4ème', 35),
(2, '5ème Primaire', '5ème', 35),
(2, '6ème Primaire', '6ème', 35);

-- Classes Secondaire (sans option)
INSERT INTO classes (institution_id, nom_classe, niveau_detail, capacite) VALUES
(3, '7ème E.B', '7ème', 40),
(3, '8ème E.B', '8ème', 40),
(3, '1ère Secondaire', '1ère', 0),
(3, '2ème Secondaire', '2ème', 0),
(3, '3ème Secondaire', '3ème', 0),
(3, '4ème Secondaire', '4ème', 0);

-- Lier 1ère Secondaire aux options
INSERT INTO classe_options (classe_id, option_id, capacite) VALUES
(12, 1, 35), (12, 2, 30), (12, 3, 35), (12, 4, 35), (12, 5, 30);

-- Lier 2ème aux options
INSERT INTO classe_options (classe_id, option_id, capacite) VALUES
(13, 1, 35), (13, 2, 30), (13, 3, 35), (13, 4, 35), (13, 5, 30);

-- Lier 3ème aux options
INSERT INTO classe_options (classe_id, option_id, capacite) VALUES
(14, 1, 35), (14, 2, 30), (14, 3, 35), (14, 4, 35), (14, 5, 30);

-- Lier 4ème aux options
INSERT INTO classe_options (classe_id, option_id, capacite) VALUES
(15, 1, 35), (15, 2, 30), (15, 3, 35), (15, 4, 35), (15, 5, 30);

-- Élèves Maternelle (classe_id 1 à 3)
INSERT INTO eleves (matricule, nom, prenom, date_naissance, genre, adresse, classe_id, date_inscription) VALUES
('ELV001', 'Dupont', 'Jean', '2018-05-15', 'M', '123 Rue Principale', 1, '2024-09-01'),
('ELV002', 'Kabila', 'Sarah', '2018-08-22', 'F', '456 Avenue Commerce', 1, '2024-09-01'),
('ELV003', 'Mutombo', 'David', '2017-03-10', 'M', '789 Boulevard National', 2, '2024-09-01'),
('ELV004', 'Ngoy', 'Grace', '2018-12-05', 'F', '321 Avenue Écoles', 2, '2024-09-01'),
('ELV005', 'Lumumba', 'Patrick', '2017-06-18', 'M', '567 Rue Paix', 3, '2024-09-01');

-- Élèves Primaire (classe_id 4 à 9)
INSERT INTO eleves (matricule, nom, prenom, date_naissance, genre, adresse, classe_id, date_inscription) VALUES
('ELV006', 'Kabange', 'Marie', '2014-02-14', 'F', '12 Rue Fleuve', 4, '2024-09-01'),
('ELV007', 'Ilunga', 'Joseph', '2014-07-20', 'M', '34 Avenue Montagne', 4, '2024-09-01'),
('ELV008', 'Kasongo', 'Esther', '2013-11-08', 'F', '56 Boulevard Lac', 5, '2024-09-01'),
('ELV009', 'Mwamba', 'Daniel', '2013-04-25', 'M', '78 Rue Rivière', 6, '2024-09-01');

-- Élèves Secondaire (7è et 8è)
INSERT INTO eleves (matricule, nom, prenom, date_naissance, genre, adresse, classe_id, date_inscription) VALUES
('ELV010', 'Kabila', 'Emmanuel', '2008-04-15', 'M', '12 Avenue Président', 10, '2024-09-01'),
('ELV011', 'Tshisekedi', 'Félix', '2008-07-20', 'M', '34 Rue Palais', 10, '2024-09-01'),
('ELV012', 'Mukwege', 'Denis', '2007-11-08', 'M', '56 Boulevard Hôpital', 11, '2024-09-01');

-- Élèves Secondaire 1ère CG (classe_id=12, classe_option_id=1)
INSERT INTO eleves (matricule, nom, prenom, date_naissance, genre, adresse, classe_id, classe_option_id, date_inscription) VALUES
('ELV013', 'Ngalula', 'Paul', '2006-09-30', 'M', '90 Rue Commerce', 12, 1, '2024-09-01'),
('ELV014', 'Mbuyi', 'Chantal', '2006-01-15', 'F', '123 Avenue Banque', 12, 1, '2024-09-01');

-- Responsables
INSERT INTO responsables (eleve_id, nom_complet, lien_parente, telephone, email, whatsapp) VALUES
(1, 'Pierre Dupont', 'Père', '+243810000001', 'pierre@email.cd', '+243810000001'),
(2, 'Joseph Kabila', 'Père', '+243810000003', '', '+243810000003'),
(13, 'Martin Ngalula', 'Père', '+243810000010', 'martin@email.cd', '+243810000010');

-- Présences du jour
INSERT INTO presences (eleve_id, date_presence, statut, heure_arrivee, methode_pointage) VALUES
(1, CURDATE(), 'present', '07:30', 'MANUEL'),
(2, CURDATE(), 'present', '07:35', 'MANUEL'),
(3, CURDATE(), 'retard', '08:10', 'MANUEL'),
(10, CURDATE(), 'present', '07:25', 'MANUEL'),
(11, CURDATE(), 'absent', NULL, 'MANUEL'),
(13, CURDATE(), 'present', '07:40', 'MANUEL');