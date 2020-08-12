<template>
    <div>
        <navbar></navbar>
        <main v-loading="loading">
            <div class="config">
                <div class="config__list">
                    <div class="config__list-item">
                        <h3>Allowed File Types</h3>
                        <el-input style="max-width: 320px" placeholder="Please input" v-model="types"></el-input>
                    </div>
                </div>
                <el-button icon="el-icon-check" type="primary" @click="patchConfig">Update</el-button>
            </div>
        </main>
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
                loading: true,
                types: ''
            }
        },
        mounted() {
            this.loadConfig();
        },
        methods: {
            loadConfig: async function () {
                try {
                    let response = await this.$http.get(`/config`);
                    response.data.allowedFileTypes.forEach(item => {
                        this.types += `${item};`;
                    });
                    this.loading = false;
                } catch (error) {
                    console.log(error);
                }
            },
            patchConfig: async function () {
                let regexp = /[a-zA-Z0-9]*\w/g;
                let result = this.types.match(regexp);
                let config = {
                    allowedFileTypes: result === null ? [] : result
                };
                try {
                    await this.$http.patch(`/config`, config);
                    this.$notify({
                        title: 'Success',
                        message: 'Config updated successfully',
                        type: 'success'
                    });
                } catch (error) {
                    console.log(error);
                    this.$notify.error({
                        title: 'Error',
                        message: 'Something went wrong'
                    });
                }
            }
        },
    }
</script>

<style scoped lang="scss">
    .config {
        max-width: 1200px;
        margin: 20px auto;

        &__list {
            margin-bottom: 10px;
        }

    }
</style>