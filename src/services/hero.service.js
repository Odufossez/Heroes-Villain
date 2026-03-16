import apiClient from './axios.service' ;

function getAliases(){
    return apiClient.get('/herocorp/heroes/getaliases');
}

function createHero(hero){
    return apiClient.post('/herocorp/heroes/create', {publicName: hero.publicName , realName: hero.realName , powers: hero.powers});
}

function getHeroById(id){
    return apiClient.get(`/herocorp/heroes/getbyid/${id}`);
}

function updateHero(hero){
    return apiClient.put('/herocorp/heroes/update', {_id: hero._id, publicName: hero.publicName , realName: hero.realName , powers: hero.powers});
}

function updateHeroAuth(hero){
    return apiClient.put('/herocorp/heroes/authupdate', {_id: hero._id, publicName: hero.publicName , realName: hero.realName , powers: hero.powers});
}

export default {getAliases, createHero, getHeroById, updateHero, updateHeroAuth};
