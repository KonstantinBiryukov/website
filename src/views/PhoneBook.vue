<template>
<span>
    <ul>
        <li v-for="(photo, index) in photos">
            <GoBack></GoBack>
            <img :src=photo :alt=index>
            <hr><hr><hr>
        </li>
    </ul>
</span>
</template>

<script>
    import GoBack from "@/components/GoBack"

    export default {
        components: {GoBack},
        data() {
            return {
                photos: [
                    require('@/server/phoneBook/5.png'),
                    require('@/server/phoneBook/6.png'),
                    require('@/server/phoneBook/1.png'),
                    require('@/server/phoneBook/2.png'),
                    require('@/server/phoneBook/3.png'),
                    require('@/server/phoneBook/4.png')
                ]
            }
        }
    }
</script>

<style scoped>
    img {
        height: auto;
        width: 60%;
    }

    li {
        background: grey;
    }
</style>