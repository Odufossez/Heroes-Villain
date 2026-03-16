import apiClient from "./axios.service";

function getTeams() {
    return apiClient.get('/herocorp/teams/get');
}

function createTeam(team) {
    return apiClient.post('/herocorp/teams/create', {name: team.name});
}

function addHeroes(teamId, heroIds) {
    return apiClient.patch('/herocorp/teams/addheroes', {idHeroes: heroIds, idTeam: teamId});
}

function removeHeroes(teamId, heroIds) {
    return apiClient.patch('/herocorp/teams/removeheroes', {idHeroes: heroIds, idTeam: teamId});
}

export default {getTeams, createTeam, addHeroes, removeHeroes};
