import Vue from 'vue'
import Vuex from 'vuex'
import { sessionStoreBuilder } from '../../../src/index.js'
Vue.use(Vuex)

export default () => {
  return new Vuex.Store({
    modules: { session: sessionStoreBuilder() },
    state: {
      env: {},
      protectedResource: null
    },
    mutations: {
      setAny(state, params) {
        Object.assign(state, params)
      }
    },
    actions: {
      nuxtServerInit({ commit, dispatch }, { req, env }) {
        commit('setAny', { env })
      },
      async getProtectedResource({ commit }) {
        let protectedResource
        try {
          protectedResource = await this.$axios.$get('api/protected')
        } catch (err) {
          protectedResource = err.response.data
        }
        commit('setAny', { protectedResource })
        return protectedResource
      }
    }
  })
}
