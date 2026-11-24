import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { i18n } from './i18n'

document.documentElement.lang = i18n.global.locale.value
document.title = i18n.global.t('pageTitle')

createApp(App).use(i18n).mount('#app')
