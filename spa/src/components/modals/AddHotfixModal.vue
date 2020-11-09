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
      <el-form-item class="add-hotfix-modal__versions" label="Version">
        <el-select clearable v-model="selectedVersion" placeholder="Versions">
          <el-option
              v-for="item in versions"
              :key="item._id"
              :label="item.description"
              :value="item._id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <file-upload-local v-model="newHotfix.files"></file-upload-local>
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
  name: "add-hotfix-modal",
  props: {
    projectId: {
      type: String
    },
    versions: {
      type: Array
    }
  },
  components: {
    FileUploadLocal
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
      },
      selectedVersion: ''
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

      if (this.newHotfix.title !== '') {
        formData.append('title', this.newHotfix.title);
      } else {
        this.$notify.error({
          title: 'Error',
          message: 'Title must not be empty'
        });
        this.loading = false;
        return;
      }

      if (this.newHotfix.description) formData.append('description', this.newHotfix.description);
      if (this.selectedVersion) formData.append('versionId', this.selectedVersion)
      formData.append('branch', this.newHotfix.branch);
      formData.append('priority', this.newHotfix.priority);

      this.newHotfix.files.forEach((file, i) => {
        formData.append('files', file);
      });
      try {
        let result = await this.$http.put(`/projects/${this.projectId}/hotfixes`,
            formData,
            {
              headers: {'Content-Type': 'multipart/form-data'}
            });
        this.loading = false;
        this.close();
        this.newHotfix.title = '';
        this.newHotfix.description = '';
      } catch (e) {
        if (e.response.status === 400) {
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
    close: function () {
      this.$emit('close');
    }
  }
}
</script>

<style scoped lang="scss">
.add-hotfix-modal {
  &__versions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
.add-hotfix-modal .dz-progress {
  display: none !important;
}
</style>