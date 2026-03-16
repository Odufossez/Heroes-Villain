import apiClient from "./axios.service";

function getOrgs() {
    return apiClient.get('/herocorp/orgs/get');
}

function createOrg(org) {
    return apiClient.post('/herocorp/orgs/create', {name: org.name , secret: org.secret});
}

function addTeam(teamId) {
    return apiClient.patch('/herocorp/orgs/addteam', {idTeam: teamId});
}

function removeTeam(teamId) {
    return apiClient.patch('/herocorp/orgs/removeteam', {idTeam: teamId});
}

function getById(id) {
    return apiClient.get(`/herocorp/orgs/getbyid/${id}`);
}

export default {getOrgs, createOrg, addTeam, removeTeam, getById};
