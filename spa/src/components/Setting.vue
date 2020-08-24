<template>
  <div class="setting" v-loading="loading">
    <div v-for="column in newColumn" :key="column.id" class="setting__column">
      <label>{{column.name}} limit</label>
      <el-input-number v-model="column.limit" :min="1"></el-input-number>
    </div>
    <el-button @click="patchLimit" type="success">Update</el-button>
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
    }
  },
  data() {
    return {
      loading: true,
      newColumn: []
    }
  },
  async mounted() {
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
  height: calc(100% - 60px);
  padding-top: 5px;
  padding-left: 70px!important;

  &__column {
    width: 100%;
    height: 80px;

    > label {
      display: block;
      margin-bottom: 3px;
      font-weight: 500;
    }

  }

}
</style>