<template>
    <div id="app">
        <TheNavigation></TheNavigation>
        <transition name="fade" mode="out-in">
            <router-view/>
        </transition>
    </div>
</template>

<script>
    import TheNavigation from "@/components/TheNavigation"

    export default {
        components: {
            TheNavigation
        }
    }
</script>


<style lang="scss">
    html, body {
        background-color: grey;
    }

    * {
        margin: 0;
        padding: 0;
    }

    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }

    /*** TRANSITIONS ***/
    .fade-enter {
        opacity: 0;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease-out;
    }

    .fade-leave-to {
        opacity: 0;
    }
</style>
