import authService from '../../services/auth.service';

export default {
    namespaced: true,
    state: {
        currentUser: null,
        xsrfToken: null,
        refreshToken: null,
        isAuthenticated: false,
    },
    mutations: {
        SET_USER(state, user) {
            state.currentUser = user;
            state.isAuthenticated = !!user;
            if (user?.login) {
                localStorage.setItem('user-login', user.login);
            }
        },
        SET_XSRF_TOKEN(state, token) {
            state.xsrfToken = token;
            if (token) {
                localStorage.setItem('xsrf-token', token);
            } else {
                localStorage.removeItem('xsrf-token');
            }
        },
        SET_REFRESH_TOKEN(state, token) {
            state.refreshToken = token;
            if (token) {
                localStorage.setItem('refresh-token', token);
            } else {
                localStorage.removeItem('refresh-token');
            }
        },
        LOGOUT(state) {
            state.currentUser = null;
            state.xsrfToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('xsrf-token');
            localStorage.removeItem('refresh-token');
            localStorage.removeItem('user-login');
        },
        RESTORE_TOKENS(state) {
            const xsrfToken = localStorage.getItem('xsrf-token');
            const refreshToken = localStorage.getItem('refresh-token');
            const login = localStorage.getItem('user-login');
            if (xsrfToken) {
                state.xsrfToken = xsrfToken;
                state.isAuthenticated = true;
            }
            if (refreshToken) {
                state.refreshToken = refreshToken;
            }
            if (login && !state.currentUser) {
                state.currentUser = { login };
            }
        },
    },
    actions: {
        setUser({commit}, user) {
            commit('SET_USER', user);
        },
        setTokens({commit}, {xsrfToken, refreshToken}) {
            commit('SET_XSRF_TOKEN', xsrfToken);
            commit('SET_REFRESH_TOKEN', refreshToken);
        },
        async signin({commit}, {login, password}) {
            const response = await authService.signin(login, password);
            const data = response.data?.data || response.data;
            if (data.xsrfToken) {
                commit('SET_XSRF_TOKEN', data.xsrfToken);
            }
            const refreshToken = data.refreshToken || data.refreshtoken;
            if (refreshToken) {
                commit('SET_REFRESH_TOKEN', refreshToken);
            }
            return data;
        },
        async fetchUser({commit}, login) {
            const response = await authService.getUser(login);
            const user = response.data?.data || response.data;
            commit('SET_USER', user);
            return user;
        },
        logout({commit}) {
            commit('LOGOUT');
        },
        restoreTokens({commit}) {
            commit('RESTORE_TOKENS');
        },
    },
    getters: {
        isAuthenticated(state) {
            return state.isAuthenticated;
        },
        userHeroId(state) {
            return state.currentUser?.hero?._id || state.currentUser?.hero?.id || null;
        },
    },
};
