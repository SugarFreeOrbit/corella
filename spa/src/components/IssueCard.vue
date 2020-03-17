<template>
	<el-card v-loading="!previewReady" class="issue">
		<div class="issue__title" @click="issueModalVisible = true">
			{{title}}
		</div>
		<div class="issue__assignee" v-if="assigneeReady">
			{{assignee.username}}
		</div>
		<el-dialog :visible.sync="issueModalVisible">
			<div v-if="!canEditIssues" class="issue__content">
				<p class="issue__content__title">{{title}}</p>
				<hr>
				<p class="issue__content_description">{{description}}</p>
			</div>
		</el-dialog>
	</el-card>
</template>

<script>
	export default {
		name: "IssueCard",
		props: {
			issueId: String,
			projectId: String
		},
		data() {
			return {
				title: '',
				description: '',
				assignee: {
					_id: this.issueId,
					username: ''
				},
				color: '',
				previewReady: false,
				assigneeReady: false,
				issueModalVisible: false
			}
		},
		computed: {
			canEditIssues: function () {
				return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isEditor;
			},
			canDeleteIssues: function () {
				return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isDestroyer;
			}
		},
		async created() {
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
		}
	}
</style>