import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
export const NEW_INSTANCE_PAGE  = 'newInstance';
export const INSTANCE_PAGE  = 'Instance';
export const CLASS_PAGE  = 'classname';
export const MODELING  = 'modeling';
export const MODELING_PARAM  = 'modelingParam';
export const INSTANCE_PAGE_BASE  = 'InstanceBase';

    const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../components/Test.vue')
    },
    {
      path: '/modeling',
      name: MODELING,
      component: () => import('../components/Modeling.vue'),
      children:[{
        path: '/modeling/:instanceid',
        name: MODELING_PARAM,
        component: () => import('../components/Modeling.vue')

    }]},

    {
      path: '/instance',
      name: INSTANCE_PAGE_BASE,
      component: () => import('../components/Instance.vue'),
      children:[{
        path: '/instance/:instanceid',
        name: INSTANCE_PAGE,
        component: () => import('../components/Instance.vue')
    }]},
    /*{
      path: '/:resUri/:ePackage/:className/:',
      name: CLASS_PAGE,
      children:[{
        path: '/:resUri/:ePackage/:className/newInstance',
        name: NEW_INSTANCE_PAGE,
        component: () => import('../components/NewInstance.vue')
      },

      ]

    },*/

  ]
})


export default router
