<template>
	<div>
		<navbar></navbar>
		<div class="userManagement" v-loading="loading">
			<data-tables-server :data="users" :total="total" @queryChange="handleQueryChange" :pagination-props="{ pageSizes: [10, 15, 20] }">
				<el-table-column :prop="username" :key="'Username'" :label="'Username'"></el-table-column>
				<el-table-column :prop="email" :key="'E-mail'" :label="'E-mail'"></el-table-column>
				<el-table-column :prop="isAdmin" :key="'Admin'" :label="'Admin'"></el-table-column>
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
			handleQueryChange: async function(queryInfo) {
				console.log(queryInfo);
				this.limit = queryInfo.pageSize;
				this.page = queryInfo.page;
				this.loadUsers();
			}
		},
		mounted() {
			this.loadUsers();
		}
	}
</script>

<style scoped>

</style>