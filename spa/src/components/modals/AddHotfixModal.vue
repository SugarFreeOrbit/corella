<template>
    <el-dialog :visible="true" title="New hotfix" @close="close">
        <el-form v-model="newHotfix"
                 v-loading="loading">
            <el-form-item label="Title">
                <el-input required v-model="newHotfix.title"></el-input>
            </el-form-item>
            <el-form-item label="Description">
                <el-input type="textarea" v-model="newHotfix.description" :rows="5"></el-input>
            </el-form-item>
            <el-form-item label="Priority">
                <div style="width: 100%;display: flex">
                    <el-select v-model="newHotfix.priority" placeholder="Select">
                        <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </div>
            </el-form-item>
            <el-form-item>
                <el-button @click="chooseFiles()" size="small" type="primary">Click to upload</el-button>
                <input style="display: none" placeholder="upload files"
                       type="file" id="uploadFiles" ref="files"
                       multiple v-on:change="handleFilesUpload()" hidden/>
                <div v-if="newHotfix.files.length !== 0" class="modal__upload-wrapper">
                    <ul class="modal__upload-list">
                        <li v-for="(file, i) in newHotfix.files">
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
                loading: false,
                newHotfix: {
                    title: '',
                    description: '',
                    files: [],
                    limitOfFiles: 5,
                    priority: '1'
                },
                options: [{
                    value: '1',
                    label: 'Low'
                }, {
                    value: '2',
                    label: 'Medium'
                }, {
                    value: '3',
                    label: 'High'
                }, {
                    value: '4',
                    label: 'Urgent'
                }],
            }
        },
        computed: {
          allowedFiles() {
            return this.$store.state.allowedFiles;
          }
        },
        methods: {
            createIssue: async function () {
                let formData = new FormData();
                this.loading = true;
                if(this.newHotfix.title !== '') {
                    formData.append('title', this.newHotfix.title);
                } else {
                    this.$notify.error({
                        title: 'Error',
                        message: 'Title must not be empty'
                    });
                    this.loading = false;
                    return;
                }
                if(this.newHotfix.description !== '') {
                    formData.append('description', this.newHotfix.description);
                } else {
                    this.$notify.error({
                        title: 'Error',
                        message: 'Description must not be empty'
                    });
                    this.loading = false;
                    return;
                }
                formData.append('priority', this.newHotfix.priority);
                this.newHotfix.files.forEach((file, i) => {
                    formData.append('files', file);
                });
                try {
                    let result = await this.$http.put(`/projects/${this.projectId}/hotfixes`,
                        formData,
                        {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    this.loading = false;
                    this.close();
                    this.newHotfix.title = '';
                    this.newHotfix.description = '';
                } catch (e) {
                    if(e.response.status === 400) {
                      this.$notify.error({
                        title: 'Error',
                        message: e.response.data
                      });
                      console.log(e);
                      this.issueCreationModal.inProgress = false;
                      this.loading = false;
                      return;
                    }
                    console.log(e);
                    this.loading = false;
                }
            },
            chooseFiles: function () {
                document.getElementById("uploadFiles").click()
            },
            handleFilesUpload() {
              let obj = this.$refs.files.files;
              if(obj.length + this.newHotfix.files.length >= this.newHotfix.limitOfFiles + 1) {
                this.$notify({
                  title: 'Error',
                  message: `You can\'t upload more than ${this.newHotfix.limitOfFiles} files`,
                  duration: 3000,
                  type: 'error'
                });
                this.$refs.files.files = null;
                return;
              }
              let err = true;
              for (let i = 0; i < obj.length; ++i) {
                err = true;
                for (let j = 0; j < this.allowedFiles.length; ++j) {
                  if (obj[i].name.slice(obj[i].name.length - 5).indexOf(this.allowedFiles[j]) !== -1)
                    err = false;
                }
              }
              if (err) {
                this.$notify({
                  title: 'Error',
                  message: 'Unsupported file type',
                  duration: 3000,
                  type: 'error'
                });
                this.$refs.files.files = null;
                return;
              }
              if (this.newHotfix.files.length !== this.newHotfix.limitOfFiles) {
                this.newHotfix.files.push(...obj);
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