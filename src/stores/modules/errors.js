export default {
    namespaced: true,
    state: {
        currentError: null,
        showErrorDialog: false,
    },
    mutations: {
        SET_ERROR(state, error) {
            state.currentError = error;
            state.showErrorDialog = !!error;
        },
        CLEAR_ERROR(state) {
            state.currentError = null;
            state.showErrorDialog = false;
        },
    },
    actions: {
        setError({commit}, error) {
            const errorMessage = error?.response?.data?.message
                || error?.response?.data?.data
                || error?.message
                || 'Une erreur est survenue';
            commit('SET_ERROR', errorMessage);
        },
        clearError({commit}) {
            commit('CLEAR_ERROR');
        },
    },
};
