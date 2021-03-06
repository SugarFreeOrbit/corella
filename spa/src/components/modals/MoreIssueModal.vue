<template>
  <el-dialog :visible.sync="issueModalVisible" :before-close="close" :title="`Issue #${currentIssue.issueCode}`">
    <div v-if="!canEditIssues" class="issue__content" v-loading="modalLoading">
      <p class="issue__content__title">{{ currentIssue.title }}</p>
      <hr>
      <p class="issue__content_description">{{ currentIssue.description }}</p>
      <div class="issue__content_images">
        <app-file v-for="file in currentIssue.files"
                  :url="`/projects/${projectId}/issues/${issueId}/attachment/${file._id}`"
                  :file="file"
                  :width="100"
                  :height="100">
        </app-file>
      </div>
      <div class="issue__content__control">
        <el-button type="danger" @click="deleteIssue" v-if="canDeleteIssues">Delete</el-button>
        <el-select v-model="targetColumn" placeholder="Move this issue to..." class="issue__content__control__move"
                   @change="moveIssue">
          <el-option v-for="col in availableTransitions"
                     :key="col.id"
                     :label="col.name"
                     :value="col.id">
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="issue__content" v-else v-loading="modalLoading">
      <el-form>
        <el-form-item label="Title">
          <el-input v-model="currentIssue.title"></el-input>
        </el-form-item>
        <!--<hr>-->
        <el-form-item label="Description">
          <el-input type="textarea" :rows="6" v-model="currentIssue.description"></el-input>
        </el-form-item>
        <el-form-item class="issue__versions" label="Version">
          <el-select clearable v-model="selectedVersion" placeholder="Versions">
            <el-option
                v-for="item in versions"
                :key="item._id"
                :label="item.version"
                :value="item._id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="file-upload-wrapper">
          <file-upload :link="`/projects/${projectId}/issues/${issueId}/attachment/`"
                       :files="files"
                       :attachLink="`/projects/${this.projectId}/issues/${issueId}/attach`"
                       :detachLink="`/projects/${this.projectId}/issues/${issueId}/detach/`">
          </file-upload>
        </el-form-item>
        <el-form-item class="issue__content__control">
          <el-button @click="close">Cancel</el-button>
          <el-button type="primary" @click="updateIssue">Update</el-button>
          <el-select v-model="targetColumn" placeholder="Move this issue to..." class="issue__content__control__move"
                     @change="moveIssue">
            <el-option v-for="col in availableTransitions"
                       :key="col.id"
                       :label="col.name"
                       :value="col.id">
            </el-option>
          </el-select>
          <el-button type="danger" @click="deleteIssue" v-if="canDeleteIssues">Delete</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>

<script>
import AppFile from "../AppFile";
import FileUpload from "@/components/FileUpload";

