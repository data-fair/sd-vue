<template>
  <div v-if="consumers">
    <v-subheader>Current consumer</v-subheader>
    <v-list-tile v-for="consumer in consumers" :key="consumer.id" @click="switchOrganization(consumer.id !== user.consumerFlag ? consumer.id : null)">
      <v-list-tile-action>
        <v-checkbox :input-value="consumer.id === user.consumerFlag"/>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>{{ consumer.name }}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-divider/>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
export default {
  computed: {
    ...mapState('session', ['user']),
    consumers() {
      if (!this.user || !this.user.organizations || !this.user.organizations.length) return null
      return [{id: 'user', name: this.user.name}].concat(this.user.organizations)
    }
  },
  methods: {
    ...mapActions('session', ['switchOrganization'])
  }
}
</script>

<style lang="css"/>
