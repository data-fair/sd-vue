<template>
  <div v-if="organizations">
    <v-subheader>Current organization</v-subheader>
    <v-radio-group v-model="organizationId">
      <v-radio
        v-for="orga in organizations"
        :key="orga.key"
        :label="orga.name"
        :value="orga.id"
        @change="switchOrganization(orga.id)"
      />
    </v-radio-group>
    <v-divider/>
  </div>
</template>

<script>
import {mapState, mapActions} from 'vuex'
export default {
  data: () => ({organizationId: null}),
  computed: {
    ...mapState('session', ['user']),
    organizations() {
      if (!this.user || !this.user.organizations || !this.user.organizations.length) return null
      return [{id: null, name: 'Personal'}].concat(this.user.organizations)
    }
  },
  watch: {
    'user.organization.id'() {
      this.setOrganizationId()
    }
  },
  mounted() {
    this.setOrganizationId()
  },
  methods: {
    ...mapActions('session', ['switchOrganization']),
    setOrganizationId() {
      this.organizationId = (this.user && this.user.organization && this.user.organization.id) || null
    }
  }
}
</script>

<style lang="css"/>
