export default ({ app, store, env }) => {
  store.dispatch('session/init', { cookies: app.$cookies, directoryUrl: env.directoryUrl })
}
