#!/bin/bash

# ============================================
# Script de Synchronisation Eco
# ============================================
# Description: Automatise la synchronisation entre machines
# Usage: ./sync.sh [options]
# ============================================

# Couleurs pour un affichage agréable
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'
BOLD='\033[1m'

# ============================================
# CONFIGURATION
# ============================================
BRANCH="main"
REMOTE="origin"
HOSTNAME=$(hostname)

# ============================================
# FONCTIONS
# ============================================

# Afficher l'en-tête
show_header() {
    clear
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}         ${BOLD}🔄 ECO - Script de Synchronisation${NC}          ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}         Machine: ${CYAN}$HOSTNAME${NC}                           ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Afficher l'aide
show_help() {
    echo -e "${YELLOW}📖 UTILISATION:${NC}"
    echo -e "  ${CYAN}./sync.sh${NC}              - Synchronisation complète (pull → push)"
    echo -e "  ${CYAN}./sync.sh -p${NC}            - Pull seulement (récupérer les changements)"
    echo -e "  ${CYAN}./sync.sh -u \"msg\"${NC}     - Push seulement (envoyer les changements)"
    echo -e "  ${CYAN}./sync.sh -a \"msg\"${NC}     - Add + Commit + Push avec message"
    echo -e "  ${CYAN}./sync.sh -f${NC}            - Force push (attention !)"
    echo -e "  ${CYAN}./sync.sh -s${NC}            - Status du dépôt"
    echo -e "  ${CYAN}./sync.sh -l${NC}            - Voir les derniers commits"
    echo -e "  ${CYAN}./sync.sh -b${NC}            - Créer une branche de backup"
    echo -e "  ${CYAN}./sync.sh -h${NC}            - Affiche cette aide"
    echo ""
    echo -e "${YELLOW}💡 EXEMPLES:${NC}"
    echo -e "  ${CYAN}./sync.sh${NC}                        # Sync complète avec message auto"
    echo -e "  ${CYAN}./sync.sh -a \"Nouvelle fonction\"${NC}  # Commit avec message personnalisé"
    echo -e "  ${CYAN}./sync.sh -p${NC}                      # Récupérer le travail de l'autre machine"
    echo ""
}

# Vérifier si git est installé
check_git() {
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git n'est pas installé. Veuillez l'installer d'abord.${NC}"
        exit 1
    fi
}

# Vérifier si on est dans un dépôt git
check_git_repo() {
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        echo -e "${RED}❌ Ce dossier n'est pas un dépôt Git.${NC}"
        echo -e "${YELLOW}💡 Initialise-le avec: git init${NC}"
        exit 1
    fi
}

# Vérifier la connexion internet
check_internet() {
    if ! ping -c 1 github.com &> /dev/null; then
        echo -e "${RED}❌ Pas de connexion internet.${NC}"
        echo -e "${YELLOW}💡 Le travail local reste possible, synchronise plus tard.${NC}"
        return 1
    fi
    return 0
}

# Obtenir le timestamp
get_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M')"
}

# Obtenir le nom de la machine
get_machine_name() {
    echo "$HOSTNAME"
}

# Fonction Pull (Récupérer les changements)
do_pull() {
    echo -e "${BLUE}📥 RÉCUPÉRATION DES CHANGEMENTS...${NC}"
    echo -e "${CYAN}🌐 Machine actuelle: ${WHITE}$(get_machine_name)${NC}"
    echo ""
    
    # Sauvegarder les changements locaux non commités
    if ! git diff --quiet || ! git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  Changements locaux détectés. Sauvegarde temporaire (stash)...${NC}"
        git stash push -m "Auto-stash depuis $HOSTNAME - $(get_timestamp)"
        STASHED=true
    else
        STASHED=false
    fi
    
    # Fetch les dernières modifications
    echo -e "${CYAN}🔍 Recherche des mises à jour...${NC}"
    git fetch $REMOTE $BRANCH
    
    # Vérifier s'il y a des changements à pull
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        echo -e "${GREEN}✅ Déjà à jour ! Aucun changement distant.${NC}"
    else
        echo -e "${CYAN}📥 Récupération et fusion des changements...${NC}"
        if git pull $REMOTE $BRANCH; then
            echo -e "${GREEN}✅ Changements récupérés avec succès !${NC}"
        else
            echo -e "${RED}❌ Conflit lors du pull !${NC}"
            echo -e "${YELLOW}💡 Résous les conflits manuellement puis commit.${NC}"
            if [ "$STASHED" = true ]; then
                echo -e "${YELLOW}💡 Tes changements sont sauvegardés dans le stash.${NC}"
                echo -e "${YELLOW}💡 Utilise 'git stash pop' pour les récupérer après résolution.${NC}"
            fi
            exit 1
        fi
    fi
    
    # Restaurer les changements locaux si stash a été fait
    if [ "$STASHED" = true ]; then
        echo -e "${CYAN}📦 Restauration de tes changements locaux...${NC}"
        if git stash pop; then
            echo -e "${GREEN}✅ Changements locaux restaurés.${NC}"
        else
            echo -e "${RED}⚠️  Conflit avec le stash ! Résous manuellement.${NC}"
        fi
    fi
}

