<template>
  <v-container class="page">
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" sm="6">
        <h1>Mes Heros</h1>
      </v-col>
    </v-row>

    <v-progress-circular v-if="loading" indeterminate />

    <v-row v-else>
      <v-col v-for="hero in heroes" :key="hero._id" cols="12" sm="4">
        <v-card variant="outlined">
          <v-card-title>{{ hero.publicName }}</v-card-title>
          <v-card-subtitle>ID: {{ hero._id }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import HeroService from '../services/hero.service'

export default {
  data() {
    return {
      heroes: [],
      loading: true
    };
  },
  mounted() {
    HeroService.getAliases()
        .then(response => {
          // On récupère le champ 'data' de l'objet renvoyé par l'API
          this.heroes = response.data.data;
        })
        .catch(error => {
          console.error("Erreur API :", error);
        })
        .finally(() => {
          this.loading = false;
        });
  }
}
</script>

<style scoped>
.page {
  padding: 16px;
}
</style>
