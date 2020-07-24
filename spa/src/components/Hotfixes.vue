<template>
	<div class="hotfixes">
		<data-tables-server class="hotfixes__table" :data="hotfixes" :total="total" @query-change="handleQueryChange" :pagination-props="{pageSizes: [15, 30, 50]}" v-loading="loading">
			<el-table-column prop="title" label="Title"></el-table-column>
			<el-table-column prop="created" label="Date" width="180">
				<template slot-scope="scope">
					{{new Date(scope.row.created).toLocaleDateString()}}
				</template>
			</el-table-column>
			<el-table-column prop="priority" label="Priority" width="180">
				<template slot-scope="scope">
					<p v-if="scope.row.priority === 1" style="color: #8cd681">Low</p>
					<p v-if="scope.row.priority === 2" style="color: #ff9752">Medium</p>
					<p v-if="scope.row.priority === 3" style="color: #ff6666">High</p>
					<p v-if="scope.row.priority === 4" style="color: #ff0000; font-weight: bold">Urgent</p>
				</template>
			</el-table-column>
			<el-table-column prop="state" label="State" width="auto">
				<template slot-scope="scope">
					<p v-if="scope.row.state === 1">New</p>
					<p v-if="scope.row.state === 2">In Progress</p>
					<p v-if="scope.row.state === 3">Done</p>
					<p v-if="scope.row.state === 4">Declined</p>
				</template>
			</el-table-column>
		</data-tables-server>
	</div>
</template>

<script>
	export default {
		name: "Hotfixes",
		computed: {
			projectId: function() {
				return this.$store.state.currentProject._id
			}
		},
		data() {
			return {
				hotfixes: [],
				total: 0,
				limit: 15,
				page: 1,
				showCompleted: false,
				loading: false
			}
		},
		mounted() {
			this.handleQueryChange();
		},
		methods: {
			handleQueryChange: async function(queryInfo) {
				if (queryInfo) {
					this.limit = queryInfo.pageSize;
					this.page = queryInfo.page;
				}
				this.loading = true;
				let fetchHotfixes = await this.$http.get(`/projects/${this.projectId}/hotfixes?limit=${this.limit}&page=${this.page}${this.showCompleted ? '&showCompleted=true' : ''}`)
				this.total = fetchHotfixes.data.total;
				this.hotfixes = fetchHotfixes.data.data;
				this.loading = false;
			}
		}
	}
</script>

<style scoped lang="scss">
	.hotfixes {
		display: flex;
		padding: 20px;

		&__table {
			width: 100%;
		}

	}
</style>