import cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'

export const sessionStore = {
  namespaced: true,
  state: {
    user: null,
    baseUrl: null,
    logoutRedirectUrl: null
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
    init({commit}, {baseUrl, logoutRedirectUrl, cookieName, interval}) {
      cookieName = cookieName || 'id_token'
      interval = interval !== undefined ? interval : 60000
      commit('setAny', {baseUrl, logoutRedirectUrl})
      function readCookie() {
        const cookie = cookies.get(cookieName)
        if (cookie) commit('setAny', {user: jwtDecode(cookie)})
        else commit('setAny', {user: null})
      }
      readCookie()
      if (interval > 0) setInterval(readCookie, interval)
    }
  }
}
