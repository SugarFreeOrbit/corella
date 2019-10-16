<template>
	<div>
		<navbar></navbar>
		<div class="userManagement container" v-loading="loading">
			<data-tables-server :data="users" :total="total" @query-change="handleQueryChange" :pagination-props="{ pageSizes: [10, 15, 20] }">
				<el-table-column prop="username" label="Username"></el-table-column>
				<el-table-column prop="email" label="E-mail"></el-table-column>
				<el-table-column prop="isAdmin" label="Admin" width="auto" custom>
					<template slot-scope="props">
						<el-switch v-model="props.row.isAdmin" @change="changeRole(props.row._id, props.row.isAdmin)"/>
					</template>
				</el-table-column>
				<el-table-column label="Actions" custom width="auto">
					<template slot-scope="props">
						<el-button type="danger" icon="el-icon-delete" @click="deleteUser(props.row._id)" circle></el-button>
					</template>
				</el-table-column>
			</data-tables-server>
		</div>
	</div>
</template>

<script>
	import Navbar from "../components/Navbar";
	export default {
		name: "UserManagement",
		components: {Navbar},
		data() {
			return {
				users: [],
				page: 1,
				limit: 10,
				total: 0,
				pageCount: 0,
				loading: false
			}
		},
		methods: {
			loadUsers: async function(){
				this.loading = true;
				let res = await this.$http.get(`/users?limit=${this.limit}&page=${this.page}`);
				this.users = res.data.data;
				this.total = res.data.total;
				this.pageCount = res.data.pageCount;
				this.loading = false;
			},
			handleQueryChange: function(queryInfo) {
				this.limit = queryInfo.pageSize;
				this.page = queryInfo.page;
				this.loadUsers();
			},
			changeRole: async function (userId, isAdmin) {
				await this.$http.patch(`/users/${userId}`, {isAdmin});
			},
			deleteUser: async function(userId) {
				await this.$confirm('This will permanently delete the user. Continue?', 'Warning', {
					confirmButtonText: 'OK',
					cancelButtonText: 'Cancel',
					type: "warning"
				});
				this.loading = true;
				try {
					await this.$http.delete(`/users/${userId}`);
					await this.loadUsers();
				} catch (e) {
					this.loading = false;
					throw e;
				}
			}
		},
		mounted() {
			this.loadUsers();
		}
	}
</script>

<style scoped lang="scss">
	.userManagement {
		width: 80%;
	}
</style>