import jwtDecode from 'jwt-decode'

// solve hash added by facebook after oauth redirect,
// see https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url

try {
  if (typeof window !== 'undefined' && window.location.hash && window.location.hash === '#_=_') {
    if (window.history && window.history.pushState) {
      window.history.pushState('', document.title, window.location.pathname)
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      }
      window.location.hash = ''
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top
      document.body.scrollLeft = scroll.left
    }
  }
} catch (err) {
  console.log('Failed to fix hash', err)
}

function jwtDecodeAlive (jwt) {
  if (!jwt) return null
  const decoded = jwtDecode(jwt)
  if (!decoded) return null
  const now = Math.ceil(Date.now().valueOf() / 1000)
  if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
    console.error(`token expired: ${decoded.exp}<${now},  ${JSON.stringify(decoded)}`)
    return null
  }
  if (typeof decoded.nbf !== 'undefined' && decoded.nbf > now) {
    console.warn(`token not yet valid: ${decoded.nbf}>${now}, ${JSON.stringify(decoded)}`)
    // do not return null here, this is probably a false flag due to a slightly mismatched clock
    // return null
  }
  return decoded
}

function goTo (url) {
  try {
    window.top.location.href = url
  } catch (err) {
    console.error('Failed to navigate in top window')
    window.location.href = url
  }
}

