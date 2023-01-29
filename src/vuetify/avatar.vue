<template>
  <div class="sd-avatar" :class="{'has-secondary-avatar': showAccount && activeAccount.type !== 'user'}">
    <v-avatar
      v-if="showAccount && activeAccount.type === 'user'"
      class="primary-avatar"
      :size="36"
    >
      <img :src="userAvatarUrl" aria-hidden alt="">
    </v-avatar>
    <v-avatar
      v-else
      class="primary-avatar"
      :size="36"
    >
      <img :src="accountAvatarUrl" aria-hidden alt="">
    </v-avatar>
    <v-avatar
      class="secondary-avatar"
      :size="28"
      v-if="showAccount && activeAccount.type !== 'user'"
    >
      <img :src="userAvatarUrl" aria-hidden alt="">
    </v-avatar>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    showAccount: {type: Boolean, default: false}
  },
  computed: {
    ...mapState('session', ['directoryUrl', 'user']),
    ...mapGetters('session', ['activeAccount']),
    userAvatarUrl() {
      return `${this.directoryUrl}/api/avatars/user/${this.user.id}/avatar.png`
    },
    accountAvatarUrl() {
      let url = `${this.directoryUrl}/api/avatars/${this.activeAccount.type}/${this.activeAccount.id}`
      if (this.activeAccount.department) url += `/${this.activeAccount.department}`
      url += '/avatar.png'
      return url
    }
  },
}
</script>

<style>
.sd-avatar {
  width: 36px;
  text-indent: 0;
}
.sd-avatar.has-secondary-avatar {
  width: 56px;
  height: 40px;
  position: relative;
  margin-left: 8px;
  margin-right: 8px;
}
.sd-avatar.has-secondary-avatar .primary-avatar {
  position: absolute;
  left: 0;
  top: 0
}
.sd-avatar .secondary-avatar {
  position:absolute;
  right:0px;
  bottom:0;
}
</style>