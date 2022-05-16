<template lang="html">
<v-toolbar-items class="lang-switcher">
  <v-speed-dial
    v-if="locales.length > 1"
    direction="bottom"
    transition="fade-transition"
  >
    <template #activator>
      <v-btn
        depressed
        style="height: 100% !important;border-radius: 0;"
      >
        {{ $i18n.locale }}
      </v-btn>
    </template>
    <v-btn
      v-for="locale in locales.filter(l => l !== $i18n.locale)"
      :key="locale"
      fab
      elevation="1"
      small
      nuxt
      @click="setLocale(locale)"
    >
      {{ locale }}
    </v-btn>
  </v-speed-dial>
  </v-toolbar-items>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    locales: {type: Array, default: () => ['fr', 'en']},
  },
  methods: {
    setLocale (locale) {
      this.$i18n.setLocale(locale)
      window.location.reload()
    }
  }
}
</script>

<style lang="css">
</style>
