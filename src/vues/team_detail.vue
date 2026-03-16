<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useStore} from 'vuex';
import heroService from '../services/hero.service';
import teamService from '../services/team.service';

const store = useStore();
const route = useRoute();

const currentTeam = computed(() => store.state.data.currentTeam);
const teamId = computed(() => currentTeam.value?._id || currentTeam.value?.id || route.params.teamId);

const heroes = ref([]);
const loadingHeroes = ref(false);

const showAddDialog = ref(false);
const addTab = ref('existing');
const selectedHeroId = ref(null);
const allHeroes = ref([]);
const loadingAllHeroes = ref(false);

const newHero = ref({
  publicName: '',
  realName: '',
  powers: [{name: '', type: 1, level: 0}],
});

const showEditDialog = ref(false);
const editHero = ref(null);
const editPowers = ref([]);
const showUpdateConfirm = ref(false);

const showRemoveConfirm = ref(false);
const heroToRemove = ref(null);

const powerTypes = [
  {title: 'Force', value: 1},
  {title: 'Vitesse', value: 2},
  {title: 'Endurance', value: 3},
  {title: 'Magie', value: 4},
  {title: 'Effrayant', value: 5},
  {title: 'Furtivité', value: 6},
  {title: 'Stupidité', value: 7},
];

const normalizePowers = (powers) => {
  if (!Array.isArray(powers)) {
    return [{name: '', type: 1, level: 0}];
  }

  const normalized = powers
    .map((power) => {
      if (power && typeof power === 'object') {
        return {
          name: String(power.name || '').trim(),
          type: Number(power.type) || 1,
          level: Number(power.level) || 0,
        };
      }
      return {
        name: String(power || '').trim(),
        type: 1,
        level: 0,
      };
    })
    .filter((power) => power.name.length > 0);

  return normalized.length ? normalized : [{name: '', type: 1, level: 0}];
};

const preparePowersForApi = (powers) => {
  if (!Array.isArray(powers)) {
    return [];
  }

  return powers
    .map((power) => ({
      name: String(power?.name || '').trim(),
      type: Math.min(7, Math.max(1, Number(power?.type) || 1)),
      level: Math.min(100, Math.max(0, Number(power?.level) || 0)),
    }))
    .filter((power) => power.name.length > 0);
};

const formatPowers = (powers) => {
  if (!Array.isArray(powers) || !powers.length) {
    return 'Aucun';
  }

  return powers
    .map((power) => {
      if (!power || typeof power !== 'object') {
        return String(power || '');
      }

      const typeItem = powerTypes.find((type) => type.value === Number(power.type));
      const typeLabel = typeItem ? typeItem.title : `Type ${power.type}`;
      return `${power.name} (${typeLabel}, ${power.level})`;
    })
    .filter(Boolean)
    .join(', ');
};

const addCreatePower = () => {
  newHero.value.powers.push({name: '', type: 1, level: 0});
};

const removeCreatePower = (index) => {
  if (newHero.value.powers.length <= 1) {
    newHero.value.powers = [{name: '', type: 1, level: 0}];
    return;
  }
  newHero.value.powers.splice(index, 1);
};

const addEditPower = () => {
  editPowers.value.push({name: '', type: 1, level: 0});
};

const removeEditPower = (index) => {
  if (editPowers.value.length <= 1) {
    editPowers.value = [{name: '', type: 1, level: 0}];
    return;
  }
  editPowers.value.splice(index, 1);
};

const normalizeResponse = (payload) => {
  if (!payload) {
    return null;
  }
  return payload.data ? payload.data : payload;
};

const extractHeroes = (team) => {
  if (!team) {
    return [];
  }
  const raw = team.heroes || team.members || team.idHeroes || team.heroIds || team.id_heroes || team.heroes_id || team.id_members || team.members_id || [];
  return Array.isArray(raw) ? raw : [];
};

const loadHeroes = async () => {
  if (!currentTeam.value) {
    heroes.value = [];
    return;
  }
  const rawHeroes = extractHeroes(currentTeam.value);
  if (!rawHeroes.length) {
    heroes.value = [];
    return;
  }
  const hasFullData = rawHeroes.every((hero) => hero && typeof hero === 'object' && (hero.publicName || hero.realName || hero.powers));
  if (hasFullData) {
    heroes.value = rawHeroes;
    return;
  }
  loadingHeroes.value = true;
  const ids = rawHeroes.map((hero) => {
    if (typeof hero === 'string') {
      return hero;
    }
    return hero?._id || hero?.id || null;
  }).filter(Boolean);
  const results = await Promise.all(ids.map((id) => store.dispatch('data/fetchHeroById', id)));
  heroes.value = results.map(normalizeResponse).filter(Boolean);
  loadingHeroes.value = false;
};

