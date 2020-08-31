<template>
    <el-dialog class="add-issue-modal" :visible="true" title="New issue" @close="close">
        <el-form v-on:submit.native.prevent="createIssue" v-model="issueCreationModal.form"
                 v-loading="issueCreationModal.inProgress">
            <el-form-item label="Title">
                <el-input required v-model="issueCreationModal.form.title"></el-input>
            </el-form-item>
            <el-form-item label="Description">
                <el-input type="textarea" v-model="issueCreationModal.form.description" :rows="5"></el-input>
            </el-form-item>
            <el-form-item>
              <file-upload-local v-model="issueCreationModal.form.files"></file-upload-local>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="createIssue">Create</el-button>
                <el-button @click="close">Cancel</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>


<script>
import FileUploadLocal from "@/components/FileUploadLocal";

export default {
  name: "add-issue-modal",
  props: {
    projectId: {
      type: String
    }
  },
  components: {
    FileUploadLocal
  },
  data() {
    return {
      issueCreationModal: {
        active: true,
        inProgress: false,
        form: {
          title: '',
          description: '',
          files: [],
          limitOfFiles: 5
        }
      },
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
      for(let file of this.issueCreationModal.form.files) {
        if(file === param) {
          this.issueCreationModal.form.files.splice(i, 1);
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
      this.issueCreationModal.inProgress = true;
      formData.append('title', this.issueCreationModal.form.title);
      formData.append('description', this.issueCreationModal.form.description);
      this.issueCreationModal.form.files.forEach((file, i) => {
        formData.append('files', file);
      });
      if (this.$schemaValidators.validateNewIssue(this.issueCreationModal.form)) {
        try {
          let result = await this.$http.put(`/projects/${this.projectId}/issues`,
              formData,
              {
                headers: {'Content-Type': 'multipart/form-data'}
              });
          this.issueCreationModal.inProgress = false;
          this.close();
          this.issueCreationModal.title = '';
          this.issueCreationModal.description = '';
        } catch (e) {
          if(e.response.status === 400) {
            this.$notify.error({
              title: 'Error',
              message: e.response.data
            });
            console.log(e);
            this.issueCreationModal.inProgress = false;
            return;
          }
          console.log(e);
        }
      } else {
        this.$notify({
          title: 'Error',
          message: 'Your issue is invalid',
          duration: 3000,
          type: 'error'
        });
        this.issueCreationModal.inProgress = false;
      }
    },
    chooseFiles: function () {
      document.getElementById("uploadFiles").click()
    },
    handleFilesUpload(file) {
      if(this.issueCreationModal.form.files.length >= this.issueCreationModal.form.limitOfFiles) {
        this.$notify({
          title: 'Error',
          message: `You can\'t upload more than ${this.issueCreationModal.form.limitOfFiles} files`,
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
      if (this.issueCreationModal.form.files.length !== this.issueCreationModal.form.limitOfFiles) {
        this.issueCreationModal.form.files.push(file);
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

<style>
  .add-issue-modal .dz-progress {
    display: none!important;
  }
</style>
