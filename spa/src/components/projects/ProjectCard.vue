<template>
    <el-card class="project-card">
        <div slot="header" class="clearfix">
            <span>
                <router-link :to="'/projects/' + project._id" class="project-card__name">{{project.name}}</router-link>
            </span>
        </div>
        <div v-if="project.description !== undefined">
            {{project.description}}
        </div>
    </el-card>
</template>

<script>
    export default {
        name: "project-card",
        props: {
            project: {
                type: Object,
                require: true
            }
        }
    }
</script>

<style scoped lang="scss">
    .project-card {
        width: 350px;
        display: inline-block;
        margin: 30px;

        &__name {
            text-decoration: none;
            color: #87A330;
            font-weight: bold;

            &:hover {
                color: #a9c737;
            }

            &:active {
                color: #87A330;
            }
        }
    }
</style>