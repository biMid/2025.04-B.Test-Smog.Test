import { createApp } from 'vue'
import router from "./router"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'bootstrap'
import "bootstrap-icons/font/bootstrap-icons.css"
import 'bootstrap/dist/css/bootstrap.css'



import App from './App.vue'

createApp(App).use(router).use(ElementPlus).mount('#app')
