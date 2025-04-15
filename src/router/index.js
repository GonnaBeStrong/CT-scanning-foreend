import { createRouter, createWebHistory } from 'vue-router'



const routes = [
  {
    path: '/',
    component: () => import('../views/main.vue'),

    children: [{
      path: '/ct-process',
      component: () => import('../views/main/ct-process.vue')
    },{
      path: '/req-ans',
      component: () => import('../views/main/req-ans.vue')
    },{
      path: '/data',
      component: () => import('../views/main/data.vue')
    },{
      path: '/history-process',
      component: () => import('../views/main/history-process.vue')
    },{
      path: '/welcome',
      component: () => import('../views/main/welcome.vue')
    }]
  },
  {
    path: '',
    redirect: '/ct-process'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由登录拦截

export default router
