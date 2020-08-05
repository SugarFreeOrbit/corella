<template>
    <div class="app-img__wrapper" v-loading="loading">
        <el-image
                :style="`width: ${width}px;height: ${height}px;`"
                fit="contain"
                :src="src"
                :preview-src-list="[src]">
        </el-image>
    </div>
</template>

<script>
    import MoreIssueModal from "./modals/MoreIssueModal";

    export default {
        name: "app-img",
        props: {
            url: {
                type: String
            },
            width: {
                type: Number
            },
            height: {
                type: Number
            }
        },
        components: {
            MoreIssueModal
        },
        computed: {
            loading() {
                return this.src === undefined;
            }
        },
        data() {
            return {
                src: undefined
            }
        },
        mounted() {
            this.loadImage();
        },
        methods: {
            loadImage: async function () {
                try {
                    let response = await this.$http.get(this.url, { responseType: 'blob' });
                    this.src = window.URL.createObjectURL(response.data);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .app-img {
        &__wrapper {
            width: max-content;
            margin: 10px;
        }
    }
</style>