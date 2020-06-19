<template>
	<div class="board" v-loading="loading">
		<el-card class="board__column" v-for="column in columns" v-bind:key="column.id">
			<div class="board__column__header" slot="header">
				<p>{{column.name}}</p>
			</div>
			<div class="board__column__content">
				<issue-card v-for="issueId in column.issues" v-bind:key="issueId"
							v-bind:issueId="issueId"
							v-bind:projectId="projectId"
							v-bind:columnList="columnList"
							v-bind:currentColumnId="column.id"></issue-card>
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
				return this.$store.state.currentProject.columns.map(col => {
					return {
						id: col.id,
						name: col.name,
						isStarting: col.isStarting,
						isClosing: col.isClosing
					};
				});
			},
			columns: function () {
				return this.$store.state.currentProject.columns;
			}
		},
		data() {
			return {
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
					this.$store.commit('addIssue', message.issueId)
				}
			});
			this.boardSocket.on('deletedIssue', (message) => {
				if (message.projectId === this.projectId) {
					this.$store.commit('removeIssue', message.issueId)
				}
			});
			this.boardSocket.on('movedIssue', message => {
				if (message.projectId === this.projectId) {
					this.$store.commit('moveIssue', message.moveOperation)
				}
			});
			try {
				await this.$store.dispatch('syncCurrentProjectBoard');
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
				height: 40px;
				text-align: center;
				vertical-align: middle;
			}
			&__content {
				height: calc(100vh - 170px);
				overflow-y: auto;
			}
		}
	}
</style>