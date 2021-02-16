<template>
    <div class="columns">
        <div class="column has-background-white has-text-centered is-hidden-mobile" id="col-1" ref="col-1">
          <p v-if="!posts" class="content is-small has-text-grey has-text-weight-semibold">
            No blog posts found
          </p>
          <div v-else class="is-size-7">
            <b-button
            icon-left="refresh"
            class="p-2 is-text is-size-7"
            @click.prevent="getPosts()">Refresh
            </b-button>
            <b-collapse
              class="card"
              animation="slide"
              v-for="(post, index) of posts.data"
              :key="post.id || post.filepath"
              :open="isOpen == index"
              @open="isOpen = index">
                <template #trigger="props">
                  <div
                      class="card-header"
                      :class="{'has-background-light' : isOpen == index}"
                      role="button"
                  >
                      <p class="card-header-title">
                          {{ post.post_title }}
                      </p>
                      <a class="card-header-icon">
                          <b-icon
                              :icon="props.open ? 'menu-down' : 'menu-up'">
                          </b-icon>
                      </a>
                  </div>
                </template>
                <div class="card-content">
                    <div class="content">
                      <p> Published <span class="has-text-weight-semibold">{{ friendlyDate(post.published_unix_ts) }} </span> by <span class="has-text-weight-semibold">{{post.author}}</span> </p>
                      <p> {{ post.post_excerpt }}</p>
                    </div>
                </div>
            </b-collapse>
          </div>
        </div>
        <div class="column is-three-fifths">
          <router-view></router-view>
        </div>
        <div class="column is-hidden-mobile">
          <template>
            <section v-if="postMeta && postMeta.tags && postMeta.tags.trim().length > 0">
              <b-field v-for="tag in postMeta.tags.split(',')" :key="tag.trim()">
                  <b-tag rounded>{{tag.trim()}}</b-tag>
              </b-field>
            </section>
          </template>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import {zUtils} from './utils/utils'
export default {
  components:{
  },
  computed: {
    post() { return this.$store.state.post; },
    posts() { 
      if(this.$store.state.posts){
        let posts = JSON.parse(JSON.stringify(this.$store.state.posts));
        let data = posts.data;
        posts.data = data.map(post => {
          post.id = this.getIdFromFilepath(post.filepath);
          return post;
        });
        return posts;
      }
      return undefined;
    },
  },
  data() {
    return {
      htmlPart: undefined,
      isOpen: undefined,
      postMeta: undefined, //meta details about the post
      redirectedPostId: undefined,
      sesStatsModalIsVisible: undefined,
      showTextVersion: false,
      subject: undefined,
      textPart: undefined,
      variables: undefined,
    }
  },
  methods: {
    friendlyDate: (date) => {
      if(typeof date === 'string') date = new Date(date);
      return moment.unix(date).fromNow();
    },
    getPosts() {
      this.$store.dispatch('getPosts');
    },
    showPost(id, title){
      this.postMeta = this.getPostWithId(this.posts, id);
      this.$router.push({name: "Post", params: {
        id: id,
        url: title.replaceAll(/[^a-zA-Z\d\s:]/g, '').replaceAll(/[\s:]/g,'-')
      }});
    }
  },
  mixins: [zUtils],
  mounted: function(){
    if(this.urlNeedsRedirect()){
      let id = this.getRedirectIdFromUrl();
      console.log(`Found ${id} in url. Redirecting...`);
      this.redirectedPostId = id.split('/')[0];
      this.$router.push({name: "Post", params: {
        id: id.split('/')[0],
        url: id.split('/').pop()
      }});
    } else {//there is no `?id=<post-id>` in the url
      console.log(`User is on the blog. Loading all posts...`);
      this.getPosts();
    }
  },
  watch: {
    isOpen: function(neww){
      if(typeof neww !== 'undefined'){
        let post = this.posts.data[neww];
        this.showPost(post.id, post.post_title);
      }
    },
    post: function(neww){
      this.subject = neww.data.subject;
      let x = new Blob([neww.data.html], { type: 'text/html' });
      this.htmlPart = URL.createObjectURL(x);
    },
    posts: function(neww){
      this.isOpen = undefined;
      if(neww && neww.data.length > 0) {
        this.isOpen = 0;
        if(this.redirectedPostId){
          let vm = this;
          let idx = neww.data.find((post, index) => {
            if(vm.getIdFromFilepath(post.filepath) === vm.redirectedPostId) return index;
          });
          if(typeof idx !== 'undefined') this.isOpen = idx;
          this.redirectedPostId = undefined;
        }
      }
    },
    $route(to, from) {
      console.log(`Thorax`, to, from);
    }
  },
};
</script>

<style type="text/css">
  @media only screen and (max-width: 760px) {
    #is-mobile-detector { display: none; }
  }
</style>