<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {useStore} from 'vuex';

const store = useStore();
const router = useRouter();
const route = useRoute();

const showMissingOrg = ref(false);
const showRemoveDialog = ref(false);
const teamToRemove = ref(null);
const showAddTeam = ref(false);
const selectedTeamId = ref(null);
const loading = ref(false);

const currentOrg = computed(() => store.state.data.currentOrg);
const orgId = computed(() => currentOrg.value?._id || currentOrg.value?.id || route.params.orgId);

const orgTeams = computed(() => {
  const org = currentOrg.value;
  if (!org) {
    return [];
  }
  const teams = org.teams || org.idTeams || org.teamIds || org.id_teams || org.teams_id || [];
  return Array.isArray(teams) ? teams : [];
});

const allTeams = computed(() => store.state.data.teams || []);

const teamItems = computed(() => orgTeams.value.map((team) => {
  const id = typeof team === 'string' ? team : (team._id || team.id);
  // Chercher le nom dans la liste globale des équipes
  const fullTeam = allTeams.value.find(t => (t._id || t.id) === id);
  
  return {
    name: fullTeam?.name || fullTeam?.publicName || team.name || team.publicName || id,
    _id: id,
  };
}));

const allTeamItems = computed(() => allTeams.value.map((team) => {
  if (typeof team === 'string') {
    return {name: team, _id: team};
  }
  return {
    name: team.name || team.publicName || '',
    _id: team._id || team.id || '',
  };
}));

const recruitableTeams = computed(() => {
  const selectedIds = new Set(teamItems.value.map((team) => team._id));
  return allTeamItems.value.filter((team) => team._id && !selectedIds.has(team._id));
});

const headers = [
  {title: 'Nom', value: 'name'},
  {title: 'Id', value: '_id'},
  {title: 'Actions', value: 'actions', sortable: false},
];

const ensureOrg = async () => {
  const routeOrgId = route.params.orgId;
  const currentId = currentOrg.value?._id || currentOrg.value?.id;
  
  if (routeOrgId && (!currentOrg.value || currentId !== routeOrgId)) {
    loading.value = true;
    try {
      await store.dispatch('data/fetchOrgById', routeOrgId);
    } finally {
      loading.value = false;
    }
  }
  if (!currentOrg.value) {
    showMissingOrg.value = true;
  }
};

const goBackToList = async () => {
  showMissingOrg.value = false;
  await router.push('/orgs');
};

const selectTeam = async (team) => {
  if (!team || !team._id) {
    return;
  }
  await store.dispatch('data/fetchTeamById', team._id);
  await router.push(`/teams/${team._id}`);
};

const askRemoveTeam = (team) => {
  teamToRemove.value = team;
  showRemoveDialog.value = true;
};

const unwrapRowItem = (item) => item?.raw ?? item;

const confirmRemoveTeam = async () => {
  if (!teamToRemove.value || !orgId.value) {
    showRemoveDialog.value = false;
    return;
  }
  await store.dispatch('data/removeTeamFromOrg', {teamId: teamToRemove.value._id});
  teamToRemove.value = null;
  showRemoveDialog.value = false;
};

const cancelRemoveTeam = () => {
  teamToRemove.value = null;
  showRemoveDialog.value = false;
};

const startAddTeam = () => {
  showAddTeam.value = true;
  selectedTeamId.value = null;
};

const cancelAddTeam = () => {
  showAddTeam.value = false;
  selectedTeamId.value = null;
};

const confirmAddTeam = async () => {
  if (!selectedTeamId.value || !orgId.value) {
    return;
  }
  await store.dispatch('data/addTeamToOrg', {teamId: selectedTeamId.value});
  selectedTeamId.value = null;
};

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      store.dispatch('data/fetchTeams'),
      ensureOrg()
    ]);
  } finally {
    loading.value = false;
  }
});

watch(currentOrg, (value) => {
  if (value) {
    showMissingOrg.value = false;
  }
});
</script>

<template>
  <v-container class="page">
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" sm="6">
        <h1>Organisation</h1>
        <v-progress-circular v-if="loading" indeterminate color="primary" class="ma-4" />
        <div v-else-if="currentOrg">
          <div><strong>Nom:</strong> {{ currentOrg.name || currentOrg.publicName }}</div>
          <div><strong>Id:</strong> {{ currentOrg._id || currentOrg.id }}</div>
        </div>
      </v-col>
      <v-col cols="12" sm="6" class="text-sm-right">
        <v-btn color="primary" @click="startAddTeam">Ajouter une equipe</v-btn>
      </v-col>
    </v-row>

    <v-card v-if="showAddTeam" class="mb-4">
      <v-card-text>
        <v-select
          v-model="selectedTeamId"
          :items="recruitableTeams"
          item-title="name"
          item-value="_id"
          label="Equipe a ajouter"
          density="comfortable"
          variant="outlined"
        />
        <div class="actions">
          <v-btn variant="text" @click="cancelAddTeam">Annuler</v-btn>
          <v-btn color="primary" :disabled="!selectedTeamId" @click="confirmAddTeam">Valider</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-data-table
      :headers="headers"
      :items="teamItems"
      item-key="_id"
      class="elevation-1"
      density="comfortable"
    >
      <template #item.actions="{item}">
        <v-btn size="small" variant="text" @click="selectTeam(unwrapRowItem(item))">Selectionner</v-btn>
        <v-btn size="small" color="error" variant="text" @click="askRemoveTeam(unwrapRowItem(item))">Supprimer</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="showRemoveDialog" max-width="420">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Cette equipe sera retiree de l'organisation.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelRemoveTeam">Annuler</v-btn>
          <v-btn color="error" @click="confirmRemoveTeam">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showMissingOrg" max-width="420">
      <v-card>
        <v-card-title>Organisation indisponible</v-card-title>
        <v-card-text>
          Impossible d'afficher cette organisation. Verifiez la phrase secrete.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="goBackToList">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.page {
  padding: 16px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>