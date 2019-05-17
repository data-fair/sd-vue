import jwtDecode from 'jwt-decode'

function jwtDecodeAlive (jwt) {
  if (!jwt) return null
  const decoded = jwtDecode(jwt)
  if (!decoded) return null
  const now = Date.now().valueOf() / 1000
  if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
    console.error(`token expired: ${JSON.stringify(decoded)}`)
    return null
  }
  if (typeof decoded.nbf !== 'undefined' && decoded.nbf > now) {
    console.error(`token expired: ${JSON.stringify(decoded)}`)
    return null
  }
  return decoded
}

export const sessionStoreBuilder = () => ({
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
    },
    updateUser(state, user) {
      if (state.user && state.user.id === user.id) Object.assign(state.user, user)
      else state.user = user
    }
  },
  actions: {
    login({ getters }, redirect) {
      window.location.href = getters.loginUrl(redirect)
    },
    logout({ commit, state }) {
      const httpLib = state.httpLib || this.$axios
      if (!httpLib) {
        console.error('No http client found to send logout action. You should pass Vue.http or Vue.axios as init param.')
        return
      }
      return httpLib.post(`${state.baseUrl}/logout`).then(() => {
        if (state.logoutRedirectUrl) {
          window.location.href = state.logoutRedirectUrl
          return
        }
        commit('setAny', { user: null })
      })
    },
    switchOrganization({ state, commit, dispatch }, organizationId) {
      if (organizationId) this.cookies.set(`${state.cookieName}_org`, organizationId)
      else this.cookies.remove(`${state.cookieName}_org`)
      dispatch('readCookie')
    },
    setAdminMode({ state, commit, dispatch }, adminMode) {
      if (adminMode) this.cookies.set(`${state.cookieName}_admin`, 'true')
      else this.cookies.remove(`${state.cookieName}_admin`)
      dispatch('readCookie')
    },
    keepalive({ state, dispatch }) {
      if (!state.user) return
      const httpLib = state.httpLib || this.$axios
      if (httpLib) {
        httpLib.post(`${state.baseUrl}/keepalive`).then(() => {
          dispatch('readCookie')
        })
      } else console.error('No http client found to send keepalive action. You should pass Vue.http or Vue.axios as init param.')
    },
    init({ commit, dispatch }, params) {
      if (!params.cookies) {
        throw new Error('You must init @koumoul/sd-vue vith a "cookies" wrapper with simple get and set methods like js-cookie, cookie-universal-nuxt or other')
      }
      this.cookies = params.cookies
      delete params.cookies
      commit('setAny', params)
      dispatch('readCookie')
    },
    readCookie({ state, commit }) {
      const cookie = this.cookies.get(state.cookieName)
      if (cookie) {
        const user = jwtDecodeAlive(cookie)
        if (user) {
          const organizationId = this.cookies.get(`${state.cookieName}_org`)
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
          } else {
            user.organization = null
          }

          if (user.isAdmin && this.cookies.get(`${state.cookieName}_admin`)) {
            user.adminMode = true
          } else {
            user.adminMode = false
          }
        }
        commit('updateUser', user)
      } else {
        commit('setAny', { user: null })
      }
      commit('setAny', { initialized: true })
    },
    loop({ state, dispatch }, cookies) {
      if (!this.cookies && !cookies) {
        throw new Error('You must init @koumoul/sd-vue vith a "cookies" wrapper with simple get and set methods like js-cookie, cookie-universal-nuxt or other')
      }
      this.cookies = this.cookies || cookies

      setTimeout(() => {
        dispatch('readCookie')
        setInterval(() => dispatch('readCookie'), state.interval)
        if (state.autoKeepalive) {
          dispatch('keepalive')
          setInterval(() => dispatch('keepalive'), state.autoKeepalive)
        }
      }, 0)
    }
  }
})

export const sessionStore = sessionStoreBuilder()
