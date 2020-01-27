<template>
	<div class="board" v-loading="loading">
		<el-card class="board__column" v-for="column in columns" v-bind:key="column.name">
			<div class="board__column__header" slot="header">
				<p>{{column.name}}</p>
			</div>
			<div class="board__column__content">
				<el-card v-for="issue in column.issues" v-bind:key="issue._id" class="board__column__content__issue">
					<div></div>
				</el-card>
			</div>
		</el-card>
	</div>
</template>

<script>
	export default {
		name: "Board",
		computed: {
			projectId: function () {
				return this.$store.state.currentProject._id
			}
		},
		data() {
			return {
				columns: [
					// {
					// 	name: 'column1'
					// },
					// {
					// 	name: 'column2'
					// },
					// {
					// 	name: 'column3'
					// },
					// {
					// 	name: 'column4'
					// },
					// {
					// 	name: 'column5'
					// },
					// {
					// 	name: 'column6'
					// }
				],
				loading: false
			}
		},
		async created() {
			this.loading = true;
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
				height: 100%;
			}
		}
	}
</style>