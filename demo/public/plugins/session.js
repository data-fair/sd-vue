export default ({store}) => {
  store.dispatch('session/init', {baseUrl: store.state.env.publicUrl + '/api/session'})
}
