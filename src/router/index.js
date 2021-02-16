import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Post from '../components/Post.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/blog/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    children: [{
      component: Post,
      name: 'Post',
      path: 'post/:id/:url',
      props: true,
    },],
    component: Home,
    name: 'Home',
    path: '/blog',
  },
  { component: Home, path: '*', }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
