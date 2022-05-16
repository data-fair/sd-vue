<template>
  <v-iframe :src="directoryUrl + '/me?embed=true'" />
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
import { mapState } from 'vuex'

export default {
  components: { VIframe },
  computed: {
    ...mapState('session', ['directoryUrl'])
  }
}
</script>

<style lang="css" scoped>
</style>
