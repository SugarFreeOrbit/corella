<template>
    <el-dialog class="add-hotfix-modal" :visible="true" title="New hotfix" @close="close">
        <el-form v-model="newHotfix"
                 v-loading="loading">
            <el-form-item label="Title">
                <el-input required v-model="newHotfix.title"></el-input>
            </el-form-item>
            <el-form-item label="Description">
                <el-input type="textarea" v-model="newHotfix.description" :rows="5"></el-input>
            </el-form-item>
            <el-form-item>
                <div style="width: 100%;display: flex">
                  <el-form-item label="Priority" style="margin-right: 10px">
                    <el-select v-model="newHotfix.priority" placeholder="Select">
                      <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="Branch">
                    <el-input required v-model="newHotfix.branch"></el-input>
                  </el-form-item>
                </div>
            </el-form-item>
            <el-form-item>
              <vue-dropzone ref="dropzone" id="dropzone" :options="dropzoneOptions" @vdropzone-removed-file="dzRemove" @vdropzone-file-added="drag"></vue-dropzone>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="createIssue">Create</el-button>
                <el-button @click="close">Cancel</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
    import vue2Dropzone from 'vue2-dropzone'
    import 'vue2-dropzone/dist/vue2Dropzone.min.css'

    export default {
        name: "add-hotfix-modal",
        props: {
            projectId: {
                type: String
            }
        },
        components: {
          vueDropzone: vue2Dropzone
        },
        data() {
            return {
                loading: false,
                newHotfix: {
                    title: '',
                    description: '',
                    files: [],
                    limitOfFiles: 5,
                    priority: '1',
                    branch: ''
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
                dropzoneOptions: {
                  url: 'https://kostil.com',
                  thumbnailWidth: 150,
                  maxFilesize: 10,
                  autoProcessQueue: false,
                  addRemoveLinks: true
                }
            }
        },
        computed: {
          allowedFiles() {
            return this.$store.state.allowedFiles;
          }
        },
        methods: {
            dzRemove: function (param) {
              let i = 0;
              for(let file of this.newHotfix.files) {
                if(file === param) {
                  this.newHotfix.files.splice(i, 1);
                  break;
                }
                ++i;
              }
            },
            drag: function (param) {
              this.handleFilesUpload(param);
            },
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
                }
                formData.append('branch', this.newHotfix.branch);
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
            handleFilesUpload(file) {
              if(this.newHotfix.files.length >= this.newHotfix.limitOfFiles) {
                this.$notify({
                  title: 'Error',
                  message: `You can\'t upload more than ${this.newHotfix.limitOfFiles} files`,
                  duration: 3000,
                  type: 'error'
                });
                this.$refs.dropzone.removeFile(file);
                return;
              }
              let err = true;
              for(let j = 0; j < this.allowedFiles.length; ++j) {
                if(file.name.slice(file.name.length - 5).indexOf(this.allowedFiles[j]) !== -1) {
                  err = false;
                  break;
                }
              }
              if(err) {
                this.$notify({
                  title: 'Error',
                  message: 'Unsupported file type',
                  duration: 3000,
                  type: 'error'
                });
                this.$refs.dropzone.removeFile(file);
                return;
              }
              if (this.newHotfix.files.length !== this.newHotfix.limitOfFiles) {
                this.newHotfix.files.push(file);
              } else {
                this.$notify({
                  title: 'Error',
                  message: 'Too many files',
                  duration: 3000,
                  type: 'error'
                });
              }
            },
            removeFile: function (file, i) {
                if (i > -1) {
                    this.newHotfix.files.splice(i, 1);
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

<style>
.add-hotfix-modal .dz-progress {
  display: none!important;
}
</style>