# Fonction Push (Envoyer les changements)
do_push() {
    local message="$1"
    local auto_add="$2"
    
    echo -e "${BLUE}📤 ENVOI DES CHANGEMENTS...${NC}"
    echo -e "${CYAN}🌐 Machine actuelle: ${WHITE}$(get_machine_name)${NC}"
    echo ""
    
    # Ajouter les fichiers
    if [ "$auto_add" = true ]; then
        echo -e "${CYAN}📦 Ajout de tous les fichiers modifiés...${NC}"
        git add .
    else
        # Vérifier si des fichiers sont modifiés mais non ajoutés
        if ! git diff --quiet; then
            echo -e "${YELLOW}⚠️  Fichiers modifiés mais non indexés:${NC}"
            git diff --name-only
            echo ""
            read -p "👉 Appuie sur ENTER pour ajouter tous les fichiers et continuer (Ctrl+C pour annuler)..."
            git add .
        fi
    fi
    
    # Vérifier s'il y a des changements à committer
    if git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  Aucun changement à publier.${NC}"
        return 0
    fi
    
    # Créer le message de commit
    if [ -z "$message" ]; then
        local machine=$(get_machine_name)
        local timestamp=$(get_timestamp)
        message="🔄 Sync depuis $machine - $timestamp"
    fi
    
    # Commit
    echo -e "${CYAN}💾 Création du commit...${NC}"
    if git commit -m "$message"; then
        echo -e "${GREEN}✅ Commit créé : ${WHITE}$message${NC}"
    else
        echo -e "${RED}❌ Erreur lors du commit.${NC}"
        exit 1
    fi
    
    # Push
    echo -e "${CYAN}🚀 Envoi vers GitHub...${NC}"
    if git push $REMOTE $BRANCH; then
        echo -e "${GREEN}✅ Publication réussie !${NC}"
        echo -e "${GREEN}🎉 L'autre machine pourra récupérer ces changements.${NC}"
    else
        echo -e "${RED}❌ Erreur lors du push.${NC}"
        echo -e "${YELLOW}💡 Vérifie ta connexion internet.${NC}"
        exit 1
    fi
}

# Fonction principale de synchronisation complète
do_full_sync() {
    local message="$1"
    local auto_add="$2"
    
    echo -e "${PURPLE}🔄 SYNCHRONISATION COMPLÈTE${NC}"
    echo ""
    
    # 1. D'abord récupérer les changements distants
    do_pull
    
    echo ""
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # 2. Puis envoyer les changements locaux
    do_push "$message" "$auto_add"
}

# Fonction pour afficher le statut
show_status() {
    echo -e "${CYAN}📊 STATUT DU DÉPÔT:${NC}"
    echo ""
    echo -e "${WHITE}🌐 Machine:${NC} $(get_machine_name)"
    echo -e "${WHITE}📅 Date:${NC} $(get_timestamp)"
    echo ""
    
    # Vérifier la connexion au remote
    if check_internet; then
        git fetch $REMOTE $BRANCH 2>/dev/null
        LOCAL=$(git rev-parse @)
        REMOTE_HASH=$(git rev-parse @{u} 2>/dev/null)
        BASE=$(git merge-base @ @{u} 2>/dev/null)
        
        echo -e "${CYAN}🔄 Synchronisation:${NC}"
        if [ "$LOCAL" = "$REMOTE_HASH" ]; then
            echo -e "${GREEN}   ✅ À jour avec GitHub${NC}"
        elif [ "$LOCAL" = "$BASE" ]; then
            echo -e "${YELLOW}   ⬇️  Des changements sont disponibles sur GitHub${NC}"
        elif [ "$REMOTE_HASH" = "$BASE" ]; then
            echo -e "${YELLOW}   ⬆️  Des changements locaux ne sont pas publiés${NC}"
        else
            echo -e "${RED}   🔀 Divergence détectée (merge nécessaire)${NC}"
        fi
    else
        echo -e "${YELLOW}   ⚠️  Vérification impossible (pas de connexion)${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}📝 État des fichiers:${NC}"
    git status --short
    
    echo ""
    echo -e "${YELLOW}💡 Dernier commit local:${NC}"
    git log -1 --oneline
}

