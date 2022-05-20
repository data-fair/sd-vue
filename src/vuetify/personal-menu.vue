<template>
  <v-toolbar-items v-if="initialized" class="personal-menu">
    <v-btn
      v-if="!user"
      v-t="'login'"
      depressed
      color="primary"
      @click="login"
    />
    <v-menu
      v-else
      offset-y
      nudge-left
      max-height="510"
    >
      <template #activator="{on}">
        <v-btn
          text
          class="px-0"
          v-on="on"
        >
          <avatar show-account />
        </v-btn>
      </template>

      <v-list
        outlined
        class="pb-0"
      >
        <!-- current account, not actionable -->
        <v-list-item disabled :style="activeAccount.type !== 'user' ? 'padding-left:0' : ''">
          
          <avatar show-account style="margin-right: 16px;" />
          
          <v-list-item-content class="text--secondary">
            <v-list-item-title class="font-weight-medium">{{user.name}}</v-list-item-title>
            <v-list-item-subtitle>{{ activeAccount.type === 'user' ? $t('personalAccount') : activeAccount.name }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <!-- account switching (personal account and organizations) -->
        <template v-if="user.organizations.length > 1 || (user.organizations.length === 1 && !user.ipa)">
          <v-subheader v-t="'switchAccount'" style="height: 24px" />
          <v-list-item
            v-if="activeAccount.type !== 'user' && !user.ipa"
            id="toolbar-menu-switch-user"
            @click="switchOrganization()"
          >
            <v-list-item-avatar class="ml-0 my-0">
              <v-avatar :size="28">
                <img :src="`${directoryUrl}/api/avatars/user/${user.id}/avatar.png`">
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-title v-t="'personalAccount'" />
          </v-list-item>
          <v-list-item
            v-for="organization in user.organizations.filter(o => activeAccount.type === 'user' || activeAccount.id !== o.id)"
            :id="'toolbar-menu-switch-orga-' + organization.id"
            :key="organization.id"
            @click="switchOrganization(organization.id)"
          >
            <v-list-item-avatar class="ml-0 my-0">
              <v-avatar :size="28">
                <img :src="`${directoryUrl}/api/avatars/organization/${organization.id}/avatar.png`">
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-title>{{ organization.name }}</v-list-item-title>
          </v-list-item>
        </template>

        <v-divider />

        <slot name="actions-before"></slot>

        <!-- toggle admin mode -->
        <template v-if="user.isAdmin">
          <v-list-item dense>
            <v-list-item-action><v-icon>mdi-shield-alert</v-icon></v-list-item-action>
            <v-list-item-title style="overflow: visible;">
              <v-switch
                v-model="user.adminMode"
                color="admin"
                hide-details
                class="mt-0"
                :label="$t('adminMode')"
                @change="setAdminMode"
              />
            </v-list-item-title>
          </v-list-item>
        </template>

        <v-list-item
          v-if="darkModeSwitch"
          dense
        >
          <v-list-item-action><v-icon>mdi-weather-night</v-icon></v-list-item-action>
          <v-list-item-title style="overflow: visible;">
            <v-switch
              v-model="$vuetify.theme.dark"
              hide-details
              class="mt-0"
              :label="$t('darkMode')"
              color="white"
              @change="setDarkCookie"
            />
          </v-list-item-title>
        </v-list-item>

        <v-divider />
        <v-list-item @click="logout">
          <v-list-item-action><v-icon>mdi-logout</v-icon></v-list-item-action>
          <v-list-item-title v-t="'logout'" />
        </v-list-item>
      </v-list>
    </v-menu>
  </v-toolbar-items>
</template>

<i18n lang="yaml">
fr:
  login: Se connecter / S'inscrire
  logout: Se déconnecter
  personalAccount: Compte personnel
  switchAccount: Changer de compte
  adminMode: mode admin
  darkMode: mode nuit
en:
  login: Login / Sign up
  logout: Logout
  personalAccount: Personal account
  switchAccount: Switch account
  adminMode: admin mode
  darkMode: night mode
</i18n>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Avatar from './avatar.vue'

export default {
  components: { Avatar },
  props: {
    redirectAdminMode: {type: String, required: false},
    darkModeSwitch: {type: Boolean, default: true},
  },
  computed: {
    ...mapState('session', ['user', 'initialized', 'directoryUrl']),
    ...mapGetters('session', ['activeAccount'])
  },
  methods: {
    ...mapActions('session', ['logout', 'login', 'switchOrganization']),
    setDarkCookie (value) {
      const maxAge = 60 * 60 * 24 * 100 // 100 days
      this.$cookies.set('theme_dark', '' + value, { maxAge })
      window.location.reload()
    },
    setAdminMode (value) {
      const redirect = value ? null : this.redirectAdminMode
      this.$store.dispatch('session/setAdminMode', { value, redirect })
    }
  }
}
</script>

<style>

</style>