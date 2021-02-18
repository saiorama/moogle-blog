import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)
const HOST = (new URL(window.location));
const DOMAIN = HOST.hostname === 'localhost' ? 'https://moogle.cc' : HOST.origin;
const POSTS_URL = `${DOMAIN}/blog/index.json`;
const POST_URL = `${DOMAIN}/post?domain=${DOMAIN}&id=`;
let store = new Vuex.Store({
  state: {
    post: undefined,
    posts: undefined,
  },
  mutations: {
    initializeStore: function(state){
      if(localStorage.getItem('store')) {
				this.replaceState(
					Object.assign(state, JSON.parse(localStorage.getItem('store')))
				);
			}
    },
    setPost: function(state, post){
      state.post = post;
    },
    setPosts: function(state, posts){
      state.posts = posts;
    },
  },
  actions: {
    getPost: function(state, post){
      let vm = this;
      axios.get(`${POST_URL}${post.key}`)
      .then(d => {
        vm.commit('setPost', d);
      })
      .catch(e => console.log(e));
    },
    getPosts: function(){
      let vm = this;
      axios.get(POSTS_URL)
      .then(d => {
        vm.commit('setPosts', d);
      })
      .catch(e => console.log(e));
    },
  },
  modules: {
  }
})

store.subscribe((mutation, state) => {
  localStorage.setItem("store", JSON.stringify(JSON.parse(JSON.stringify(state))));
});

export default store;