export const sessionStoreBuilder = () => ({
  namespaced: true,
  state: {
    user: null,
    initialized: false,
    directoryUrl: null,
    logoutRedirectUrl: null,
    cookieName: 'id_token',
    interval: 10000,
    autoKeepalive: 0,
    sameSite: null,
    activeAccountDetails: null,
    reloadAfterSwitchOrganization: true,
    reloadAfterLogout: true
  },
  getters: {
    loginUrl(state) {
      return (redirect, noImmediate, extraParams = {}) => {
        // Login can also be used to redirect user immediately if he is already logged
        // shorter than "logIfNecessaryOrRedirect"
        if (redirect && state.user && !noImmediate) return redirect
        if (!redirect || typeof redirect !== 'string') {
          redirect = global.location ? `${global.location.href}` : ''
        }
        let url = `${state.directoryUrl}/login?redirect=${encodeURIComponent(redirect)}`
        Object.keys(extraParams).filter(key => ![null, undefined, ''].includes(extraParams[key])).forEach(key => {
          url += `&${key}=${encodeURIComponent(extraParams[key])}`
        })
        return url
      }
    },
    activeAccount(state) {
      if (!state.user) return null
      if (state.user.organization) {
        const account = {
          type: 'organization',
          id: state.user.organization.id,
          name: state.user.organization.name
        }
        if (state.user.organization.department) {
          account.department = state.user.organization.department
        }
        if (state.user.organization.departmentName) {
          account.departmentName = state.user.organization.departmentName
        }
        return account
      } else {
        return {
          type: 'user',
          id: state.user.id,
          name: state.user.name
        }
      }
    },
    accountRole(state) {
      if (!state.user) return null
      if (state.user.organization) return state.user.organization.role
      else return 'admin'
    },
    isAccountAdmin(state, getters) {
      return getters.accountRole === 'admin'
    },
    cookieOpts(state) {
      const cookieOpts = { path: '/', sameSite: state.sameSite }
      if (state.sameSite) cookieOpts.sameSite = state.sameSite
      return cookieOpts
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
      if (user && state.user && state.user.id === user.id) {
        Object.assign(state.user, user)
        if (state.user.ipa && !user.ipa) delete state.user.ipa
        if (state.user.pd && !user.pd) delete state.user.pd
      } else {
        state.user = user
      }
    }
  },
  actions: {
    login({ getters }, redirect) {
      goTo(getters.loginUrl(redirect))
    },
    logout({ commit, state, getters }, redirect) {
      if (!this.httpLib) {
        console.error('No http client found to send logout action. You should pass Vue.http or Vue.axios as init param.')
        return
      }
      return this.httpLib.delete(`${state.directoryUrl}/api/auth`).then(() => {
        // sometimes server side cookie deletion is not applied immediately in browser local js context
        // so we do it here to
        this.cookies.set(`${state.cookieName}`, '', getters.cookieOpts)
        this.cookies.set(`${state.cookieName}_org`, '', getters.cookieOpts)
        this.cookies.set(`${state.cookieName}_dep`, '', getters.cookieOpts)

        if (redirect) {
          return goTo(redirect)
        } else if (state.logoutRedirectUrl) {
          return goTo(state.logoutRedirectUrl)
        } else if (state.reloadAfterLogout && typeof window !== 'undefined') {
          window.location.reload()
        }
        commit('setAny', { user: null })
      })
    },
    switchOrganization({ state, getters, commit, dispatch }, organizationId) {
      if (organizationId) {
        const [org, dep] = organizationId.split(':')
        this.cookies.set(`${state.cookieName}_org`, org, getters.cookieOpts)
        this.cookies.set(`${state.cookieName}_dep`, dep || '', getters.cookieOpts)
      } else {
        this.cookies.set(`${state.cookieName}_org`, '', getters.cookieOpts)
        this.cookies.set(`${state.cookieName}_dep`, '', getters.cookieOpts)
      }
      if (state.reloadAfterSwitchOrganization && typeof window !== 'undefined') window.location.reload()
      else dispatch('readCookie', { fromRes: true })
    },
    setAdminMode({ state, dispatch, getters }, params) {
      let adminMode, redirect
      if (typeof params === 'boolean') {
        adminMode = params
      } else {
        adminMode = params.value
        redirect = params.redirect
      }
      if (adminMode) {
        let url = getters.loginUrl(redirect, true)
        if (state.user) url += `&email=${encodeURIComponent(state.user.email)}`
        goTo(url + `&adminMode=true`)
      } else {
        if (!this.httpLib) {
          console.error('No http client found to send logout action. You should pass Vue.http or Vue.axios as init param.')
          return
        }
        this.httpLib.delete(`${state.directoryUrl}/api/auth/adminmode`).then(() => {
          dispatch('readCookie')
          goTo(redirect || state.logoutRedirectUrl || '/')
        })
      }
    },
    keepalive({ state, dispatch }) {
      if (!state.user) return
      if (this.httpLib) {
        return this.httpLib.post(`${state.directoryUrl}/api/auth/keepalive`).then(res => {
          dispatch('readCookie')
          return res.data || res.body
        })
      } else {
        console.error('No http client found to send keepalive action. You should pass Vue.http or Vue.axios as init param.')
      }
    },
    asAdmin({ state, dispatch }, user) {
      if (this.httpLib) {
        if (user) {
          this.httpLib.post(`${state.directoryUrl}/api/auth/asadmin`, user).then(() => {
            dispatch('readCookie')
            goTo(state.logoutRedirectUrl || '/')
          })
        } else {
          this.httpLib.delete(`${state.directoryUrl}/api/auth/asadmin`).then(() => {
            dispatch('readCookie')
            goTo(state.logoutRedirectUrl || '/')
          })
        }
      } else console.error('No http client found to send keepalive action. You should pass Vue.http or Vue.axios as init param.')
    },
    init({ commit, dispatch }, params) {
      if (!params.cookies) {
        throw new Error('You must init @data-fair/sd-vue vith a "cookies" wrapper with simple get and set methods like js-cookie, cookie-universal-nuxt or other')
      }
      this.cookies = params.cookies
      delete params.cookies
      this.httpLib = params.httpLib || this.$axios
      delete params.httpLib
      if (params.baseUrl) throw new Error('baseUrl param is deprecated, replaced with directoryUrl')
      if (params.cookieDomain) throw new Error('baseUrl param is deprecated, replaced with directoryUrl')
      if (params.sessionDomain) throw new Error('baseUrl param is deprecated, replaced with directoryUrl')
      if (!params.directoryUrl && params.directoryUrl !== '') throw new Error('directoryUrl param is required')
      const directoryUrl = params.directoryUrl.endsWith('/') ? params.directoryUrl.slice(0, -1) : params.directoryUrl
      commit('setAny', { ...params, directoryUrl })
      dispatch('readCookie')
    },
    readCookie({ state, commit, getters }) {
      let cookie = this.cookies.get(state.cookieName, { fromRes: true })
      if (cookie === undefined) cookie = this.cookies.get(state.cookieName)
      if (cookie) {
        const user = jwtDecodeAlive(cookie)
        if (user) {
          let organizationId = this.cookies.get(`${state.cookieName}_org`, { fromRes: true })
          if (organizationId === undefined) organizationId = this.cookies.get(`${state.cookieName}_org`)
          let departmentId = this.cookies.get(`${state.cookieName}_dep`, { fromRes: true })
          if (departmentId === undefined) departmentId = this.cookies.get(`${state.cookieName}_dep`)
          if (organizationId) {
            user.organization = (user.organizations || []).find(o => o.id === organizationId)
            if (departmentId) {
              user.organization = (user.organizations || []).find(o => o.id === organizationId && o.department === departmentId)
            }

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
        }
        commit('updateUser', user)
      } else {
        commit('setAny', { user: null })
      }
      if (state.activeAccountDetails && (!getters.activeAccount || getters.activeAccount.type !== state.activeAccountDetails.type || getters.activeAccount.id !== state.activeAccountDetails.id)) {
        commit('setAny', { activeAccountDetails: null })
      }
      commit('setAny', { initialized: true })
    },
    loop({ state, dispatch }, cookies) {
      if (!this.cookies && !cookies) {
        throw new Error('You must init @data-fair/sd-vue vith a "cookies" wrapper with simple get and set methods like js-cookie, cookie-universal-nuxt or other')
      }
      this.cookies = this.cookies || cookies

      this.httpLib = this.httpLib || this.$axios

      setTimeout(() => {
        // always start by a keepalive to fetch latest session info on page load
        dispatch('keepalive')

        setInterval(() => {
          // read the cookie regularily in case it was updated by another page
          dispatch('readCookie')

          // also check if the token is getting a little bit old, and renew it
          if (state.user && state.user.exp) {
            // console.log('JWT token from cookie is set to expire on', new Date(state.user.exp * 1000))
            const timestamp = Date.now() / 1000
            const tooOld = timestamp > (state.user.iat + ((state.user.exp - state.user.iat) / 3))
            if (tooOld) {
              // console.log('The token has lived more than a third of its lifetime, renew it')
              dispatch('keepalive')
            }
          }
        }, state.interval)

        // a "stupid" keepalive loop that spams the server with keepalive requests, avoid it
        if (state.autoKeepalive) {
          console.warn('autokeepalive option is not recommended, it creates unnecessary http traffic')
          dispatch('keepalive')
          setInterval(() => dispatch('keepalive'), state.autoKeepalive)
        }
      }, 0)
    },
    fetchActiveAccountDetails({ state, getters, commit }, forceRefresh = false) {
      if (!getters.activeAccount) return
      if (
        !forceRefresh &&
        state.activeAccountDetails &&
        state.activeAccountDetails.type === getters.activeAccount.type &&
        state.activeAccountDetails.id === getters.activeAccount.id
      ) {
        return
      }
      if (this.httpLib) {
        return this.httpLib.get(`${state.directoryUrl}/api/${getters.activeAccount.type}s/${getters.activeAccount.id}`).then(res => {
          const data = { ...(res.data || res.body), type: getters.activeAccount.type }
          commit('setAny', { activeAccountDetails: data })
          return data
        })
      } else {
        console.error('No http client found to fetch active account details. You should pass Vue.http or Vue.axios as init param.')
      }
    },
    cancelDeletion ({ state, dispatch }) {
      if (this.httpLib) {
        return this.httpLib.patch(`${state.directoryUrl}/api/users/${state.user.id}`, { plannedDeletion: null }).then(() => {
          dispatch('readCookie')
        })
      } else {
        console.error('No http client found to cancel deletion. You should pass Vue.http or Vue.axios as init param.')
      }
    }
  }
})

export const sessionStore = sessionStoreBuilder()
