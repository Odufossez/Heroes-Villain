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
        async fetchTeamById({commit, state, dispatch, rootState}, id) {
            let team = null;

            if (!id) {
                commit('SET_CURRENT_TEAM', null);
                return null;
            }

            if (state.currentOrg && Array.isArray(state.currentOrg.teams)) {
                team = state.currentOrg.teams.find((t) => (t._id || t.id) === id) || null;
            }

            if (!team && state.currentOrgId && rootState.secret?.orgSecret) {
                try {
                    await dispatch('fetchOrgById', state.currentOrgId);
                    if (state.currentOrg && Array.isArray(state.currentOrg.teams)) {
                        team = state.currentOrg.teams.find((t) => (t._id || t.id) === id) || null;
                    }
                } catch (_error) {
                    // Fallback sur la liste globale des équipes si l'orga n'est pas accessible
                }
            }

            if (!team && (!Array.isArray(state.teams) || state.teams.length === 0)) {
                await dispatch('fetchTeams');
            }

            if (!team && Array.isArray(state.teams)) {
                team = state.teams.find((t) => (t._id || t.id) === id) || null;
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
