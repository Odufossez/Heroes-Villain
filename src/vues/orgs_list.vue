<script setup>
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useStore} from 'vuex';

const store = useStore();
const router = useRouter();

const dialog = ref(false);
const secretDialog = ref(false);
const newOrgName = ref('');
const newOrgSecret = ref('');
const pendingOrg = ref(null);
const inputSecret = ref('');

const orgs = computed(() => store.state.data.orgNames || []);
const orgItems = computed(() => orgs.value.map((org) => {
  if (typeof org === 'string') {
    return {name: org, _id: org};
  }
  return {
    name: org.name ?? org.publicName ?? '',
    _id: org._id ?? org.id ?? org.name ?? '',
  };
}));

const headers = [
  {title: 'Nom', value: 'name'},
  {title: 'Id', value: '_id'},
];

const refreshList = async () => {
  await store.dispatch('data/fetchOrgNames');
};

const openOrg = async (org) => {
  if (!org || !org._id) {
    return;
  }
  if (!store.state.secret.orgSecret) {
    pendingOrg.value = org;
    secretDialog.value = true;
    return;
  }
  await store.dispatch('data/fetchOrgById', org._id);
  await router.push(`/orgs/${org._id}`);
};

const confirmSecret = async () => {
  if (!inputSecret.value || !pendingOrg.value) {
    return;
  }
  await store.dispatch('secret/setOrgSecret', inputSecret.value);
  const org = pendingOrg.value;
  pendingOrg.value = null;
  secretDialog.value = false;
  inputSecret.value = '';
  await store.dispatch('data/fetchOrgById', org._id);
  await router.push(`/orgs/${org._id}`);
};

const handleRowClick = async (_event, row) => {
  const org = row?.item?.raw ?? row?.item ?? null;
  await openOrg(org);
};

const saveOrg = async () => {
  const name = newOrgName.value.trim();
  const secret = newOrgSecret.value.trim();
  if (!name || !secret) {
    return;
  }
  await store.dispatch('secret/setOrgSecret', secret);
  await store.dispatch('data/createOrg', {name, secret});
  newOrgName.value = '';
  newOrgSecret.value = '';
  dialog.value = false;
};

onMounted(refreshList);
</script>

<template>
  <v-container class="page">
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" sm="6">
        <h1>Organisations</h1>
      </v-col>
      <v-col cols="12" sm="6" class="text-sm-right">
        <v-btn color="primary" @click="dialog = true">Nouvelle organisation</v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="orgItems"
      density="comfortable"
      item-key="_id"
      class="elevation-1"
      @click:row="handleRowClick"
    />

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Créer une organisation</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newOrgName"
            label="Nom"
            density="comfortable"
            variant="outlined"
          />
          <v-text-field
            v-model="newOrgSecret"
            label="Phrase secrète"
            density="comfortable"
            variant="outlined"
            type="password"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="saveOrg">Valider</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="secretDialog" max-width="480">
      <v-card>
        <v-card-title>Clé secrète requise</v-card-title>
        <v-card-text>
          Pour accéder aux détails de cette organisation, vous devez fournir sa phrase secrète.
          <v-text-field
            v-model="inputSecret"
            label="Phrase secrète"
            density="comfortable"
            variant="outlined"
            type="password"
            class="mt-4"
            @keyup.enter="confirmSecret"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="secretDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="confirmSecret">Valider</v-btn>
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
