<template>
  <v-container fill-height>
    <v-layout column>
      <h3 class="display-3">Simple Directory - Nuxt recipe</h3>

      <span class="subheading">Use a simple directory for authentication and session in a nuxt project (vuejs + webpack + ssr).</span>

      <div v-if="user">
        <pre>{{ JSON.stringify(user, null, 2) }}</pre>
      </div>

      <div><v-btn color="primary" @click="getProtectedResource">Access protected resource</v-btn></div>

      <span v-if="protectedResource">{{ protectedResource }}</span>
    </v-layout>
  </v-container>
</template>

<script>
import {mapState, mapActions} from 'vuex'
export default {
  computed: {
    ...mapState(['protectedResource']),
    ...mapState('session', ['user'])
  },
  created() {
    // this.user is available both in the browser and when doing SSR rendering
    console.log('User when rendering page (both browser and SSR): ', this.user && this.user.email)
  },
  async fetch({ store }) {
    const user = store.state.session.user
    console.log('User when fetching data during SSR: ', user && user.email)
    if (user) {
      console.log('Fetch protected resource during SSR')
      console.log(await store.dispatch('getProtectedResource'))
    }
  },
  methods: {
    ...mapActions(['getProtectedResource'])
  }
}
</script>
