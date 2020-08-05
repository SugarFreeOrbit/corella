<template>
	<el-card v-loading="!previewReady" class="issue">
		<div class="issue__title" @click="isMoreIssueModal = true">
			{{currentIssue.title}}
		</div>
		<div class="issue__assignee" v-if="assigneeReady">
			{{currentIssue.assignee.username}}
		</div>
		<more-issue-modal v-if="isMoreIssueModal"
						  :data="currentIssue"
						  :columnList="columnList"
						  :issueId="issueId"
						  :currentColumnId="currentColumnId"
						  :projectId="projectId"
						  @close="isMoreIssueModal = false">
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
			currentColumnId: String
		},
		components: {
			MoreIssueModal
		},
		data() {
			return {
				previewReady: false,
				assigneeReady: false,
				isMoreIssueModal: false,
				currentIssue: {
					title: '',
					description: '',
					files: [],
					assignee: {
						_id: this.issueId,
						username: ''
					}
				}
			}
		},
		async created() {
			let issue = await this.$http.get(`/projects/${this.projectId}/issues/${this.issueId}`);
			this.currentIssue.title = issue.data.title;
			this.currentIssue.description = issue.data.description;
			this.currentIssue.files = issue.data.files;
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
		},
		methods: {
			reloadIssue: async function() {
				this.previewReady = false;
				let issue = await this.$http.get(`/projects/${this.projectId}/issues/${this.issueId}`);
				this.title = issue.data.title;
				this.description = issue.data.description;
				this.color = issue.data.color;
				this.previewReady = true;
				if (issue.data.assignee) {
					this.assignee._id = issue.data.assignee;
					let assignee = await this.$http.get(`/users/${issue.data.assignee}`);
					this.assignee.username = assignee.data.username;
					this.assigneeReady = true;
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.issue {
		margin-bottom: 10px;
		&__title {
			font-weight: bold;
			&:hover {
				text-decoration: underline;
				color: #a9c737;
				cursor: pointer;
			}
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
	}
</style>