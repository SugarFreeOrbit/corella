<template>
  <div class="setting" v-loading="loading">
    <h2>Editing column limit</h2>
    <div class="setting__form">
      <div v-for="column in newColumn" :key="column.id" class="setting__form__column">
        <label>{{column.name}} limit</label>
        <el-input-number v-model="column.limit" :min="1" :max="1000"></el-input-number>
      </div>
    </div>
    <el-button @click="patchLimit" type="primary">Update</el-button>
  </div>
</template>

<script>
import IssueCard from "./IssueCard";
import draggable from 'vuedraggable';

export default {
  name: "setting",
  components: {
    IssueCard,
    draggable
  },
  computed: {
    projectId: function () {
      return this.$store.state.currentProject._id
    },
    columnList: function () {
      return this.$store.state.currentProject.columns.map(col => {
        return {
          id: col.id,
          name: col.name,
          isStarting: col.isStarting,
          isClosing: col.isClosing,
        };
      });
    },
    columns: function () {
      return this.$store.state.currentProject.columns;
    },
    canEditIssues: function () {
      return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isEditor;
    },
  },
  data() {
    return {
      loading: true,
      newColumn: []
    }
  },
  async mounted() {
    if(!this.canEditIssues)
      this.$router.push('/not-found');
    if(this.columns === undefined)
      await this.$store.dispatch('syncCurrentProjectBoard');
    this.newColumn = this.columns;
    this.loading = false;
  },
  methods: {
    patchLimit: async function () {
      try {
        let reqCount = 0;
        let requests = [];
        this.newColumn.forEach(item => {
          requests.push(this.$http.patch(`/projects/${this.projectId}/${item.id}/limit`, { limit: item.limit }).catch(e => {
            --reqCount;
            if(e.response.status === 400) {
              let maxLimit = e.response.data.match(/\s+(\S+)$/)[1];
              this.$notify.error({
                title: 'Error',
                message: `${item.name} column was not updated. Exceeded limit ${maxLimit}`
              });
            }
          }));
        });
        reqCount = requests.length;
        await Promise.all(requests);
        if(reqCount < requests.length) {
          this.$notify({
            title: 'Warning',
            message: `${reqCount} of ${requests.length} columns were updated`,
            type: 'warning'
          });
        } else {
          this.$notify({
            title: 'Success',
            message: 'All columns were updated successfully',
            type: 'success'
          });
        }
        this.$store.dispatch('syncCurrentProjectBoard');
      } catch (e) {
        console.log(e);
      }
    }
  }
}
</script>

<style scoped lang="scss">
.setting {
  padding-top: 15px;
  padding-left: 70px!important;
  height: calc(100% - 60px);

  > h2 {
    font-weight: 700;
  }

  &__form {
    display: flex;

    &__column {
      width: 200px;
      height: 80px;

      > label {
        display: block;
        margin-bottom: 3px;
        font-weight: 500;
      }

    }
  }

}
</style>