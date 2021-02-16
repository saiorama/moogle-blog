<template>
    <div class="columns">
        <div class="column has-background-white has-text-centered" id="col-1" ref="col-1">
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
        <div class="column">
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
  created() {
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
    },
    showPostWithId(id){
      if(this.posts){
        this.isOpen = this.getIndexOfPostWithId(this.posts, id);
      }
    }
  },
  mixins: [zUtils],
  mounted: function(){
    if(!this.posts) {
      console.log("Mounted::Loading posts");
      this.getPosts();
    }
    //user arrived via a direct link
    if(this.urlNeedsRedirect()){
      this.redirectedPostId = this.getRedirectIdFromUrl().split('/')[0];
      console.log(`Mounted::RedirectedPostId = ${this.redirectedPostId}`);
    } else if(this.userIsOnBlog()){
      this.isOpen = 0; //show the first post
    }
  },
  watch: {
    isOpen: function(neww){
      if(typeof neww !== 'undefined' && this.posts){
        let post = this.posts.data[neww];
        console.log(`Opening ${post.id} with title = ${post.post_title}`);
        this.showPost(post.id, post.post_title);
      }
    },
    post: function(neww){
      this.subject = neww.data.subject;
      let x = new Blob([neww.data.html], { type: 'text/html' });
      this.htmlPart = URL.createObjectURL(x);
    },
    posts: function(neww){
      console.log("Thorax:Watch:Posts::Posts loaded");
      this.isOpen = undefined;
      if(neww && neww.data.length > 0) {
        if(this.redirectedPostId){//show the post the user landed on
          this.showPostWithId(this.redirectedPostId);
          this.redirectedPostId = undefined;
        } else {
            this.isOpen = 0; //show the first post
        }
      }
    },
    redirectedPostId: function(neww){
      if(neww && this.posts){
        this.showPostWithId(neww);
        this.redirectedPostId = undefined;
      }
    },
  },
};
</script>

<style type="text/css">
  @media only screen and (max-width: 760px) {
    #is-mobile-detector { display: none; }
  }
</style>