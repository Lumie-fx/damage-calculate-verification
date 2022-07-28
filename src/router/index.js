import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import echarts from '@/components/echarts'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: () => import('@/components/newone')
    },
    {
      path: '/newone',
      name: 'newone',
      component: () => import('@/components/newone')
    },
    {
      path: '/HelloWorld',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/echarts',
      name: 'echarts',
      component: echarts
    },
  ]
})
