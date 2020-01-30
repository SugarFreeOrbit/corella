<template>
	<el-card v-loading="!previewReady" class="issue">
		<div class="issue__content">
			{{title}}
		</div>
		<div class="issue__assignee" v-if="assigneeReady">
			{{assignee.username}}
		</div>
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
				assignee: {
					_id: this.issueId,
					username: ''
				},
				color: '',
				previewReady: false,
				assigneeReady: false
			}
		},
		async created() {
			let issue = await this.$http.get(`/projects/${this.projectId}/issues/${this.issueId}`);
			this.title = issue.data.title;
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
		&__content {
			font-weight: bold;
		}
		&__assignee {
			border-top: 3px solid black;
		}
	}
</style>