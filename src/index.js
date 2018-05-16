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
    switchOrganization({state, commit, dispatch}, organizationId) {
      if (organizationId) cookies.set(`${state.cookieName}_org`, organizationId)
      else cookies.remove(`${state.cookieName}_org`)
      dispatch('readCookie')
    },
    init({commit}, params) {
      commit('setAny', params)
    },
    readCookie({state, commit}) {
      const cookie = cookies.get(state.cookieName)
      if (cookie) {
        const user = jwtDecode(cookie)
        const organizationId = cookies.get(`${state.cookieName}_org`)
        if (user && organizationId) {
          user.organization = (user.organizations || []).find(o => o.id === organizationId)
        }
        commit('setAny', {user})
      } else {
        commit('setAny', {user: null})
      }
    },
    loop({state, dispatch}) {
      setInterval(() => dispatch('readCookie'), state.interval)
    }
  }
}
