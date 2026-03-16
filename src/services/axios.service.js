import axios from 'axios';
import store from '../stores/store';

const apiClient = axios.create({
    baseURL: 'https://apidemo.iut-bm.univ-fcomte.fr',
    headers : {
        "Content-Type" : "application/json"
    },
    withCredentials: true
}) ;

// Intercepteur pour ajouter org-secret et x-xsrf-token
apiClient.interceptors.request.use(
    (config) => {
        // Ajouter org-secret si disponible
        const orgSecret = store.state.secret?.orgSecret;
        if (orgSecret) {
            config.headers['org-secret'] = orgSecret;
        }

        // Ajouter x-xsrf-token si disponible
        const xsrfToken = store.state.users?.xsrfToken;
        if (xsrfToken) {
            config.headers['x-xsrf-token'] = xsrfToken;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        store.dispatch('errors/setError', error);
        return Promise.reject(error);
    }
);

export default apiClient;