<template>
    <div>
        <h1 v-if="post">{{subject}}</h1>
        <h1 v-else>Loading...</h1>
        <iframe id="embedded-post" v-if="post" style="height:fit-content;overflow:hidden;overflow-x:hidden;overflow-y:hidden;min-height:1920px;width:100%;" v-bind:src="htmlPart"/>
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
            htmlPart: undefined,
            subject: undefined,
        }
    },
    methods: {

    },
    mixins: [zUtils],
    props: ['id', 'url'],
    watch: {
        post: function(neww){
            if(this.htmlPart) {
                URL.revokeObjectURL(this.htmlPart);
                this.htmlPart = undefined;
            }
            this.subject = neww.data.subject;
            let x = new Blob([neww.data.html], { type: 'text/html' });
            this.htmlPart = URL.createObjectURL(x);
        },
        $route(to, from){
            console.log(`Post:Watch:$route`, `to`, to, `from`, from);
            let post = this.getPostWithId(this.posts, to.params.id);
            this.$store.dispatch('getPost', {key: post.filepath});
        }
    }
}
</script>