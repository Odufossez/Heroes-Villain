export default {
    namespaced: true,
    state: {
        orgSecret: localStorage.getItem('org-secret') || null,
    },
    mutations: {
        SET_ORG_SECRET(state, secret) {
            state.orgSecret = secret;
            if (secret) {
                localStorage.setItem('org-secret', secret);
            } else {
                localStorage.removeItem('org-secret');
            }
        },
    },
    actions: {
        setOrgSecret({commit}, secret) {
            commit('SET_ORG_SECRET', secret);
        },
    },
    getters: {
        hasSecret(state) {
            return !!state.orgSecret;
        },
    },
};
