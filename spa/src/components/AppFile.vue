<template>
    <div class="app-file__wrapper" v-loading="loading">
        <el-image
                v-if="type === 'img'"
                :style="`width: ${width}px;height: ${height}px;`"
                fit="contain"
                :src="src"
                :preview-src-list="[src]">
        </el-image>
        <a v-else-if="type === 'unknown'"
           class="app-file__download"
           :href="src"
           target="_blank"
           :download="file.name">
            <span>{{ file.name }}</span>
        </a>
    </div>
</template>

<script>
    import MoreIssueModal from "./modals/MoreIssueModal";

    export default {
        name: "app-file",
        props: {
            url: {
                type: String
            },
            file: {
                type: Object
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
                src: undefined,
                type: ''
            }
        },
        mounted() {
            let fileType = this.file.name.slice(this.file.name.length - 4);
            if(fileType.indexOf('png') !== -1 || fileType.indexOf('jpg') !== -1 || fileType.indexOf('jpeg') !== -1)
                this.type = 'img';
            else
                this.type = 'unknown'
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
    .app-file {
        &__wrapper {
            width: max-content;
            margin: 10px;
        }
        &__download {
            display: block;
            width: 100px;
            height: 100px;
            border: 1px solid #87a330;
            border-radius: 2px;
            transition: 0.3s;
            >span {
                padding: 5px;
                display: flex;
                width: 100%;
                height: 100%;
                align-items: center;
                text-align: center;
                justify-content: center;
                color: #596f1d;
                font-weight: 500;
                transition: 0.3s;
            }
            &:hover {
                text-decoration: none;
                background-color: #87a330;
                > span {
                    color: white;
                }
            }
        }
    }
</style>