const refreshTeam = async () => {
  if (!teamId.value) {
    return;
  }
  await store.dispatch('data/fetchTeamById', teamId.value);
  await loadHeroes();
};

const openAddDialog = async () => {
  showAddDialog.value = true;
  addTab.value = 'existing';
  selectedHeroId.value = null;
  newHero.value = {publicName: '', realName: '', powers: [{name: '', type: 1, level: 0}]};
  loadingAllHeroes.value = true;
  const payload = await store.dispatch('data/fetchHeroAliases');
  const existingIds = new Set(heroes.value.map((hero) => (hero._id || hero.id)));
  allHeroes.value = Array.isArray(payload)
    ? payload
        .map((hero) => ({
          ...hero,
          _id: hero._id || hero.id,
        }))
        .filter((hero) => hero._id && !existingIds.has(hero._id))
    : [];
  loadingAllHeroes.value = false;
};

const closeAddDialog = () => {
  showAddDialog.value = false;
  selectedHeroId.value = null;
};

const addExistingHero = async () => {
  if (!selectedHeroId.value || !teamId.value) {
    return;
  }
  await teamService.addHeroes(teamId.value, [selectedHeroId.value]);
  await refreshTeam();
  closeAddDialog();
};

const createAndAddHero = async () => {
  if (!teamId.value || !newHero.value.publicName.trim()) {
    return;
  }
  const powers = preparePowersForApi(newHero.value.powers);
  const response = await heroService.createHero({
    publicName: newHero.value.publicName.trim(),
    realName: newHero.value.realName.trim(),
    powers,
  });
  const createdHero = normalizeResponse(response.data);
  const createdId = createdHero?._id || createdHero?.id;
  if (createdId) {
    await teamService.addHeroes(teamId.value, [createdId]);
    await refreshTeam();
  }
  closeAddDialog();
};

const startEditHero = (hero) => {
  editHero.value = {...hero};
  editPowers.value = normalizePowers(hero.powers);
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  editHero.value = null;
  editPowers.value = [];
};

const askUpdateHero = () => {
  showUpdateConfirm.value = true;
};

const confirmUpdateHero = async () => {
  if (!editHero.value) {
    showUpdateConfirm.value = false;
    return;
  }
  const powers = preparePowersForApi(editPowers.value);
  await heroService.updateHero({
    _id: editHero.value._id || editHero.value.id,
    publicName: editHero.value.publicName,
    realName: editHero.value.realName,
    powers,
  });
  showUpdateConfirm.value = false;
  closeEditDialog();
  await refreshTeam();
};

const askRemoveHero = (hero) => {
  heroToRemove.value = hero;
  showRemoveConfirm.value = true;
};

const confirmRemoveHero = async () => {
  if (!heroToRemove.value || !teamId.value) {
    showRemoveConfirm.value = false;
    return;
  }
  const heroId = heroToRemove.value._id || heroToRemove.value.id;
  await teamService.removeHeroes(teamId.value, [heroId]);
  heroToRemove.value = null;
  showRemoveConfirm.value = false;
  await refreshTeam();
};

const cancelRemoveHero = () => {
  heroToRemove.value = null;
  showRemoveConfirm.value = false;
};

onMounted(refreshTeam);

watch(currentTeam, async (value) => {
  if (value) {
    await loadHeroes();
  }
});
</script>

