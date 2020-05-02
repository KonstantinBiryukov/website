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
                    require('@/assets/phoneBook/5.png'),
                    require('@/assets/phoneBook/6.png'),
                    require('@/assets/phoneBook/1.png'),
                    require('@/assets/phoneBook/2.png'),
                    require('@/assets/phoneBook/3.png'),
                    require('@/assets/phoneBook/4.png')
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