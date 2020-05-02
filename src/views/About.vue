<template>
    <div class="about">
        <Parallax/>
        <Skills>
        </Skills>
        <!--<SocialMedia/>-->
    </div>
</template>

<script>
    // @ is an alias to /src
    import Parallax from '@/components/Parallax.vue'
    // import SocialMedia from "../components/SocialMedia";
    import Skills from "../components/Skills.vue";

    export default {
        name: 'Home',
        components: {
            Parallax,
            Skills
            // SocialMedia
        }
    }
</script>