export default {
  name: "more-issue-modal",
  props: {
    data: {
      type: Object
    },
    columnList: {
      type: Array
    },
    issueId: {
      type: String
    },
    currentColumnId: {
      type: String
    },
    projectId: {
      type: String
    },
  },
  components: {
    AppFile,
    FileUpload
  },
  data() {
    return {
      issueModalVisible: true,
      modalLoading: false,
      targetColumn: '',
      currentIssue: {},
      files: [],
      boardSocket: {},
      selectedVersion: ''
    }
  },
  created() {
    this.currentIssue = {...this.data};
    this.files = this.data.files;
    this.files.forEach(file => {
      if (file.name === undefined)
        file.name = file.filename;
    });
    this.boardSocket = this.$store.state.socket;
    this.boardSocket.on('updatedIssue', (message) => {
      if (message.projectId === this.projectId) {
        if (message.issueId === this.issueId) {
          this.reloadIssue();
        }
      }
    });
    this.boardSocket.on('deletedIssue', (message) => {
      if (message.projectId === this.projectId) {
        if (message.issueId === this.issueId) {
          this.close();
        }
      }
    });
    this.boardSocket.on('movedIssue', message => {
      if (message.issueId === this.issueId) {
        this.reloadIssue();
      }
    });
  },
  mounted() {
    if (this.data.versionId) {
      const version = this.versions.find(version => version._id === this.data.versionId)
      if (version) this.selectedVersion = version._id
    }
  },
  computed: {
    canEditIssues: function () {
      return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isEditor;
    },
    canDeleteIssues: function () {
      return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isDestroyer;
    },
    availableTransitions: function () {
      if (this.$store.state.user.isAdmin) {
        return this.columnList
      } else {
        let allowedCols = this.$store.state.currentProject.role.issueTransitionMatrix[this.currentColumnId];
        return allowedCols ? this.columnList.filter(col => allowedCols.includes(col.id)) : null;
      }
    },
    versions: function () {
      return this.$store.state.versions
    }
  },
  methods: {
    reloadIssue: async function () {
      this.modalLoading = true;
      try {
        this.previewReady = false;
        let issue = await this.$http.get(`/projects/${this.projectId}/issues/${this.issueId}`);
        this.currentIssue.title = issue.data.title;
        this.currentIssue.description = issue.data.description;
        this.currentIssue.files = issue.data.files;
        this.files = issue.data.files;
        //this.currentIssue.color = issue.data.color;
        this.previewReady = true;
        if (issue.data.assignee) {
          this.currentIssue.assignee_id = issue.data.assignee;
          let assignee = await this.$http.get(`/users/${issue.data.assignee}`);
          this.currentIssue.assignee.username = assignee.data.username;
          this.assigneeReady = true;
        }
        this.modalLoading = false;
      } catch (e) {
        console.log(e);
        this.modalLoading = false;
      }
    },
    deleteIssue: async function () {
      await this.$confirm('This will permanently delete this issue. Continue?', 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: "warning"
      });
      this.modalLoading = true;
      await this.$http.delete(`/projects/${this.projectId}/issues/${this.issueId}`);
      this.$store.commit('removeIssue', this.issueId);
      this.modalLoading = false;
      this.close();
    },
    updateIssue: async function () {
      this.modalLoading = true;
      const requestData = {
        title: this.currentIssue.title,
        description: this.currentIssue.description,
        assignee: this.currentIssue.assignee._id
      }
      if (this.selectedVersion) requestData.versionId = this.selectedVersion

      await this.$http.patch(`/projects/${this.projectId}/issues/${this.issueId}`, requestData);
      this.data.title = this.currentIssue.title;
      this.data.description = this.currentIssue.description;
      this.modalLoading = false;
      this.close();
    },
    moveIssue: async function (targetColumn) {
      this.modalLoading = true;
      let payload = {
        issueId: this.issueId,
        targetColumn: targetColumn,
        targetPosition: 0,
        originalColumn: this.currentColumnId
      };
      this.$store.commit('moveIssue', payload);
      this.modalLoading = false;
      this.close();
      try {
        let backendMove = await this.$http.post(`/projects/${this.projectId}/issues/move`, payload);
      } catch (e) {
        this.$store.commit('moveIssue', {
          issueId: payload.issueId,
          targetColumn: payload.originalColumn,
          targetPosition: 0,
          originalColumn: payload.targetColumn
        });
      }
    },
    close: function () {
      this.$emit('close');
    },
    chooseFiles: function () {
      document.getElementById("uploadFiles").click()
    },
    async handleFilesUpload() {
      let files = this.$refs.files.files;
      if (this.files.length >= 3) {
        this.$notify({
          title: 'Error',
          message: 'Too many files',
          duration: 3000,
          type: 'error'
        });
        return;
      }
      this.currentIssue.files.push(...files);
      let formData = new FormData();
      formData.append('files', files[files.length - 1]);
      let response = await this.$http.post(`/projects/${this.projectId}/issues/${this.issueId}/attach`, formData);
      this.currentIssue.files[this.currentIssue.files.length - 1]._id = response.data[0];
      this.files[this.files.length - 1]._id = response.data[0];
    },
    removeFile: async function (file, i) {
      if (i > -1) {
        await this.$http.delete(`/projects/${this.projectId}/issues/${this.issueId}/detach/${this.files[i]._id}`);
        this.files.splice(i, 1);
      }
    },
  }
}
</script>

<style scoped lang="scss">
.issue__versions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
}

.issue__content_images {
  display: flex;
  flex-wrap: wrap;
}

.issue__content__control__move {
  margin-left: 10px;
  margin-right: 10px;
}

.file-upload-wrapper {
  height: 150px;
  margin-top: 10px;
}
</style>