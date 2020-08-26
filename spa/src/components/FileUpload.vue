<template>
    <div class="file-upload">
      <vue-dropzone ref="dropzone" id="dropzone" :options="dropzoneOptions" :includeStyling="true" :createImageThumbnails="false"  @vdropzone-removed-file="dzRemove" @vdropzone-file-added="drag">
      </vue-dropzone>
        <input style="display: none" placeholder="upload files"
               type="file" id="uploadFiles" ref="files"
               multiple hidden/>
        <div class="modal__upload-wrapper">
            <div class="modal__upload-list" style="display: flex">
                <div v-if="!loading" class="modal__upload-list--item file-upload__view-file" v-for="(file, i) in files" v-loading="loading">
                    <span class="remove" @click='removeFile(file, i)'>
                        <i class="el-icon-circle-close"></i>
                    </span>
                    <app-file :url="link + file._id"
                              :file="file"
                              :width="100"
                              :height="100">
                    </app-file>
                </div>
                <div v-else style="width: 100px;height: 100px" v-loading="loading"></div>
              <div v-if="files.length < filesLimit" v-loading="filesUploadLoading" class="modal__upload-list--btn-add" @click="chooseFiles()">+</div>
            </div>
        </div>
    </div>
</template>

<script>
    import AppFile from "./AppFile";
    import vue2Dropzone from 'vue2-dropzone'
    import 'vue2-dropzone/dist/vue2Dropzone.min.css'

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
            AppFile,
            vueDropzone: vue2Dropzone
        },
        data() {
            return {
                filesLimit: 5,
                filesUploadLoading: false,
                loading: false,
                dropzoneOptions: {
                  url: 'https://kostil.com',
                  thumbnailWidth: 150,
                  maxFilesize: 10,
                  autoProcessQueue: false,
                  addRemoveLinks: true,
                }
            }
        },
        mounted() {

        },
        methods: {
            drag: function (param) {
              this.handleFilesUpload(param);
            },
            dzRemove: function () {

            },
            async handleFilesUpload(file) {
                this.filesUploadLoading = true;

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

                await this.uploadFile(file);
                this.filesUploadLoading = false;
            },
            uploadFile: async function (file) {
              try {
                let formData = new FormData();
                formData.append('files', file);
                let response = await this.$http.post(this.attachLink, formData);
                this.files.push({
                  _id: response.data[0],
                  name: file.name,
                  filename: file.filename
                });
              } catch (error) {
                if(error.response.status === 400) {
                  this.$notify.error({
                    title: 'Error',
                    message: error.response.data
                  });
                }
                console.log(error);
              }
            },
            removeFile: async function (file, i) {
                if (i > -1) {
                    this.loading = true;
                    await this.$http.delete(this.detachLink + this.files[i]._id);
                    this.files.splice(i, 1);
                    this.loading = false;
                }
            },
            chooseFiles: function () {
                document.getElementById('dropzone').click();
            },
        }
    }
</script>

<style scoped lang="scss">
    .file-upload {
        width: 100%;
        position: relative;
        padding-top: 10px;
        padding-bottom: 10px;

        #dropzone {
          position: absolute;
          top: 0;
          z-index: 10;
          width: 100%;
          height: 140px;
          min-height: 140px;
          max-height: 140px;
        }

        &__view-file {
          z-index: 11;
        }

    }
</style>

<style lang="scss">
  .file-upload .vue-dropzone {
    background-color: transparent;

    border: none;

    &.dz-drag-hover {
      border: 1px solid #87a330;
      border-radius: 5px;
      z-index: 10;
      > .dz-message > span {
        color: #87a330;
        float: right;
        font-weight: 600;
      }
    }

    > .dz-message > span {
      color: transparent;
    }

    .dz-preview {
      display: none;
    }

  }
</style>
