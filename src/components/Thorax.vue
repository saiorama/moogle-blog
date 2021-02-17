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
          <div>
            <h1 v-if="post">{{subject}}</h1>
            <h1 v-else>Loading...</h1>
            <div v-if="post" v-html="rawHtml" class="has-text-left"></div>
        </div>
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
      currentPostId: undefined,
      isOpen: undefined,
      postMeta: undefined, //meta details about the post
      rawHtml: undefined,
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
      let idInUrl = this.getIdFromUrl();
      if(idInUrl === undefined || id !== idInUrl.split('/')[0]){
        this.$router.push({path: "/blog/", query: {
          id: id,
          url: title.replaceAll(/[^a-zA-Z\d\s:]/g, '').replaceAll(/[\s:]/g,'-')
        }});
      }
      this.$store.dispatch('getPost', {key: `${this.postMeta.filepath}`});
    },
    showPostWithId(id){
      if(this.posts){
        this.isOpen = this.getIndexOfPostWithId(this.posts, id);
      }
    }
  },
  mixins: [zUtils],
  mounted: function(){
    //user arrived via a direct link
    console.log(`Route =`, this.$route);
    if(this.urlContainsPostId(this.$route)){
      this.currentPostId = this.getIdFromUrl().split('/')[0];
      console.log(`Mounted::currentPostId = ${this.currentPostId}`);
    } else if(this.userIsOnBlog()){
      console.log(`Mounted::User is /blog. ${this.posts ? 'Showing first post': ''}`);
      if(this.posts) this.isOpen = 0; //show the first post
    }
    if(!this.posts) {
      console.log("Mounted::Loading posts");
      this.getPosts();
    }
  },
  watch: {
    currentPostId: function(neww){
      if(neww && this.posts){
        this.showPostWithId(neww);
      }
    },
    isOpen: function(neww){
      if(typeof neww !== 'undefined' && this.posts){
        let post = this.posts.data[neww];
        console.log(`Opening ${post.id} with title = ${post.post_title}`);
        this.showPost(post.id, post.post_title);
      }
    },
    post: function(neww){
      this.rawHtml = neww.data.html;
      this.subject = neww.data.subject;
      document.title = this.subject;
    },
    posts: function(neww){
      this.isOpen = undefined;
      if(neww && neww.data.length > 0) {
        if(this.currentPostId){//show the post the user landed on
          this.showPostWithId(this.currentPostId);
          this.currentPostId = undefined;
        } else {
            this.isOpen = 0; //show the first post
        }
      }
    },
    $route: function(to){
      if(to.query.id){
        this.currentPostId = to.query.id;
      }
    }
  },
};
</script>

<style type="text/css">
  @media only screen and (max-width: 760px) {
    #is-mobile-detector { display: none; }
  }
</style>