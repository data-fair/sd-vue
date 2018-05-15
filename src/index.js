import cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'

export const sessionStore = {
  namespaced: true,
  state: {
    user: null,
    baseUrl: null,
    logoutRedirectUrl: null,
    cookieName: 'id_token',
    interval: 60000
  },
  mutations: {
    setAny(state, params) {
      Object.assign(state, params)
    }
  },
  actions: {
    login({state}) {
      window.location.href = `${state.baseUrl}/login?redirect=${window.location.origin}${window.location.pathname}?id_token=`
    },
    async logout({commit, state}) {
      await this.$axios.post(`${state.baseUrl}/logout`)
      commit('setAny', {user: null})
      if (state.logoutRedirectUrl) window.location.href = state.logoutRedirectUrl
    },
    init({commit}, params) {
      console.log('ok', params)
      commit('setAny', params)
    },
    readCookie({state, commit}) {
      const cookie = cookies.get(state.cookieName)
      if (cookie) commit('setAny', {user: jwtDecode(cookie)})
      else commit('setAny', {user: null})
    },
    loop({state, dispatch}) {
      setInterval(() => dispatch('readCookie'), state.interval)
    }
  }
}
