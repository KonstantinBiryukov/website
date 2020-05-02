<template>
    <span class="go-back">
            <button class="ui labeled icon button active" @click="goBack">
        <i class="left chevron icon"></i>
        Back
    </button>
    </span>

    <!--<button @click="goBack">Go Back</button>-->
</template>

<script>
    export default {
        methods: {
            goBack() {
                return this.$router.go(-1);
            }
        }

    }
</script>

<style scoped>
    .go-back {
        position: absolute;
        display: flex;
        cursor: pointer;
        padding: 20px;
    }
</style>