import Vue from 'vue'
import VueApollo from 'vue-apollo'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import ApolloClient from 'apollo-boost'


Vue.config.productionTip = false

Vue.use(VueApollo)

const apolloClient = new ApolloClient({
  uri: 'http://localhost:3000/graphql'
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

export const serverBus = new Vue()

new Vue({
  router,
  store,
  vuetify,
  apolloProvider,
  render: h => h(App)
}).$mount('#app')
