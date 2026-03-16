<script setup>
import {ref, computed, onMounted} from 'vue';
import {useStore} from 'vuex';
import {useRouter} from 'vue-router';
import heroService from '../services/hero.service';

const store = useStore();
const router = useRouter();

const isAuthenticated = computed(() => store.getters['users/isAuthenticated']);
const currentUser = computed(() => store.state.users.currentUser);

const showEditDialog = ref(false);
const editHero = ref(null);
const editPowers = ref([]);
const showUpdateConfirm = ref(false);
const loading = ref(false);

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

onMounted(async () => {
  if (!isAuthenticated.value) {
    router.push('/signin');
    return;
  }
  
  // Si on a le login mais pas l'objet hero complet (cas du reload)
  if (currentUser.value?.login && !currentUser.value.hero) {
    try {
      await store.dispatch('users/fetchUser', currentUser.value.login);
    } catch (error) {
       console.error('Failed to fetch user data:', error);
    }
  }

  if (currentUser.value?.hero) {
    loadHero();
  }
});

const loadHero = () => {
  const hero = currentUser.value.hero;
  editHero.value = {...hero};
  editPowers.value = normalizePowers(hero.powers);
};

const startEdit = () => {
  loadHero();
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

  loading.value = true;
  try {
    const powers = preparePowersForApi(editPowers.value);

    await heroService.updateHeroAuth({
      _id: editHero.value._id || editHero.value.id,
      publicName: editHero.value.publicName,
      realName: editHero.value.realName,
      powers,
    });

    // Recharger les informations de l'utilisateur
    await store.dispatch('users/fetchUser', currentUser.value.login);

    showUpdateConfirm.value = false;
    closeEditDialog();
  } catch (error) {
    console.error('Update error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container v-if="isAuthenticated && currentUser" class="page">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card variant="outlined">
          <v-card-title>Mon Profil Hero</v-card-title>

          <v-card-text>
            <div class="mb-4">
              <h3>Informations utilisateur</h3>
              <p><strong>Login:</strong> {{ currentUser.login }}</p>
            </div>

            <v-divider class="my-4" />

            <div v-if="currentUser.hero">
              <h3>Informations Hero</h3>
              <p><strong>Nom public:</strong> {{ currentUser.hero.publicName }}</p>
              <p><strong>Nom réel:</strong> {{ currentUser.hero.realName }}</p>
              <p><strong>ID:</strong> {{ currentUser.hero._id || currentUser.hero.id }}</p>
              <p>
                <strong>Pouvoirs:</strong>
                {{ formatPowers(currentUser.hero.powers) }}
              </p>

              <v-btn color="primary" class="mt-4" @click="startEdit">
                Modifier mes informations
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showEditDialog" max-width="520">
      <v-card>
        <v-card-title>Modifier mes informations</v-card-title>
        <v-card-text v-if="editHero">
          <v-text-field
            v-model="editHero.publicName"
            label="Nom public"
            density="comfortable"
            variant="outlined"
          />
          <v-text-field
            v-model="editHero.realName"
            label="Nom réel"
            density="comfortable"
            variant="outlined"
          />
          <div
            v-for="(power, index) in editPowers"
            :key="`profile-power-${index}`"
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
        <v-card-text>Valider les changements de vos informations ?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="loading" @click="showUpdateConfirm = false">Annuler</v-btn>
          <v-btn color="primary" :loading="loading" @click="confirmUpdateHero">Confirmer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.page {
  padding: 16px;
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
