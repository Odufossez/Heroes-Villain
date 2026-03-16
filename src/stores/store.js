import {createStore} from 'vuex';
import data from './modules/data';
import errors from './modules/errors';
import secret from './modules/secret';
import users from './modules/users';

const store = createStore({
    modules: {
        data,
        errors,
        secret,
        users,
    },
});

export default store;
