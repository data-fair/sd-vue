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
        if (user) {
          const organizationId = cookies.get(`${state.cookieName}_org`)
          if (organizationId) {
            user.organization = (user.organizations || []).find(o => o.id === organizationId)

            // consumerFlag is used by applications to decide if they should ask confirmation to the user
            // of the right quotas or other organization related context to apply
            // it is 'user' if id_token_org is an empty string or is equal to 'user'
            // it is null if id_token_org is absent or if it does not match an organization of the current user
            // it is the id of the orga in id_token_org
            if (user.organization) {
              user.consumerFlag = user.organization.id
            } else if (organizationId.toLowerCase() === 'user') {
              user.consumerFlag = 'user'
            }
          }
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
