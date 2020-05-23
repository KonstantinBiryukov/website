<template>
    <div class="content">
        <h1>Key Skills</h1>
        <img src="../server/logos/vue.png" alt="Vue.js" class="logo">
        <img src="../server/logos/js.png" alt="Java" class="logo">
        <img src="../server/logos/html5.png" alt="HTML5" class="logo">
        <img src="../server/logos/css3.png" alt="CSS3" class="logo">
        <img src="../server/logos/java.png" alt="Java" class="logo">
    </div>
</template>

<script>
    export default {
        name: "Skills"
    }
</script>

<style scoped lang="scss">
    h1 {
        font-size: 20px;
    }
    .content {
        padding: 50px;
        background-color: #191919;
        /*background: linear-gradient(#B82E1F, #000000, #000000);*/
        margin: 0;
        font-size: 20px;
        color: #f1f1f1;
    }

    .logo {
        border-radius: 100px; /* Радиус скругления */
        border: 2px solid green; /* Параметры рамки */
        box-shadow: 0 0 7px #666; /* Параметры тени */
        width: 60px;
        height: 60px;
        display: inline-block;
        margin: 5px;

        &:hover {
            transform: scale(1.2);
            box-shadow: 0 15px 30px rgba(0, 0, 0, .5);
        }
    }
</style>