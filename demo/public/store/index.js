import Vue from 'vue'
import Vuex from 'vuex'
import {sessionStore} from 'simple-directory-client-nuxt'
Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: {session: sessionStore},
    state: {
      env: {}
    },
    mutations: {
      setAny(state, params) {
        Object.assign(state, params)
      }
    },
    actions: {
      nuxtServerInit({commit, dispatch}, {req, env}) {
        commit('setAny', {env})
        dispatch('session/init', {user: req.user, baseUrl: env.publicUrl + '/api/session'})
      }
    }
  })
}
