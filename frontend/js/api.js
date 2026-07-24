class API {
    static async getClasses() { return apiGet('/classes'); }
    static async getClasseStats(id) { return apiGet(`/classes/${id}/stats`); }
    static async getElevesByClasse(classeId) { return apiGet(`/eleves/classe/${classeId}`); }
    static async getEleve(id) { return apiGet(`/eleves/${id}`); }
    static async createEleve(data) { return apiPost('/eleves', data); }
    static async updateEleve(id, data) { return apiPut(`/eleves/${id}`, data); }
    static async deleteEleve(id) { return apiDelete(`/eleves/${id}`); }
    static async pointerPresence(data) { return apiPost('/presences', data); }
    static async getPresencesEleve(eleveId) { return apiGet(`/presences/eleve/${eleveId}`); }
    static async getPresencesClasse(classeId) { return apiGet(`/presences/classe/${classeId}`); }
}