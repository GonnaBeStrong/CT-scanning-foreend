import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import * as Icons from '@ant-design/icons-vue'
import { Pie } from '@ant-design/plots';


const app = createApp(App);
app.use(Antd).use(store).use(router).use(Pie).mount('#app')

const icons = Icons
for(const i in icons){
    app.component(i,icons[i])
}
