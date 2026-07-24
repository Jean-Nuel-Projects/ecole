class API {
    static async getClasses() { return apiGet('/classes'); }
    static async getClassesByInstitution(id) { return apiGet(`/classes/institution/${id}`); }
    static async getClasseStats(id) { return apiGet(`/classes/${id}/stats`); }
    static async getClasseOptions(id) { return apiGet(`/classes/${id}/options`); }
    static async getElevesByClasse(classeId) { return apiGet(`/eleves/classe/${classeId}`); }
    static async getEleve(id) { return apiGet(`/eleves/${id}`); }
    static async createEleve(data) { return apiPost('/eleves', data); }
    static async pointerPresence(data) { return apiPost('/presences', data); }
}