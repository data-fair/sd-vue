export default ({ app, store, env, $vuetify, route }) => {
  if (app.$cookies.get('theme_dark') !== undefined) $vuetify.theme.dark = app.$cookies.get('theme_dark')
  if (route.query.dark) $vuetify.theme.dark = route.query.dark === 'true'
  $vuetify.theme.themes.light.admin = '#E53935'
  $vuetify.theme.themes.dark.admin = '#E53935'
}
