<script setup>
import {computed} from 'vue';
import {useStore} from 'vuex';

const store = useStore();

const showErrorDialog = computed({
  get: () => store.state.errors.showErrorDialog,
  set: (val) => {
    if (!val) store.dispatch('errors/clearError');
  }
});

const errorMessage = computed(() => store.state.errors.currentError);

const closeError = () => {
  store.dispatch('errors/clearError');
};
</script>

<template>
  <v-dialog v-model="showErrorDialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="text-h5 text-error">Erreur</v-card-title>
      <v-card-text>
        {{ errorMessage }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="closeError">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.text-error {
  color: #ff5252 !important;
}
</style>
