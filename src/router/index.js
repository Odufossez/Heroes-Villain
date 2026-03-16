import { createRouter, createWebHistory } from 'vue-router'
import store from '../stores/store'
import Cards_heroes from "../components/cards_heroes.vue";
import LoginView from "../components/login.vue";
import SigninView from "../vues/signin.vue";
import ProfileView from "../vues/profile.vue";
import OrgListView from "../vues/orgs_list.vue";
import OrgDetailView from "../vues/org_detail.vue";
import TeamListView from "../vues/teams_list.vue";
import TeamDetailView from "../vues/team_detail.vue";

const routes = [
    {
        path: '/',
        redirect: '/orgs'
    },
    {
        path: '/heroes',
        component: Cards_heroes
    },
    {
        path: '/login',
        component: LoginView
    },
    {
        path: '/signin',
        component: SigninView
    },
    {
        path: '/profile',
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {
        path: '/orgs',
        component: OrgListView
    },
    {
        path: '/orgs/:orgId',
        component: OrgDetailView,
        props: true,
        meta: { requiresSecret: true }
    },
    {
        path: '/teams',
        component: TeamListView
    },
    {
        path: '/teams/:teamId',
        component: TeamDetailView,
        props: true,
        meta: { requiresSecret: true }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Garde de navigation globale
router.beforeEach((to, from, next) => {
    // Vérifier si la route nécessite le secret
    if (to.meta.requiresSecret) {
        const hasSecret = store.state.secret?.orgSecret;
        if (!hasSecret) {
            // Rediriger vers la page de login si pas de secret
            next('/login');
            return;
        }
    }

    // Vérifier si la route nécessite l'authentification
    if (to.meta.requiresAuth) {
        const isAuthenticated = store.state.users?.isAuthenticated;
        if (!isAuthenticated) {
            // Rediriger vers signin si pas authentifié
            next('/signin');
            return;
        }
    }

    next();
});

export default router;
