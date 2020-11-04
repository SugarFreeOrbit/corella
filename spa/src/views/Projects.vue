<template>
    <div style="height: 100%">
        <navbar></navbar>
        <router-view></router-view>
    </div>
</template>

<script>
    import Navbar from "../components/Navbar";

    export default {
        name: "projects",
        components: {Navbar},
    }
</script>