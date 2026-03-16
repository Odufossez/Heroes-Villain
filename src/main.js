import {createApp} from 'vue';
import {createVuetify} from 'vuetify';
import 'vuetify/styles';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import App from './App.vue';
import router from './router';
import store from './stores/store';

const vuetify = createVuetify({
  components,
  directives,
});

// Supprimer les messages "Uncaught (in promise)" dans la console
// car on gère déjà les erreurs via le store et ErrorDialog
window.addEventListener('unhandledrejection', (event) => {
  // Optionnel : on peut vérifier si c'est une erreur axios
  if (event.reason && event.reason.isAxiosError) {
    event.preventDefault();
  }
});

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .mount('#app');
