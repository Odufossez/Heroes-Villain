<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useStore} from 'vuex';

const store = useStore();
const router = useRouter();

const dialog = ref(false);
const newTeamName = ref('');
const newTeamId = ref('');

const teams = computed(() => store.state.data.teams || []);
const teamItems = computed(() => teams.value.map((team) => {
  if (typeof team === 'string') {
    return {name: team, _id: team};
  }
  return {
    name: team.name ?? team.publicName ?? '',
    _id: team._id ?? team.id ?? team.name ?? '',
  };
}));

const headers = [
  {title: 'Nom', value: 'name'},
  {title: 'Id', value: '_id'},
];

const refreshList = async () => {
  await store.dispatch('data/fetchTeams');
};

const openTeam = async (team) => {
  if (!team || !team._id) {
    return;
  }
  const loadedTeam = await store.dispatch('data/fetchTeamById', team._id);
  if (!loadedTeam) {
    await store.dispatch('errors/setError', 'Impossible de charger cette equipe.');
    return;
  }
  await router.push(`/teams/${team._id}`);
};

const handleRowClick = async (_event, row) => {
  const team = row?.item?.raw ?? row?.item ?? null;
  await openTeam(team);
};

const saveTeam = async () => {
  const name = newTeamName.value.trim();
  const id = newTeamId.value.trim();
  if (!name) {
    return;
  }
  await store.dispatch('data/createTeam', {name, _id: id || undefined, members: 0});
  newTeamName.value = '';
  newTeamId.value = '';
  dialog.value = false;
};

onMounted(refreshList);
</script>

<template>
  <v-container class="page">
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" sm="6">
        <h1>Equipes</h1>
      </v-col>
      <v-col cols="12" sm="6" class="text-sm-right">
        <v-btn color="primary" @click="dialog = true">Nouvelle equipe</v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="teamItems"
      density="comfortable"
      item-key="_id"
      class="elevation-1"
      @click:row="handleRowClick"
    />

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Creer une equipe</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTeamName"
            label="Nom"
            density="comfortable"
            variant="outlined"
          />
          <v-text-field
            v-model="newTeamId"
            label="Id (optionnel)"
            density="comfortable"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="saveTeam">Valider</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.page {
  padding: 16px;
}
</style>
