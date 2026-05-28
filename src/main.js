import { createApp } from 'vue'
import App from './App.vue'
import './styles/global.css'
import 'virtual:uno.css'

function ensureRoot() {
  let root = document.getElementById('cs-root')
  if (root) return root
  root = document.createElement('div')
  root.id = 'cs-root'
  const parent = document.body ? document.body : document.documentElement
  parent.appendChild(root)
  return root
}

function init() {
  const root = ensureRoot()
  const app = createApp(App)
  app.mount(root)
  console.log('[chara-status] Vue app mounted.')
}

if (document.body) {
  init()
} else {
  document.addEventListener('DOMContentLoaded', () => init(), { once: true })
}
