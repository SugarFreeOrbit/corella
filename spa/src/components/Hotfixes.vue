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
      <el-button v-if="canAddHotfix" @click="isHotfixAddModal = true" icon="el-icon-plus" type="primary"
                 class="hotfixes__toolbar__add">Add new hotfix
      </el-button>
    </div>
    <data-tables-server class="hotfixes__table" :data="hotfixes" :total="total" @query-change="handleQueryChange"
                        :pagination-props="{pageSizes: [15, 30, 50]}" v-loading="loading">
      <el-table-column prop="title" label="Title">
        <template slot-scope="scope">
          <span class="hotfixes__title" @click="showMoreModal(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="created" label="Date" width="120">
        <template slot-scope="scope">
          {{ convertDate(scope.row.created) }}
        </template>
      </el-table-column>
      <el-table-column label="Version" width="120">
        <template slot-scope="scope">
          {{ getVersionName(scope.row.versionId) }}
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
          #{{ scope.row.hotfixCode }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="80">
        <template slot-scope="scope">
          <el-button @click="showMoreModal(scope.row)" class="btn-edit" type="primary" icon="el-icon-view"
                     circle></el-button>
        </template>
      </el-table-column>
    </data-tables-server>

    <add-hotfix-modal v-if="isHotfixAddModal"
                      :projectId="projectId"
                      :versions="versions"
                      @close="closeAddHotfixModal">
    </add-hotfix-modal>

    <more-hotfix-modal v-if="isHotfixMoreModal"
                       :projectId="projectId"
                       :data="currentHotfix"
                       :versions="versions"
                       @close="closeMoreModal">
    </more-hotfix-modal>
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
      return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.createHotfixes;
    },
    isHotfixMoreModal: function () {
      if (this.$route.query.hotfix === undefined)
        return false;
      else if (this.currentHotfix === undefined || this.currentHotfix.hotfixCode === undefined)
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
      currentHotfix: {},
      socketHotfix: {},
      versions: []
    }
  },
  async created() {
    this.socketHotfix = this.$store.state.socketHotfix;
    this.socketHotfix.on('newHotfix', (message) => {
      if (message.projectId === this.projectId) {
        this.handleQueryChange();
      }
    });
    this.socketHotfix.on('deletedHotfix', (message) => {
      if (message.projectId === this.projectId) {
        this.handleQueryChange();
      }
    });
    this.socketHotfix.on('updatedHotfix', message => {
      if (message.projectId === this.projectId) {
        this.handleQueryChange();
      }
    });
    try {
      await this.handleQueryChange();
      this.versions = await this.getVersions()
      if (this.$route.query.hotfix !== undefined) {
        let response = await this.$http(`/projects/${this.projectId}/hotfixes?hotfixCode=${this.$route.query.hotfix}`);
        this.currentHotfix = response.data;
      }
    } catch (e) {
      console.log(e);
    }
  },
  beforeDestroy() {
    this.socketHotfix.off('newHotfix');
    this.socketHotfix.off('updatedHotfix');
    this.socketHotfix.off('deletedHotfix');
  },
  mounted() {
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
      if (this.total === 0)
        document.getElementsByClassName('el-pagination')[0].style.display = 'none';
      else
        document.getElementsByClassName('el-pagination')[0].style.display = 'block';
      this.hotfixes = fetchHotfixes.data.data;
      this.loading = false;
    },
    getVersions: async function () {
      try {
        const response = await this.$http.get('projects/' + this.projectId + '/issue-version')
        return response.data

      } catch (e) {
        console.log(e)
      }
    },
    getVersionName(versionId) {
      const version = this.versions.find(version => version._id === versionId)

      if(version) return version.version
      else return '-'
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
      this.$router.push({query: {hotfix: this.currentHotfix.hotfixCode.toString()}});
    },
    closeMoreModal: function (event) {
      if (event === 'DELETE' && !this.showCompleted) {
        for (let i = 0; i < this.hotfixes.length; ++i) {
          if (this.hotfixes[i]._id === this.currentHotfix._id) {
            this.hotfixes.splice(i, 1);
            break;
          }
        }
      }
      this.$router.push({query: {hotfix: undefined}});
    }
  }
}
</script>

<style scoped lang="scss">
.btn-edit {
  border-radius: 5px !important;
}

.hotfixes {
  //display: flex;
  padding: 20px;
  //flex-wrap: wrap;
  height: calc(100vh - 52px);
  overflow-y: scroll;

  &__title {
    &:hover {
      cursor: pointer;
    }
  }

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
