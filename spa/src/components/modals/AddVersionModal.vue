<template>
  <el-dialog class="add-version-modal" :visible="true" title="New version" @close="close" :close-on-click-modal="false">
    <el-form v-on:submit.native.prevent="createVersion" v-model="version"
             v-loading="loading">
      <el-form-item label="Title">
        <el-input required v-model="version.name"></el-input>
      </el-form-item>
      <el-form-item label="Description">
        <el-input type="textarea" v-model="version.description" :rows="5"></el-input>
      </el-form-item>
      <el-form-item class="add-version-modal__date" label="Date of release">
        <el-date-picker
            v-model="version.date"
            type="date"
            placeholder="Select date">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createVersion">Create</el-button>
        <el-button @click="close">Cancel</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  name: "add-version-modal",
  props: {
    projectId: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      version: {
        name: '',
        description: '',
        date: null
      }
    }
  },
  methods: {
    async createVersion() {
      if (!this.version.name || !this.version.description) {
        this.$notify({
          title: 'Error',
          message: 'Not all fields are filled',
          type: 'error'
        })

        return;
      }

      try {
        this.loading = true

        const data = {
          version: this.version.name,
          description: this.version.description
        }
        if (this.version.date) data.dateOfRelease = this.version.date.getTime()

        await this.$http.put('/projects/' + this.projectId + '/versions', data)

        this.$notify({
          title: 'Success',
          message: 'Version added successfully',
          type: 'success'
        })

        this.$emit('addVersion')
        this.close()

      } catch (e) {
        this.$notify({
          title: 'Error',
          message: e.response.data || 'Something went wrong',
          type: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.add-version-modal {
  &__date {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px !important;
  }
}
</style>