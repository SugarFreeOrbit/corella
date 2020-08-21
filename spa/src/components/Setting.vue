<template>
  <div class="setting">
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
    canCreateIssues: function () {
      return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isCreator;
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
      newColumn: []
    }
  },
  mounted() {
    this.newColumn = this.columns;
  },
  methods: {
    patchLimit: async function () {
      try {
        let requests = [];
        this.newColumn.forEach(item => {
          requests.push(this.$http.patch(`/${this.projectId}/${item.id}/limit`));
        });
        let responses = await Promise.all(requests);
        console.log(responses);
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