import apiClient from './axios.service';

function signin(login, password) {
    return apiClient.post('/authapi/auth/signin', {login, password});
}

function getUser(login) {
    return apiClient.get(`/authapi/user/getuser/${login}`);
}

function refreshToken(refreshToken) {
    return apiClient.post('/authapi/auth/refreshtoken', {refreshToken});
}

export default {signin, getUser, refreshToken};
