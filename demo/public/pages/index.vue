<template>
  <v-container fill-height>
    <v-layout column>
      <h3 class="display-3">Simple Directory - Nuxt recipe</h3>

      <span class="subheading">Use a simple directory for authentication and session in a nuxt project (vuejs + webpack + ssr).</span>

      <div><v-btn color="primary" @click="getProtectedResource">Access protected resource</v-btn></div>

      <span v-if="protectedResource">{{ protectedResource }}</span>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({protectedResource: null}),
  methods: {
    async getProtectedResource() {
      try {
        this.protectedResource = await this.$axios.$get('api/protected')
      } catch (err) {
        this.protectedResource = err.response.data
      }
    }
  }
}
</script>
