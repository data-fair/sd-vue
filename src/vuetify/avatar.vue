<template>
  <div class="sd-avatar" :class="{'has-org-avatar': showAccount && activeAccount.type !== 'user'}">
    <v-avatar
      v-if="showAccount && activeAccount.type === 'user'"
      class="user-avatar"
      :size="36"
    >
      <img :src="`${directoryUrl}/api/avatars/user/${user.id}/avatar.png`">
    </v-avatar>
    <v-avatar
      v-else
      class="user-avatar"
      :size="36"
    >
      <img :src="`${directoryUrl}/api/avatars/${activeAccount.type}/${activeAccount.id}/avatar.png`">
    </v-avatar>
    <v-avatar
      class="org-avatar"
      :size="28"
      v-if="showAccount && activeAccount.type !== 'user'"
    >
      <img :src="`${directoryUrl}/api/avatars/user/${user.id}/avatar.png`">
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
    ...mapGetters('session', ['activeAccount'])
  },
}
</script>

<style>
.sd-avatar {
  width: 36px;
  text-indent: 0;
}
.sd-avatar.has-org-avatar {
  width: 56px;
  height: 40px;
  position: relative;
  margin-left: 8px;
  margin-right: 8px;
}
.sd-avatar.has-org-avatar .user-avatar {
  position: absolute;
  left: 0;
  top: 0
}
.sd-avatar .org-avatar {
  position:absolute;
  right:0px;
  bottom:0;
}
</style>