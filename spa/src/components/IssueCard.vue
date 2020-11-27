<template>
  <el-card v-loading="!previewReady" class="issue">
    <div class="issue__title" @click="showMoreModal">
      <div v-if="currentIssue.version" class="issue__version">{{ currentIssue.version }}</div>
      <div>
        <span>{{ currentIssue.title }}</span>
        <i class="issue__code">#{{ currentIssue.issueCode }}</i>
      </div>
    </div>
    <div class="issue__assignee" v-if="assigneeReady">
      {{ currentIssue.assignee.username }}
    </div>
    <more-issue-modal v-if="isMoreIssueModal"
                      :data="currentIssue"
                      :columnList="columnList"
                      :issueId="issueId"
                      :currentColumnId="currentColumnId"
                      :projectId="projectId"
                      :currentVerion="currentIssue.versionId"
                      @close="closeMoreModal">
    </more-issue-modal>
  </el-card>
</template>

<script>
import MoreIssueModal from "./modals/MoreIssueModal";

export default {
  name: "IssueCard",
  props: {
    issueId: String,
    projectId: String,
    columnList: Array,
    currentColumnId: String,
  },
  components: {
    MoreIssueModal
  },
  data() {
    return {
      previewReady: false,
      assigneeReady: false,
      currentIssue: {
        title: '',
        description: '',
        issueCode: '',
        versionId: '',
        version: '',
        files: [],
        assignee: {
          _id: this.issueId,
          username: ''
        }
      },
    }
  },
  computed: {
    isMoreIssueModal() {
      return this.$route.query.issue === this.currentIssue.issueCode.toString();
    },
    versions() {
      return this.$store.state.versions
    }
  },
  async mounted() {
    let issue = await this.$http.get(`/projects/${this.projectId}/issues/${this.issueId}`);
    this.currentIssue.title = issue.data.title;
    this.currentIssue.description = issue.data.description;
    this.currentIssue.versionId = issue.data.versionId
    this.currentIssue.files = issue.data.files;
    this.currentIssue.issueCode = issue.data.issueCode;
    this.previewReady = true;

    if (issue.data.assignee) {
      this.currentIssue.assignee_id = issue.data.assignee;
      let assignee = await this.$http.get(`/users/${issue.data.assignee}`);
      this.currentIssue.assignee.username = assignee.data.username;
      this.assigneeReady = true;
    }
    this.issueSocket = this.$store.state.socket;
    this.issueSocket.on('updatedIssue', message => {
      if (message.projectId === this.projectId && message.issueId === this.issueId) {
        this.reloadIssue();
      }
    });

    if (this.currentIssue.versionId) {
      const version = this.versions.find(version => version._id === this.currentIssue.versionId)
      if (version) this.currentIssue.version = version.version
    }
  },
  methods: {
    reloadIssue: async function () {
      this.previewReady = false;
      let issue = await this.$http.get(`/projects/${this.projectId}/issues/${this.issueId}`);
      this.currentIssue.title = issue.data.title;
      this.currentIssue.description = issue.data.description;
      this.currentIssue.files = issue.data.files;
      this.currentIssue.versionId = issue.data.versionId
      //this.currentIssue.color = issue.data.color;
      this.previewReady = true;
      if (issue.data.assignee) {
        this.currentIssue.assignee_id = issue.data.assignee;
        let assignee = await this.$http.get(`/users/${issue.data.assignee}`);
        this.currentIssue.assignee.username = assignee.data.username;
        this.assigneeReady = true;
      }

      this.currentIssue.version = ''
      if (this.currentIssue.versionId) {
        const version = this.versions.find(version => version._id === this.currentIssue.versionId)
        if (version) this.currentIssue.version = version.version
      }
    },
    showMoreModal: function () {
      this.$router.push({query: {issue: this.currentIssue.issueCode.toString()}});
    },
    closeMoreModal: function () {
      this.$router.push({query: {issue: undefined}});
    }
  }
}
</script>

<style scoped lang="scss">
.issue {
  position: relative;
  margin: 10px;

  &:hover {
    cursor: pointer;
  }

  &__title {
    font-weight: bold;
    transition: 0.3s;
    display: flex;
    flex-direction: column;

    > div:last-child {
      display: flex;

      &:hover {
        color: #a9c737;
        cursor: pointer;

        > span {
          color: #a9c737;
        }
      }

      > span {
        display: inline-block;
        transition: 0.3s;
        margin-right: 5px;
        max-width: 180px;
        word-wrap: break-word;
      }
    }

  }

  &__version {
    margin-bottom: 5px;
    font-size: 10px;
    text-align: right;
  }

  &__assignee {
    border-top: 3px solid black;
  }

  &__content {
    &__title {
      font-weight: bold;
      text-align: center;
      font-size: larger;
    }

    &__control {
      &__move {
        margin-left: 10px;
        margin-right: 10px;
      }
    }
  }

  &__code {
    margin-left: auto;
    display: inline-block;
    color: #797979;
  }
}
</style>