<template>
  <v-container v-if="currentTeam" class="page">
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" sm="8">
        <h1>{{ currentTeam.name || currentTeam.publicName || 'Equipe' }}</h1>
        <div class="meta">Id: {{ teamId }}</div>
      </v-col>
      <v-col cols="12" sm="4" class="text-sm-right">
        <v-btn color="primary" @click="openAddDialog">Ajouter un membre</v-btn>
      </v-col>
    </v-row>

    <v-card variant="outlined">
      <v-card-title>Membres</v-card-title>
      <v-card-text>
        <v-progress-circular v-if="loadingHeroes" indeterminate />
        <v-row v-else>
          <v-col v-for="hero in heroes" :key="hero._id || hero.id" cols="12" md="6">
            <v-card variant="tonal">
              <v-card-title>{{ hero.publicName }}</v-card-title>
              <v-card-subtitle>{{ hero.realName }}</v-card-subtitle>
              <v-card-text>
                <div><strong>Id:</strong> {{ hero._id || hero.id }}</div>
                <div><strong>Pouvoirs:</strong> {{ formatPowers(hero.powers) }}</div>
              </v-card-text>
              <v-card-actions>
                <v-btn size="small" variant="text" @click="startEditHero(hero)">Modifier</v-btn>
                <v-btn size="small" color="error" variant="text" @click="askRemoveHero(hero)">Supprimer</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showAddDialog" max-width="640">
      <v-card>
        <v-card-title>Ajouter un membre</v-card-title>
        <v-card-text>
          <v-tabs v-model="addTab" color="primary">
            <v-tab value="existing">Hero existant</v-tab>
            <v-tab value="new">Nouveau hero</v-tab>
          </v-tabs>
          <v-window v-model="addTab" class="mt-4">
            <v-window-item value="existing">
              <v-select
                v-model="selectedHeroId"
                :items="allHeroes"
                item-title="publicName"
                item-value="_id"
                label="Choisir un hero"
                density="comfortable"
                variant="outlined"
                :loading="loadingAllHeroes"
              />
              <v-btn
                color="primary"
                :disabled="!selectedHeroId"
                class="mt-2"
                @click="addExistingHero"
              >
                Ajouter
              </v-btn>
            </v-window-item>
            <v-window-item value="new">
              <v-text-field
                v-model="newHero.publicName"
                label="Nom public"
                density="comfortable"
                variant="outlined"
              />
              <v-text-field
                v-model="newHero.realName"
                label="Nom reel"
                density="comfortable"
                variant="outlined"
              />
              <div
                v-for="(power, index) in newHero.powers"
                :key="`create-power-${index}`"
                class="power-row"
              >
                <v-text-field
                  v-model="power.name"
                  label="Nom du pouvoir"
                  density="comfortable"
                  variant="outlined"
                />
                <v-select
                  v-model="power.type"
                  :items="powerTypes"
                  label="Type"
                  item-title="title"
                  item-value="value"
                  density="comfortable"
                  variant="outlined"
                />
                <v-text-field
                  v-model.number="power.level"
                  label="Niveau (0-100)"
                  density="comfortable"
                  variant="outlined"
                  type="number"
                  min="0"
                  max="100"
                />
                <v-btn color="error" variant="text" @click="removeCreatePower(index)">Supprimer</v-btn>
              </div>
              <v-btn variant="text" class="mb-2" @click="addCreatePower">Ajouter un pouvoir</v-btn>
              <v-btn color="primary" @click="createAndAddHero">Creer et ajouter</v-btn>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeAddDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEditDialog" max-width="520">
      <v-card>
        <v-card-title>Modifier le hero</v-card-title>
        <v-card-text v-if="editHero">
          <v-text-field
            v-model="editHero.publicName"
            label="Nom public"
            density="comfortable"
            variant="outlined"
          />
          <v-text-field
            v-model="editHero.realName"
            label="Nom reel"
            density="comfortable"
            variant="outlined"
          />
          <div
            v-for="(power, index) in editPowers"
            :key="`edit-power-${index}`"
            class="power-row"
          >
            <v-text-field
              v-model="power.name"
              label="Nom du pouvoir"
              density="comfortable"
              variant="outlined"
            />
            <v-select
              v-model="power.type"
              :items="powerTypes"
              label="Type"
              item-title="title"
              item-value="value"
              density="comfortable"
              variant="outlined"
            />
            <v-text-field
              v-model.number="power.level"
              label="Niveau (0-100)"
              density="comfortable"
              variant="outlined"
              type="number"
              min="0"
              max="100"
            />
            <v-btn color="error" variant="text" @click="removeEditPower(index)">Supprimer</v-btn>
          </div>
          <v-btn variant="text" @click="addEditPower">Ajouter un pouvoir</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeEditDialog">Annuler</v-btn>
          <v-btn color="primary" @click="askUpdateHero">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showUpdateConfirm" max-width="420">
      <v-card>
        <v-card-title>Confirmer la modification</v-card-title>
        <v-card-text>Valider les changements sur ce hero ?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showUpdateConfirm = false">Annuler</v-btn>
          <v-btn color="primary" @click="confirmUpdateHero">Confirmer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showRemoveConfirm" max-width="420">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>Supprimer ce membre de l'equipe ?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelRemoveHero">Annuler</v-btn>
          <v-btn color="error" @click="confirmRemoveHero">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.page {
  padding: 16px;
}

.meta {
  color: rgba(20, 20, 20, 0.7);
}

.power-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
  align-items: center;
}

@media (max-width: 960px) {
  .power-row {
    grid-template-columns: 1fr;
  }
}
</style>
