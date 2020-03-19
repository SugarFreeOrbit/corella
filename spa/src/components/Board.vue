<template>
	<div class="board" v-loading="loading">
		<el-card class="board__column" v-for="column in columns" v-bind:key="column.name">
			<div class="board__column__header" slot="header">
				<p>{{column.name}} <el-button circle type="primary"
											  icon="el-icon-plus"
											  size="mini"
											  v-if="column.isStarting && canCreateIssues"
											  @click="issueCreationModal.active = true"></el-button></p>
			</div>
			<div class="board__column__content">
				<issue-card v-for="issueId in column.issues" v-bind:key="issueId" v-bind:issueId="issueId" v-bind:projectId="projectId" v-bind:columnList="columnList"></issue-card>
			</div>
		</el-card>
	</div>
</template>

<script>
	import IssueCard from "./IssueCard";
	export default {
		name: "Board",
		components: {IssueCard},
		computed: {
			projectId: function () {
				return this.$store.state.currentProject._id
			},
			canCreateIssues: function () {
				return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isCreator;
			},
			columnList: function () {
				return this.columns.map(col => {
					return {
						id: col.id,
						name: col.name,
						isStarting: col.isStarting,
						isClosing: col.isClosing
					};
				});
			}
		},
		data() {
			return {
				columns: [],
				loading: false,
				issueCreationModal: {
					active: false,
					title: '',
					description: '',
					inProgress: false
				},
				boardSocket: {}
			}
		},
		async created() {
			this.loading = true;
			this.boardSocket = this.$store.state.socket;
			this.boardSocket.on('newIssue', (message) => {
				if (message.projectId === this.projectId) {
					let startingColumn = this.columns.findIndex(col => col.isStarting);
					this.columns[startingColumn].issues.push(message.issueId);
				}
			});
			this.boardSocket.on('deletedIssue', (message) => {
				if (message.projectId === this.projectId) {
					for (let i = 0; i < this.columns.length; i++) {
						this.columns[i].issues = this.columns[i].issues.filter(issue => issue !== message.issueId)
					}
				}
			});
			try {
				let getColumns = await this.$http.get(`/projects/${this.$store.state.currentProject._id}/columns`);
				this.columns = getColumns.data.columns;
				this.loading = false;
			} catch (e) {
				this.loading = false;
				console.log(e);
			}
		}
	}
</script>

<style scoped lang="scss">
	.board {
		display: flex;
		flex-wrap: nowrap;
		justify-content: center;
		align-content: stretch;
		height: calc(100% - 60px);
		padding-top: 5px;
		&__column {
			width: 300px;
			margin-left: 10px;
			height: 100%;
			&__header {
				color: black;
				font-weight: bold;
				text-align: center;
				vertical-align: middle;
			}
			&__content {
				height: 800px;
				overflow-y: auto;
			}
		}
	}
</style>