import Vue from 'vue'
import Vuex from 'vuex'
import session from '../../../src/session.js'

Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: {session},
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
      }
    }
  })
}
