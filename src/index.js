import cookies from 'js-cookie'
import jwtDecode from 'jwt-decode'

export const sessionStore = {
  namespaced: true,
  state: {
    user: null,
    initialized: false,
    baseUrl: null,
    logoutRedirectUrl: null,
    cookieName: 'id_token',
    interval: 10000,
    autoKeepalive: 300000, // 5 minutes by default
    httpLib: null
  },
  getters: {
    loginUrl(state) {
      return redirect => {
        // Login can also be used to redirect user immediately if he is already logged
        // shorter than "logIfNecessaryOrRedirect"
        if (redirect && state.user) return redirect
        redirect = redirect && typeof redirect === 'string' ? redirect : `${window.location.origin}${window.location.pathname}`
        if (redirect.indexOf('?') === -1) redirect += '?id_token='
        else redirect += '&id_token='
        return `${state.baseUrl}/login?redirect=${encodeURIComponent(redirect)}`
      }
    }
  },
  mutations: {
    setAny(state, params) {
      // Replace undefined with null to prevent breaking reactivity
      Object.keys(params).forEach(k => {
        if (params[k] === undefined) params[k] = null
      })
      Object.assign(state, params)
    }
  },
  actions: {
    login({getters}, redirect) {
      window.location.href = getters.loginUrl(redirect)
    },
    logout({commit, state}) {
      const httpLib = state.httpLib || this.$axios
      if (httpLib) httpLib.post(`${state.baseUrl}/logout`)
      else console.error('No http client found to send logout action. You should pass Vue.http or Vue.axios as init param.')
      commit('setAny', {user: null})
      if (state.logoutRedirectUrl) window.location.href = state.logoutRedirectUrl
    },
    switchOrganization({state, commit, dispatch}, organizationId) {
      if (organizationId) cookies.set(`${state.cookieName}_org`, organizationId)
      else cookies.remove(`${state.cookieName}_org`)
      dispatch('readCookie')
    },
    keepalive({state, dispatch}) {
      const httpLib = state.httpLib || this.$axios
      if (httpLib) httpLib.post(`${state.baseUrl}/logout`)
      else console.error('No http client found to send logout action. You should pass Vue.http or Vue.axios as init param.')
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
        commit('setAny', {user, initialized: true})
      } else {
        commit('setAny', {user: null, initialized: true})
      }
    },
    loop({state, dispatch}) {
      setTimeout(() => dispatch('readCookie'), 0)
      setInterval(() => dispatch('readCookie'), state.interval)
      if (state.autoKeepalive) {
        dispatch('keepalive')
        setInterval(() => dispatch('keepalive'), state.autoKeepalive)
      }
    }
  }
}
