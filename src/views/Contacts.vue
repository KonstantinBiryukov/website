<template>
    <div class="wrapper">
        <SocialMedia></SocialMedia>
        <div class="contacts-wrapper">
        <TheContacts></TheContacts>
        </div>
    </div>
</template>

<script>
    import SocialMedia from "../components/SocialMedia";
    import TheContacts from "../components/TheContacts";

    export default {
        name: "Contacts",
        components: {
            SocialMedia,
            TheContacts
        }
    }
</script>


<style scoped lang="scss">
    .wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(45deg, #ee0979, #ff6a00);
        flex-wrap: wrap;
    }

    .contacts-wrapper {
        margin: 30px;
        padding: 10px;
    }
</style>