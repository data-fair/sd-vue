<template>
  <v-app>
    <v-toolbar app color="white">
      <v-toolbar-title><h1 class="headline hidden-xs-only">Simple Directory - Client Nuxt</h1></v-toolbar-title>

      <v-spacer/>

      <template v-if="session.initialized">
        <v-btn v-if="!session.user" color="primary" @click="login">login</v-btn>
        <v-menu v-else offset-y>
          <v-btn slot="activator" flat>{{ session.user.name }}</v-btn>
          <v-list>
            <select-consumer/>
            <v-list-tile @click="logout">
              <v-list-tile-title>Logout</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>
      </template>
    </v-toolbar>

    <v-content>
      <v-container fluid>
        <nuxt/>
      </v-container>
    </v-content>
    <v-footer class="pa-3">
      <v-spacer/>
      <div>Powered by <a href="https://koumoul-dev.github.io/simple-directory/">Simple Directory</a></div>
    </v-footer>
  </v-app>
</template>

<script>
import selectConsumer from '../components/select-consumer'
const {mapActions} = require('vuex')

export default {
  components: {selectConsumer},
  computed: {
    session() {
      return this.$store.state.session
    }
  },
  methods: mapActions('session', ['logout', 'login'])
}

</script>
