<script setup>
import {ref, onMounted} from 'vue';
import {useStore} from 'vuex';
import ErrorDialog from './components/ErrorDialog.vue';

const store = useStore();
const drawer = ref(false);

onMounted(() => {
  store.dispatch('users/restoreTokens');
});

const navItems = [
  {title: 'Heros', to: '/heroes'},
  {title: 'Organisations', to: '/orgs'},
  {title: 'Equipes', to: '/teams'},
  {title: 'Authentification', to: '/signin'},
];
</script>

<template>
  <v-app>
    <v-app-bar flat class="app-bar">
      <v-btn
        class="nav-button"
        icon
        variant="text"
        aria-label="Ouvrir le menu"
        @click="drawer = !drawer"
      >
        <span class="hamburger" />
      </v-btn>
      <v-app-bar-title>Heroes &amp; Villains</v-app-bar-title>
      <v-spacer />
      <v-btn color="primary" variant="flat" to="/signin">S'authentifier</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary class="nav-drawer">
      <v-list nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :title="item.title"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="app-main">
      <router-view />
    </v-main>

    <ErrorDialog />
  </v-app>
</template>

<style scoped>
:global(.v-application) {
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  background: #f5f2ea;
  color: #141414;
}

.app-bar {
  background: #f5f2ea;
  border-bottom: 1px solid rgba(20, 20, 20, 0.08);
}

.nav-button {
  margin-right: 8px;
}

.hamburger {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 2px;
  background: #141414;
  border-radius: 999px;
}

.hamburger::before,
.hamburger::after {
  content: "";
  position: absolute;
  left: 0;
  width: 20px;
  height: 2px;
  background: #141414;
  border-radius: 999px;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  top: 6px;
}

.nav-drawer {
  background: #ffffff;
}

.app-main {
  background: radial-gradient(circle at top left, #f7c59f 0%, #f5f2ea 40%, #e9ecef 100%);
  min-height: calc(100vh - 64px);
}
</style>
