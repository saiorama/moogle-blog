<template>
    <div>
        <h1 v-if="post">{{subject}}</h1>
        <h1 v-else>Loading...</h1>
        <div v-if="post" v-html="rawHtml" class="has-text-left"></div>
    </div>
</template>

<script>
import {zUtils} from './utils/utils'
export default {
    computed:{
        post() { return this.$store.state.post; },
        posts() { return this.$store.state.posts; }
    },
    created: function(){
        let p = this.getPostWithId(this.posts, this.id);
        if(p){
            let fp = p.filepath.split('/').pop();
            this.$store.dispatch('getPost', {key: `blogposts/${fp}`});
        }
    },
    data() {
        return {
            rawHtml: undefined,
            subject: undefined,
        }
    },
    methods: {

    },
    mixins: [zUtils],
    props: ['id', 'url'],
    watch: {
        post: function(neww){
            this.subject = neww.data.subject;
            this.rawHtml = neww.data.html;
        },
        $route(to, from){
            console.log(`Post:Watch:$route`, `to`, to, `from`, from);
            let post = this.getPostWithId(this.posts, to.query.id);
            this.$store.dispatch('getPost', {key: post.filepath});
        }
    }
}
</script>