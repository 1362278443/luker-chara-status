import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/global.css'
import 'virtual:uno.css'

function ensureRoot(): HTMLElement {
  let root = document.getElementById('cs-root')
  if (root) return root
  root = document.createElement('div')
  root.id = 'cs-root'
  ;(document.body ?? document.documentElement).appendChild(root)
  return root
}

function init(): void {
  const root = ensureRoot()
  const app = createApp(App)
  app.use(createPinia())
  app.mount(root)
  console.log('[chara-status] Vue app mounted.')
}

if (document.body) {
  init()
} else {
  document.addEventListener('DOMContentLoaded', () => init(), { once: true })
}
