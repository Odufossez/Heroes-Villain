<script setup>
import {ref} from 'vue';
import {useStore} from 'vuex';

const store = useStore();
const secretInput = ref('');
const savedSecret = ref('');

const saveSecret = () => {
  const trimmedSecret = secretInput.value.trim();
  store.dispatch('secret/setOrgSecret', trimmedSecret || null);
  savedSecret.value = trimmedSecret;
};
</script>

<template>
  <v-container class="page">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="login-card" variant="outlined">
          <v-card-title>Phrase secrete</v-card-title>
          <v-card-text>
            <p class="subtitle">Entrez la phrase secrete de l'organisation.</p>
            <v-text-field
              v-model="secretInput"
              type="password"
              autocomplete="current-password"
              label="Phrase secrete"
              density="comfortable"
              variant="outlined"
            />
            <v-btn color="primary" @click="saveSecret">Enregistrer</v-btn>
            <v-alert
              v-if="savedSecret"
              type="success"
              density="comfortable"
              variant="tonal"
              class="mt-4"
            >
              Phrase secrete enregistree.
            </v-alert>
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

.login-card {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.92);
}

.subtitle {
  margin-bottom: 16px;
  color: rgba(20, 20, 20, 0.7);
}
</style>
