<template>
    <div class="projects" v-loading="loading">
        <div class="projects__tools" v-if="isAdmin">
            <el-button icon="el-icon-plus" type="primary" @click="goToBuilder">Create new
                project
            </el-button>
        </div>
        <div class="projects__list">
            <project-card v-for="project in projects" :key="project._id" :project="project"></project-card>
        </div>
    </div>
</template>

<script>
    import ProjectCard from "./ProjectCard";

    export default {
        name: "projects-list",
        components: {ProjectCard},
        data() {
            return {
                projects: [],
                loading: true,
            }
        },
        computed: {
            isAdmin: function () {
                return this.$store.state.user.isAdmin;
            }
        },
        mounted() {
            this.loadProjects();
        },
        methods: {
            loadProjects: async function () {
                let res = await this.$http.get('/projects');
                this.projects = res.data;
                this.loading = false;
            },
            goToBuilder: function () {
                this.$router.push('/project-builder');
            },
        },
    }
</script>

<style scoped lang="scss">
    .projects {
        height: calc(100vh - 52px);

        &__tools {
            display: flex;
            justify-content: center;
            padding-top: 25px;
            box-sizing: border-box;
        }

        &__list {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
    }
</style>