<template>
    <ul class="container">
        <li><a target="_blank" href="https://github.com/KonstantinBiryukov">
            <font-awesome-icon :icon="['fab', 'github']"></font-awesome-icon>
        </a></li>
        <li><a target="_blank" href="https://www.linkedin.com/in/konstantin-biriukov/">
            <font-awesome-icon :icon="['fab', 'linkedin']"></font-awesome-icon>
        </a></li>
        <li><a target="_blank" href="https://www.instagram.com/kostyaleon/">
            <font-awesome-icon :icon="['fab', 'instagram']"></font-awesome-icon>
        </a></li>
        <!--<li><a target="_blank" href="https://www.youtube.com/channel/UCDrOrtvOTOyCpQwV6CaBZfg">-->
        <!--<font-awesome-icon :icon="['fab', 'youtube']"></font-awesome-icon>-->
        <!--</a></li>-->
    </ul>
</template>

<script>
    export default {
        name: "SocialMedia"
    }
</script>

<style scoped lang="scss">
    * {
        margin: 0;
        padding: 0;
    }

    .container {
        display: flex;
        list-style: none;

        li {
            margin: 10px;
        }

        a {
            text-decoration: none;
            background-color: #f1f1f1;
            color: #ff2626;
            width: 130px;
            height: 130px;

            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 30%;
            box-shadow: -5px 5px 20px -5px #010101;
            position: relative;
            overflow: hidden;

            svg {
                /*font-size: 34px;*/
                font-size: 60px;

                transition: .3s ease;
            }

            &:before {
                position: absolute;
                content: '';
                width: 120%;
                height: 120%;
                background-color: #ff2626;
                left: -110%;
                top: 90%;
                transform: rotate(45deg);
            }

            &:hover {
                svg {
                    transform: scale(1.3);
                    color: #f1f1f1;
                }

                &:before {
                    animation-name: hover;
                    animation-duration: 1s;
                    top: -10%;
                    left: -10%;
                }
            }
        }

        @media only screen and (min-width: 1680px) {
            a {
                width: 220px;
                height: 220px;

                svg {
                    font-size: 100px;
                }
            }
        }
    }

    @keyframes hover {
        0% {
            top: -110%;
            left: 90%;
        }

        50% {
            top: 10%;
            left: -30%;
        }

        100% {
            top: -10%;
            left: -10%;
        }

    }
</style>