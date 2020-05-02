<template>
    <div class="parallax">
        <header>
            <h1>Konstantin Biriukov</h1>
            <!--<p>This is my website. Welcome. Check out my portfolio </p>-->
        </header>
        <p class="content">
            I am a passionate software developer who is specialized in front-end development. I am currently studying
            in Saint Cloud State University (Minnesota) pursuing Master Degree as a Fulbright scholar.
            Check out my portfolio and contact me if you have any questions.
            <br>
            <button class="download">
                <a class="download-link" target="_blank"
                   href="https://drive.google.com/open?id=18n7UuuJXfxGaInVcysXLfDG5wGEfV9cR">
                    <font-awesome-icon class="icon-download" :icon="['fa', 'download']"></font-awesome-icon>
                    Download resume
                </a>
            </button>
        </p>
    </div>
</template>

<script>
    export default {
        name: "Parallax"
    }
</script>


<style>
    html {
        height: 100%;
        overflow: hidden;
    }

    body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        perspective: 1px;
        transform-style: preserve-3d;
    }
</style>

<style scoped lang="scss">
    /*html {*/
    /*height: 100%;*/
    /*overflow: hidden;*/
    /*}*/

    /*body {*/
    /*margin: 0;*/
    /*padding: 0;*/
    /*height: 100%;*/
    /*overflow-x: hidden;*/
    /*overflow-y: auto;*/
    /*perspective: 1px;*/
    /*transform-style: preserve-3d;*/
    /*}*/

    header {
        position: relative;
        font-family: "Sedgwick Ave", cursive;
        color: #fff;
        box-sizing: border-box;
        min-height: 100vh;
        min-width: 100vw;
        overflow: hidden;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 0 50px;
        transform-style: inherit;
        -moz-perspective: 2px;

        &:before {
            content: '';
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            position: absolute;
            min-height: 10vh;
            /*background-image: url("../assets/pexels-photo.jpeg");*/
            background-image: url("../assets/background.jpg");

            background-repeat: no-repeat;
            background-size: cover;
            transition: 1s linear;
            transform: translatez(-1px) scale(2);
            z-index: -1;
        }

        h1 {
            color: #191919;
            font-size: 60px;
            letter-spacing: 6px;
            text-shadow: 5px 5px 10px #555;
            margin-top: 0;
            margin-bottom: 200px;
        }

        p {
            font-size: 20px;
            letter-spacing: 1px;
            max-width: 60%;

        }
    }

    .content {
        padding: 50px;
        background-color: #191919;
        /*background: linear-gradient(#B82E1F, #000000, #000000);*/
        margin: 0;
        font-size: 20px;
        color: #f1f1f1;

    }

    .download {
        margin-top: 15px;
        padding: 10px;
        background-color: #555;
        color: #111;
        font-weight: bold;
        border: 1px #ff3c5c solid;
    }

    .icon-download {
        color: #ff3f5f;
    }

    .download-link {
        color: greenyellow;
    }

    @media only screen and (min-width: 1680px) {
        header {
            h1 {
                font-size: 90px;
            }
        }
    }

</style>
