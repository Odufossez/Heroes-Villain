<script setup>
import {ref, computed} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';

const store = useStore();
const router = useRouter();

const login = ref('');
const password = ref('');
const loading = ref(false);

const isAuthenticated = computed(() => store.getters['users/isAuthenticated']);

const handleSignin = async () => {
  if (!login.value || !password.value) {
    return;
  }

  loading.value = true;
  try {
    await store.dispatch('users/signin', {
      login: login.value,
      password: password.value
    });

    // Récupérer les informations de l'utilisateur
    await store.dispatch('users/fetchUser', login.value);

    // Rediriger vers la page de profil
    router.push('/profile');
  } catch (error) {
    // L'erreur sera gérée par l'intercepteur axios
    console.error('Signin error:', error);
  } finally {
    loading.value = false;
  }
};

const handleLogout = () => {
  store.dispatch('users/logout');
  login.value = '';
  password.value = '';
};
</script>

<template>
  <v-container class="page">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="signin-card" variant="outlined">
          <v-card-title>Authentification Hero</v-card-title>

          <v-card-text v-if="!isAuthenticated">
            <p class="subtitle">Connectez-vous avec votre compte hero.</p>

            <v-text-field
              v-model="login"
              label="Login"
              density="comfortable"
              variant="outlined"
              :disabled="loading"
            />

            <v-text-field
              v-model="password"
              type="password"
              label="Mot de passe"
              density="comfortable"
              variant="outlined"
              :disabled="loading"
              @keyup.enter="handleSignin"
            />

            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!login || !password"
              @click="handleSignin"
            >
              Se connecter
            </v-btn>

            <v-alert
              type="info"
              density="comfortable"
              variant="tonal"
              class="mt-4"
            >
              <strong>Comptes de test:</strong><br>
              superdupond / azer<br>
              chatounette / azer<br>
              maddog / azer<br>
              supertutu / azer
            </v-alert>
          </v-card-text>

          <v-card-text v-else>
            <v-alert
              type="success"
              density="comfortable"
              variant="tonal"
            >
              Connecté en tant que <strong>{{ store.state.users.currentUser?.login }}</strong>
            </v-alert>

            <div class="mt-4">
              <v-btn color="primary" to="/profile" class="mr-2">
                Mon Profil
              </v-btn>
              <v-btn color="error" variant="outlined" @click="handleLogout">
                Se déconnecter
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.page {
  padding: 16px;
}

.signin-card {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.92);
}

.subtitle {
  margin-bottom: 16px;
  color: rgba(20, 20, 20, 0.7);
}
</style>
