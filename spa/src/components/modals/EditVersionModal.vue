<template>
  <el-dialog class="edit-version-modal" :visible="true" title="Edit version" @close="close"
             :close-on-click-modal="false">
    <el-form v-model="version" v-loading="loading">
      <el-form-item label="Title">
        <el-input required v-model="versionTmp.version"></el-input>
      </el-form-item>
      <el-form-item label="Description">
        <el-input type="textarea" v-model="versionTmp.description" :rows="5"></el-input>
      </el-form-item>
      <el-form-item class="edit-version-modal__date" label="Date of release">
        <el-date-picker
            v-model="date"
            type="date"
            placeholder="Select date">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="updateVersion">Update</el-button>
        <el-button @click="close">Cancel</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  name: "edit-version-modal",
  props: {
    projectId: {
      type: String
    },
    version: {
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      date: null,
      versionTmp: null
    }
  },
  mounted() {
    if (this.version.dateOfRelease) this.date = new Date(this.version.dateOfRelease)
  },
  created() {
    this.versionTmp = {...this.version}
  },
  methods: {
    async updateVersion() {
      try {
        this.loading = true;

        const requestData = {
          version: this.versionTmp.version,
          description: this.versionTmp.description
        }
        if (this.date) requestData.dateOfRelease = this.date.getTime()
        else requestData.dateOfRelease = 0

        await this.$http.patch(`/projects/${this.projectId}/versions/${this.version._id}`, requestData)

        this.$notify({
          title: 'Success',
          message: 'Version updated successfully',
          type: 'success'
        })

        this.$emit('close', true)
        this.$emit('updateVersion')

      } catch (e) {
        this.$notify({
          title: 'Error',
          message: e.response.data || 'Something went wrong',
          type: 'error'
        })

        this.close()

      } finally {
        this.loading = false;
      }
    },
    close() {
      this.$emit('close', false)
    },
  }
}
</script>

<style scoped lang="scss">
.edit-version-modal {
  &__date {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px !important;
  }
}
</style>