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
			<div class="issue__content" v-else v-loading="modalLoading">
				<el-form>
					<el-form-item label="Title">
						<el-input v-model="title"></el-input>
					</el-form-item>
					<hr>
					<el-form-item label="Description">
						<el-input type="textarea" :rows="6" v-model="description"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button @click="issueModalVisible = false">Cancel</el-button>
						<el-button type="primary">Update</el-button>
						<el-button type="danger" @click="deleteIssue">Delete</el-button>
					</el-form-item>
				</el-form>
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
				issueModalVisible: false,
				modalLoading: false
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
		},
		methods: {
			deleteIssue: async function() {
				await this.$confirm('This will permanently delete this issue. Continue?', 'Warning', {
					confirmButtonText: 'Confirm',
					cancelButtonText: 'Cancel',
					type: "warning"
				});
				this.modalLoading = true;
				await this.$http.delete(`/projects/${this.projectId}/issues/${this.issueId}`);
				this.modalLoading = false;
				this.issueModalVisible = false;
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