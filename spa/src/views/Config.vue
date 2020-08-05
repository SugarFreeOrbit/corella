<template>
    <div>
        <navbar></navbar>
        <div class="userManagement container-fluid" v-loading="loading">
            test
        </div>
    </div>
</template>

<script>
    import Navbar from "../components/Navbar";

    export default {
        name: "config",
        components: {
            Navbar
        },
        data() {
            return {

            }
        },
        methods: {
        },
    }
</script>

<style scoped lang="scss">

</style>