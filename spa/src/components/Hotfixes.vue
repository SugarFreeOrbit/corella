<template>
  <div class="hotfixes">
    <div class="hotfixes__toolbar">
      <div class="hotfixes__toolbar__searchByTitle">
        <el-input v-model="searchByTitle" @input="handleQueryChange" placeholder="Search by title"></el-input>
      </div>
      <div class="hotfixes__toolbar__showCompleted">
        <el-switch
                v-model="showCompleted"
                @change="handleQueryChange"
                active-text="Show completed"
                inactive-text="">
        </el-switch>
      </div>
      <el-button v-if="canAddHotfix" @click="isHotfixAddModal = true" icon="el-icon-plus" type="primary" class="hotfixes__toolbar__add">Add new hotfix</el-button>
    </div>
    <data-tables-server class="hotfixes__table" :data="hotfixes" :total="total" @query-change="handleQueryChange"
                        :pagination-props="{pageSizes: [15, 30, 50]}" v-loading="loading">
      <el-table-column prop="title" label="Title"></el-table-column>
      <el-table-column prop="created" label="Date" width="120">
        <template slot-scope="scope">
          {{ convertDate(scope.row.created) }}
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="Priority" width="120">
        <template slot-scope="scope">
          <span v-if="scope.row.priority === 1" style="color: #8cd681">Low</span>
          <span v-if="scope.row.priority === 2" style="color: #ff9752">Medium</span>
          <span v-if="scope.row.priority === 3" style="color: #ff6666">High</span>
          <span v-if="scope.row.priority === 4" style="color: #ff0000; font-weight: bold">Urgent</span>
        </template>
      </el-table-column>
      <el-table-column prop="state" label="State" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.state === 1">New</span>
          <span v-if="scope.row.state === 2">In Progress</span>
          <span v-if="scope.row.state === 3">Done</span>
          <span v-if="scope.row.state === 4">Declined</span>
        </template>
      </el-table-column>
      <el-table-column prop="hotfixCode" label="Code" width="80">
        <template slot-scope="scope">
          #{{scope.row.hotfixCode}}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="State" width="80">
        <template slot-scope="scope">
          <el-button @click="showMoreModal(scope.row)" class="btn-edit" type="primary" icon="el-icon-view" circle></el-button>
        </template>
      </el-table-column>
    </data-tables-server>
    <add-hotfix-modal v-if="isHotfixAddModal" :projectId="projectId" @close="closeAddHotfixModal"></add-hotfix-modal>
    <more-hotfix-modal v-if="isHotfixMoreModal" :projectId="projectId" :data="currentHotfix" @close="closeMoreModal"></more-hotfix-modal>
  </div>
</template>

<script>
  import AddHotfixModal from "./modals/AddHotfixModal";
  import MoreHotfixModal from "./modals/MoreHotfixModal";

  export default {
    name: "Hotfixes",
    components: {
      AddHotfixModal,
      MoreHotfixModal
    },
    computed: {
      projectId: function () {
        return this.$store.state.currentProject._id
      },
      canAddHotfix() {
        return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.createHotfixes;
      },
      isHotfixMoreModal: function() {
        if(this.$route.query.hotfix === undefined)
          return false;
        else if(this.currentHotfix === undefined || this.currentHotfix.hotfixCode === undefined)
          return false;
        else
          return this.$route.query.hotfix === this.currentHotfix.hotfixCode.toString();
      }
    },
    data() {
      return {
        hotfixes: [],
        total: 0,
        limit: 15,
        page: 1,
        showCompleted: false,
        loading: false,
        searchByTitle: '',
        isHotfixAddModal: false,
        currentHotfix: {}
      }
    },
    async mounted() {
      await this.handleQueryChange();
      if(this.$route.query.hotfix !== undefined) {
        this.currentHotfix = this.hotfixes.find(hotfix => hotfix.hotfixCode.toString() === this.$route.query.hotfix);
      }
    },
    methods: {
      handleQueryChange: async function (queryInfo) {
        if (queryInfo) {
          this.limit = queryInfo.pageSize || this.limit;
          this.page = queryInfo.page || this.page;
        }
        this.loading = true;
        let fetchHotfixes = await this.$http.get(`/projects/${this.projectId}/hotfixes?limit=${this.limit}&page=${this.page}${this.showCompleted ? '&showCompleted=true' : ''}${this.searchByTitle !== '' ? `&findByTitle=${this.searchByTitle}` : ''}`);
        this.total = fetchHotfixes.data.total;
        this.hotfixes = fetchHotfixes.data.data;
        this.loading = false;
      },
      convertDate: function (timestamp) {
        let date = new Date(timestamp);
        return date.toLocaleDateString();
      },
      closeAddHotfixModal: function () {
        this.isHotfixAddModal = false;
        this.handleQueryChange();
      },
      showMoreModal: function (data) {
        this.currentHotfix = data;
        this.$router.push({query: { hotfix: this.currentHotfix.hotfixCode.toString() }});
      },
      closeMoreModal: function (event) {
        if(event === 'DELETE') {
          for(let i = 0; i < this.hotfixes.length; ++i) {
            if(this.hotfixes[i]._id === this.currentHotfix._id) {
              this.hotfixes.splice(i, 1);
              break;
            }
          }
        }
        this.$router.push({query: { hotfix: undefined }});
      }
    }
  }
</script>

<style scoped lang="scss">
  .btn-edit {
    border-radius: 5px!important;
  }
.hotfixes {
  display: flex;
  padding: 20px;
  flex-wrap: wrap;

  &__table {
    width: 100%;
  }

  &__toolbar {
    width: 100%;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    &__showCompleted {
      margin-top: -4px;
      padding-left: 20px;
      padding-right: 20px;
    }
    &__searchByTitle {
      justify-self: end;
    }
    &__add {
      margin-left: auto;
    }
  }

}
</style>