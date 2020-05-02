<template>
    <div>
        <p><span>email</span>: kostya.igm@gmail.com</p>
        <p><span>phone</span>: 320-223-5504 (USA)</p>
    </div>
</template>

<script>
    export default {
        name: "TheContacts"
    }
</script>

<style scoped>
    p {
        font-size: 25px;
        letter-spacing: 5px;
        font-weight: bold;
        color: ghostwhite;
    }

    span {
        text-decoration: underline;
    }

    @media only screen and (min-width: 1680px) {
        p {
            font-size: 32px;
            letter-spacing: 7px;
        }
    }
</style>