# Fonction pour afficher les derniers commits
show_last_commits() {
    local count=${1:-10}
    echo -e "${CYAN}📜 DERNIERS $count COMMITS:${NC}"
    echo ""
    git log --oneline --graph --decorate -$count
}

# Fonction de backup
create_backup_branch() {
    local branch_name="backup_$(date '+%Y%m%d_%H%M')_${HOSTNAME}"
    echo -e "${CYAN}💾 Création d'une branche de backup: ${WHITE}$branch_name${NC}"
    
    # Sauvegarder les changements en cours
    if ! git diff --quiet || ! git diff --cached --quiet; then
        git add .
        git commit -m "Backup automatique avant création branche"
    fi
    
    git checkout -b "$branch_name"
    git push $REMOTE "$branch_name"
    git checkout $BRANCH
    echo -e "${GREEN}✅ Branche de backup créée et poussée !${NC}"
}

# ============================================
# PROGRAMME PRINCIPAL
# ============================================

# Vérifications initiales
check_git
check_git_repo

# Variables
PULL_ONLY=false
PUSH_ONLY=false
FORCE_PUSH=false
AUTO_ADD=false
MESSAGE=""
SHOW_HELP=false
SHOW_STATUS=false
SHOW_LOGS=false
BACKUP=false

# Parser les arguments
while getopts "ahslbpf" opt; do
    case $opt in
        a) AUTO_ADD=true ;;
        h) SHOW_HELP=true ;;
        s) SHOW_STATUS=true ;;
        l) SHOW_LOGS=true ;;
        b) BACKUP=true ;;
        p) PULL_ONLY=true ;;
        f) FORCE_PUSH=true ;;
        \?) echo -e "${RED}❌ Option invalide: -$OPTARG${NC}" >&2; show_help; exit 1 ;;
    esac
done

# Afficher l'en-tête
show_header

# Gérer l'aide
if [ "$SHOW_HELP" = true ]; then
    show_help
    exit 0
fi

# Gérer le statut
if [ "$SHOW_STATUS" = true ]; then
    show_status
    exit 0
fi

# Gérer les logs
if [ "$SHOW_LOGS" = true ]; then
    show_last_commits
    exit 0
fi

# Gérer le backup
if [ "$BACKUP" = true ]; then
    create_backup_branch
    exit 0
fi

# Récupérer le message (arguments restants)
shift $((OPTIND-1))
if [ $# -gt 0 ]; then
    MESSAGE="$*"
fi

# Vérifier la connexion internet pour les opérations distantes
if ! check_internet; then
    echo -e "${YELLOW}💡 Travail en mode hors-ligne. Les changements locaux sont possibles.${NC}"
    if [ "$PULL_ONLY" = true ] || [ "$PUSH_ONLY" = true ]; then
        exit 1
    fi
fi

# Exécuter l'action demandée
if [ "$PULL_ONLY" = true ]; then
    # Pull seulement
    do_pull
elif [ "$PUSH_ONLY" = true ]; then
    # Push seulement
    do_push "$MESSAGE" "$AUTO_ADD"
else
    # Synchronisation complète
    do_full_sync "$MESSAGE" "$AUTO_ADD"
fi

# Résumé final
echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║${NC}     ${GREEN}✅ Opération terminée sur ${CYAN}$HOSTNAME${GREEN} !${NC}              ${PURPLE}║${NC}"
echo -e "${PURPLE}║${NC}     ${WHITE}⏰ $(get_timestamp)${NC}                          ${PURPLE}║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"