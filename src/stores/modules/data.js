import heroService from '../../services/hero.service';
import teamService from '../../services/team.service';
import orgService from '../../services/org.service';

export default {
    namespaced: true,
    state: {
        heroAliases: [],
        currentHero: null,
        teams: [],
        currentTeam: null,
        orgNames: [],
        currentOrg: null,
        currentOrgId: localStorage.getItem('current-org-id') || null,
    },
    mutations: {
        SET_HERO_ALIASES(state, aliases) {
            state.heroAliases = aliases;
        },
        SET_CURRENT_HERO(state, hero) {
            state.currentHero = hero;
        },
        SET_TEAMS(state, teams) {
            state.teams = teams;
        },
        SET_CURRENT_TEAM(state, team) {
            state.currentTeam = team;
        },
        SET_ORG_NAMES(state, orgNames) {
            state.orgNames = orgNames;
        },
        SET_CURRENT_ORG(state, org) {
            state.currentOrg = org;
            if (org) {
                const id = org._id || org.id;
                state.currentOrgId = id;
                localStorage.setItem('current-org-id', id);
            }
        },
    },
    actions: {
        setHeroAliases({commit}, aliases) {
            commit('SET_HERO_ALIASES', aliases);
        },
        setCurrentHero({commit}, hero) {
            commit('SET_CURRENT_HERO', hero);
        },
        setTeams({commit}, teams) {
            commit('SET_TEAMS', teams);
        },
        setCurrentTeam({commit}, team) {
            commit('SET_CURRENT_TEAM', team);
        },
        setOrgNames({commit}, orgNames) {
            commit('SET_ORG_NAMES', orgNames);
        },
        setCurrentOrg({commit}, org) {
            commit('SET_CURRENT_ORG', org);
        },
        async fetchHeroAliases({commit}) {
            const response = await heroService.getAliases();
            const aliases = response.data && response.data.data ? response.data.data : response.data;
            commit('SET_HERO_ALIASES', aliases);
            return aliases;
        },
        async fetchHeroById({commit}, id) {
            const response = await heroService.getHeroById(id);
            const hero = response.data && response.data.data ? response.data.data : response.data;
            commit('SET_CURRENT_HERO', hero);
            return hero;
        },
        async fetchTeamById({commit, state, dispatch}, id) {
            // Si l'organisation courante est absente mais qu'on a un ID persisté, on la recharge
            if (!state.currentOrg && state.currentOrgId) {
                await dispatch('fetchOrgById', state.currentOrgId);
            }

            // L'API ne permet pas de récupérer une équipe avec ses membres directement.
            // On doit la chercher dans l'organisation courante (TP 1 section 2.2 REMARQUE).
            let team = null;
            if (state.currentOrg && state.currentOrg.teams) {
                team = state.currentOrg.teams.find(t => (t._id || t.id) === id);
            }
            
            // Si pas trouvé dans l'organisation, chercher dans la liste globale
            if (!team && state.teams) {
                team = state.teams.find(t => (t._id || t.id) === id);
            }

            commit('SET_CURRENT_TEAM', team);
            return team;
        },
        async fetchTeams({commit}) {
            const response = await teamService.getTeams();
            const teams = response.data && response.data.data ? response.data.data : response.data;
            commit('SET_TEAMS', teams);
            return teams;
        },
        async createTeam({dispatch}, team) {
            const response = await teamService.createTeam(team);
            await dispatch('fetchTeams');
            return response.data;
        },
        async fetchOrgNames({commit}) {
            const response = await orgService.getOrgs();
            const orgNames = response.data && response.data.data ? response.data.data : response.data;
            commit('SET_ORG_NAMES', orgNames);
            return orgNames;
        },
        async fetchOrgById({commit}, id) {
            const response = await orgService.getById(id);
            const org = response.data && response.data.data ? response.data.data : response.data;
            commit('SET_CURRENT_ORG', org);
            return org;
        },
        async createOrg({dispatch}, org) {
            const response = await orgService.createOrg(org);
            await dispatch('fetchOrgNames');
            return response.data;
        },
        async addTeamToOrg({commit}, {teamId}) {
            const response = await orgService.addTeam(teamId);
            const org = response.data && response.data.data ? response.data.data : response.data;
            commit('SET_CURRENT_ORG', org);
            return org;
        },
        async removeTeamFromOrg({commit}, {teamId}) {
            const response = await orgService.removeTeam(teamId);
            const org = response.data && response.data.data ? response.data.data : response.data;
            commit('SET_CURRENT_ORG', org);
            return org;
        },
    },
};
