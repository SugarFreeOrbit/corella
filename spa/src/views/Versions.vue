<template>
  <div class="versions" v-loading="loading">
    <div class="versions__content">
      <el-button @click="visibleAddVersionModal = true" icon="el-icon-plus" type="primary">
        Create new version
      </el-button>
      <div class="versions__list">
        <version-card v-for="version in versions" :key="version._id"
                      :card-data="version"
                      @deleteEvent="openDeleteDialog"
                      @editVersion="openEditVersionModal">
        </version-card>
      </div>
    </div>

    <el-dialog
        title="Delete version"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        width="30%">
      <span>Are you sure you want to delete this version?</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="deleteVersion">Confirm</el-button>
      </span>
    </el-dialog>

    <add-version-modal v-if="visibleAddVersionModal"
                       :project-id="currentProject._id"
                       @close="visibleAddVersionModal = false"
                       @addVersion="getVersions" />

    <edit-version-modal v-if="visibleEditVersionModal"
                        :project-id="currentProject._id"
                        :version="editVersionData"
                        @close="closeEditModal"
                        @updateVersion="getVersions" />

  </div>
</template>

<script>
import VersionCard from "@/components/VersionCard";
import AddVersionModal from "@/components/modals/AddVersionModal";
import EditVersionModal from "@/components/modals/EditVersionModal";

export default {
  name: "versions",
  components: {EditVersionModal, AddVersionModal, VersionCard},
  data() {
    return {
      loading: false,
      visibleAddVersionModal: false,
      visibleEditVersionModal: false,
      dialogVisible: false,
      deleteVersionId: '',
      editVersionData: null,
      versions: [],
      test: 0
    }
  },
  computed: {
    currentProject() {
      return this.$store.state.currentProject;
    }
  },
  mounted() {
    this.getVersions()
  },
  methods: {
    async getVersions() {
      try {
        this.loading = true;
        const response = await this.$http.get(`/projects/${this.currentProject._id}/versions`);
        this.versions = response.data;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
    openDeleteDialog(versionId) {
      this.deleteVersionId = versionId;
      this.dialogVisible = true;
    },
    openEditVersionModal(versionId) {
      this.editVersionData = this.versions.find(item => item._id === versionId);
      this.visibleEditVersionModal = true;
    },
    closeEditModal(isEdited) {
      this.visibleEditVersionModal = false;
      this.editVersionData = null;
      if (isEdited) this.versions.splice(0);
    },
    async deleteVersion() {
      try {
        this.loading = true;
        this.dialogVisible = false;
        await this.$http.delete(`/projects/${this.currentProject._id}/versions/${this.deleteVersionId}`);

        this.versions.splice(this.versions.findIndex(item => item._id === this.deleteVersionId));

        this.$notify({
          title: 'Success',
          message: 'Version removed successfully',
          type: 'success'
        });
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped lang="scss">
.versions {
  height: calc(100vh - 52px);

  &__content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-top: 10px;
  }

  &__list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
  }
}

.version-card {
  margin: 30px;
}
</style>
