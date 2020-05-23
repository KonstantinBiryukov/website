<template>
    <a class="black ui card" :href=headerLink>
        <div class="content up">
            <a class="header" target="_blank" :href=headerLink> {{ name }}</a>
        </div>
        <div class="image">
            <img :src=mainImageLink :alt=name>
        </div>
        <div class="content down">
            <slot name="description"></slot>
        </div>
        <img v-if="extraImageLink" class="ui large image" :src=extraImageLink alt="CollinsAerospace_Award">
        <div v-if="headerLink" class="ui inverted segment">
            <a :href=headerLink target="_blank">
                <button class="ui inverted red button">Check out the project</button>
            </a>
        </div>
    </a>
</template>

<script>
    export default {
        name: "ProjectCard",
        props: {
            name: {
                type: String,
                required: true
            },
            headerLink: {
                type: String,
            },
            mainImageLink: {
                type: String,
                required: true
            },
            extraImageLink: {
                type: String
            }
        }
        // ,
        // methods: {
        //     transition() {
        //         $(".card").transition('pulse');
        //     }
        // }
    }
</script>

<style scoped lang="scss">
    .content, .header, .description {
        background-color: grey !important;
        color: white !important;
        font-size: 15px !important;
    }

    .header {
        font-size: 23px !important;
    }

    .content.up {
        max-height: 60px;
    }

    .content.down > p,
    .content.down > ul {
        font-weight: bold;
    }

    .ui.inverted.segment {
        margin-top: 0;
    }

    @media only screen and (min-width: 1680px) {
        .content, .header, .description {
            font-size: 32px !important;
            line-height: 1.5 !important;
        }

        .header {
            font-size: 37px !important;
        }

        .content.up {
            max-height: 110px;
        }

        .ui.inverted.red.button {
            margin-top: 10px;
            font-size: 30px;
        }
    }
</style>