<template>
    <div class="file-upload">
        <input style="display: none" placeholder="upload files"
               type="file" id="uploadFiles" ref="files"
               multiple v-on:change="handleFilesUpload()" hidden/>
        <div class="modal__upload-wrapper">
            <div class="modal__upload-list" style="display: flex">
                <div class="modal__upload-list--item" v-for="(file, i) in files">
                    <span class="remove" @click='removeFile(file, i)'>
                        <i class="el-icon-circle-close"></i>
                    </span>
                    <app-file :url="link + file._id"
                              :file="file"
                              :width="100"
                              :height="100">
                    </app-file>
                </div>
                <div v-if="files.length < filesLimit" v-loading="filesUploadLoading" class="modal__upload-list--btn-add" @click="chooseFiles()">+</div>
            </div>
        </div>
    </div>
</template>

<script>
    import AppFile from "./AppFile";

    export default {
        name: "file-upload",
        props: {
            link: {
                type: String
            },
            attachLink: {
                type: String
            },
            detachLink: {
                type: String
            },
            files: {
                type: Array
            }
        },
        components: {
            AppFile
        },
        data() {
            return {
                filesLimit: 3,
                filesUploadLoading: false
            }
        },
        mounted() {

        },
        methods: {
            async handleFilesUpload() {
                this.filesUploadLoading = true;
                let files = this.$refs.files.files;
                if(this.files.length >= this.filesLimit) {
                    this.$notify({
                        title: 'Error',
                        message: 'Too many files',
                        duration: 3000,
                        type: 'error'
                    });
                    this.filesUploadLoading = false;
                    return;
                }
                for(let i = 0; i < files.length; ++i) {
                    await this.uploadFile(files[i]);
                }
                this.filesUploadLoading = false;
            },
            uploadFile: async function (file) {
                let formData = new FormData();
                formData.append('files', file);
                let response = await this.$http.post(this.attachLink, formData);
                this.files.push({
                    _id: response.data[0],
                    name: file.name,
                    filename: file.filename
                });
            },
            removeFile: async function (file, i) {
                if (i > -1) {
                    await this.$http.delete(this.detachLink + this.files[i]._id);
                    this.files.splice(i, 1);
                }
            },
            chooseFiles: function () {
                document.getElementById("uploadFiles").click()
            },
        }
    }
</script>

<style scoped lang="scss">
    .file-upload {
        width: 100%;
    }
</style>