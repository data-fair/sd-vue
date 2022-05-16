<template>
  <v-app>
    <v-app-bar app dense>
      <v-toolbar-title><h1 class="headline hidden-xs-only">Simple Directory - Client Nuxt</h1></v-toolbar-title>

      <v-spacer/>

      
      <lang-switcher />
      <personal-menu>
        <template #actions-before>
          <v-list-item
            :to="'/me'"
            :nuxt="true"
          >
            <v-list-item-action><v-icon>mdi-information-outline</v-icon></v-list-item-action>
            <v-list-item-title v-t="'myAccount'" />
          </v-list-item>
        </template>
      </personal-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </v-main>
    <v-footer class="pa-3">
      <v-spacer/>
      <div>Powered by <a href="https://data-fair.github.io/simple-directory/">Simple Directory</a></div>
    </v-footer>
  </v-app>
</template>

<i18n lang="yaml">
fr:
  myAccount: Informations personnelles
en:
  myAccount: Informations personnelles
</i18n>

<script>
import PersonalMenu from '../../../src/vuetify/personal-menu.vue'
import LangSwitcher from '../../../src/vuetify/lang-switcher.vue'
const {mapActions, mapGetters} = require('vuex')

export default {
  components: {PersonalMenu, LangSwitcher}
}

</script>
