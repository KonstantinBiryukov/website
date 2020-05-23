<template>
    <div class="container">
        <div class="wrapper">
            <h1>404</h1>
            <h2>Not Found</h2>
            <p>Try going </p>
            <a>
                <router-link to="/"> home</router-link>
            </a>
        </div>
    </div>
</template>

<script>
    export default {
        name: "NotFound"
    }
</script>

<style scoped lang="scss">
    .container {
        min-height: 100vh;
        background: linear-gradient(45deg, #2e3192, #1bffff);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .wrapper {
        text-align: center;

        h2 {
            margin: 10px 0;
        }

        h1 {
            margin: 0;
            font-size: 170px;
            letter-spacing: 20px;
            background: url("../server/background.jpg");
            background-size: contain;
            -webkit-text-fill-color: transparent;
            -webkit-background-clip: text;
        }

        p {
            font-size: 20px;
        }

        a {
            display: inline-block;
            text-decoration: none;
            background-color: #fa1918;
            color: #fff;
            text-transform: uppercase;
            padding: 5%;
            border-radius: 20px;
            font-size: 14px;
            transition: .3s ease;
        }
    }
</style>