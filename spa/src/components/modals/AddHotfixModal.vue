<template>
    <el-dialog :visible="true" title="New hotfix" @close="close">
        <el-form v-model="issueCreationModal.form"
                 v-loading="issueCreationModal.inProgress">
            <el-form-item label="Title">
                <el-input required v-model="issueCreationModal.form.title"></el-input>
            </el-form-item>
            <el-form-item label="Description">
                <el-input type="textarea" v-model="issueCreationModal.form.description" :rows="5"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="chooseFiles()" size="small" type="primary">Click to upload</el-button>
                <input style="display: none" placeholder="upload files"
                       type="file" id="uploadFiles" ref="files"
                       multiple v-on:change="handleFilesUpload()" hidden/>
                <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
                <div v-if="issueCreationModal.form.files.length !== 0" class="modal__upload-wrapper">
                    <ul class="modal__upload-list">
                        <li v-for="(file, i) in issueCreationModal.form.files">
                            <p class="name">{{file.name}}
                                <span class="remove" @click='removeFile(file, i)'><i
                                        class="el-icon-circle-close"></i></span>
                            </p>
                        </li>
                    </ul>
                </div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="createIssue">Create</el-button>
                <el-button @click="close">Cancel</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>

    export default {
        name: "add-hotfix-modal",
        props: {
            projectId: {
                type: String
            }
        },
        data() {
            return {
                issueCreationModal: {
                    inProgress: false,
                    form: {
                        title: '',
                        description: '',
                        files: [],
                        limitOfFiles: 3
                    }
                },
            }
        },
        methods: {
            createIssue: async function () {
                let formData = new FormData();
                this.issueCreationModal.inProgress = true;
                formData.append('title', this.issueCreationModal.form.title);
                formData.append('description', this.issueCreationModal.form.description);
                formData.append('priority', '0');
                this.issueCreationModal.form.files.forEach((file, i) => {
                    formData.append('files', file);
                });
                try {
                    let result = await this.$http.put(`/projects/${this.projectId}/hotfixes`,
                        formData,
                        {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    console.log(result);
                    this.issueCreationModal.inProgress = false;
                    //this.issueCreationModal.active = false;
                    this.close();
                    this.issueCreationModal.title = '';
                    this.issueCreationModal.description = '';
                } catch (error) {
                    console.log(error);
                }
/*                if (this.$schemaValidators.validateNewIssue(this.issueCreationModal.form)) {
                    console.log('valid true');
                } else {
                    this.$notify({
                        title: 'Error',
                        message: 'Your issue is invalid',
                        duration: 3000,
                        type: 'error'
                    });
                    this.issueCreationModal.inProgress = false;
                }*/
            },
            chooseFiles: function () {
                document.getElementById("uploadFiles").click()
            },
            handleFilesUpload() {
                let obj = this.$refs.files.files;
                if (this.issueCreationModal.form.files.length !== this.issueCreationModal.form.limitOfFiles) {
                    this.issueCreationModal.form.files.push(...obj);
                } else {
                    this.$notify({
                        title: 'Error',
                        message: 'To mach files',
                        duration: 3000,
                        type: 'error'
                    });
                }
            },
            removeFile: function (file, i) {
                if (i > -1) {
                    this.issueCreationModal.form.files.splice(i, 1);
                }
            },
            close: function () {
                this.$emit('close');
            }
        }
    }
</script>

<style scoped lang="scss">

</style>