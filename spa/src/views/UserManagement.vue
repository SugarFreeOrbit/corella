<template>
	<div>
		<navbar></navbar>
		<div class="userManagement container-fluid" v-loading="loading">
			<el-dialog title="Edit user" center :visible.sync="editModalVisible" width="40%">
				<el-form v-model="edit" autocomplete="off">
					<el-form-item label="Username">
						<el-input v-model="edit.username"></el-input>
					</el-form-item>
					<el-form-item label="E-mail">
						<el-input v-model="edit.email"></el-input>
					</el-form-item>
					<el-form-item label="Password">
						<el-input v-model="edit.password" show-password></el-input>
					</el-form-item>
					<el-form-item label="Admin">
						<el-switch v-model="edit.isAdmin"></el-switch>
					</el-form-item>
					<el-form-item style="text-align: center;">
						<el-button @click="editModalVisible = false">Cancel</el-button>
						<el-button type="primary" @click="submitEditModal">Confirm</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>
			<el-dialog title="Add user" center :visible.sync="addModalVisible" width="40%">
				<el-form v-model="add" autocomplete="off">
					<el-form-item label="Username">
						<el-input v-model="add.username"></el-input>
					</el-form-item>
					<el-form-item label="E-mail">
						<el-input v-model="add.email"></el-input>
					</el-form-item>
					<el-form-item label="Password">
						<el-input v-model="add.password" show-password></el-input>
					</el-form-item>
					<el-form-item label="Admin">
						<el-switch v-model="add.isAdmin"></el-switch>
					</el-form-item>
					<el-form-item style="text-align: center;">
						<el-button @click="addModalVisible = false">Cancel</el-button>
						<el-button type="primary" @click="submitAddModal">Confirm</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>
			<data-tables-server :data="users" :total="total" @query-change="handleQueryChange" :pagination-props="{ pageSizes: [10, 15, 20] }">
				<el-table-column prop="username" label="Username"></el-table-column>
				<el-table-column prop="email" label="E-mail"></el-table-column>
				<el-table-column prop="isAdmin" label="Admin" width="auto" custom>
					<template slot-scope="props">
						<el-switch v-model="props.row.isAdmin" @change="changeRole(props.row._id, props.row)"/>
					</template>
				</el-table-column>
				<el-table-column custom width="auto">
					<template slot="header" slot-scope="scope">
						<el-tooltip class="item" effect="dark" content="Add a new user" placement="top">
							<el-button type="primary" circle icon="el-icon-plus" @click="addModalVisible = true"></el-button>
						</el-tooltip>
					</template>
					<template slot-scope="props">
						<el-button type="danger" icon="el-icon-delete" @click="deleteUser(props.row._id)" circle></el-button>
						<el-button type="primary" icon="el-icon-edit" circle @click="showEditModal(props.row)"></el-button>
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
				loading: false,
				editModalVisible: false,
				addModalVisible: false,
				edit: {
					username: '',
					email: '',
					password: '',
					isAdmin: false,
					_id: ''
				},
				add: {
					username: '',
					email: '',
					password: '',
					isAdmin: false
				}
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
			changeRole: async function (userId, data) {
			  try {
          await this.$http.patch(`/users/${userId}`, data);
        } catch (e) {
          if(e.response.status === 400) {
            this.$notify.error({
              title: 'Error',
              message: e.response.data
            });
            data.isAdmin = !data.isAdmin;
            console.log(e);
            return;
          }
			    console.log(e);
        }
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
			},
			showEditModal: async function(user) {
				this.edit.username = user.username;
				this.edit.isAdmin = user.isAdmin;
				this.edit.password = '';
				this.edit.email = user.email;
				this.edit._id = user._id;
				this.editModalVisible = true;
			},
			submitEditModal: async function() {
        if(this.edit.username === '') {
          this.$notify.error({
            title: 'Error',
            message: 'Username cannot be empty'
          });
          return;
        }
        if(this.edit.email === '') {
          this.$notify.error({
            title: 'Error',
            message: 'Email cannot be empty'
          });
          return;
        }
				let update = {
					username: this.edit.username,
					isAdmin: this.edit.isAdmin,
					password: this.edit.password,
					email: this.edit.email
				};
				if (update.password === '') {
					delete update.password;
				}
				let result = update.email.match(/^[\w.-]+?@\w+?\.\w{2,6}$/);
        if(result === null) {
          this.$notify.error({
            title: 'Error',
            message: 'Invalid email!'
          });
          return;
        }
				try {
					await this.$http.patch(`/users/${this.edit._id}`, update);
					this.loadUsers();
					this.editModalVisible = false;
				} catch (e) {
          if(e.response.status === 400 && e.response.data.message !== undefined) {
            this.$notify.error({
              title: 'Error',
              message: e.response.data.message
            });
            console.log(e);
            return;
          }
					console.log(e);
					throw e;
				}
			},
			submitAddModal: async function() {
        if(this.add.username === '') {
          this.$notify.error({
            title: 'Error',
            message: 'Username cannot be empty'
          });
          return;
        }
        if(this.add.email === '') {
          this.$notify.error({
            title: 'Error',
            message: 'Email cannot be empty'
          });
          return;
        }
				let newUser = {
					username: this.add.username,
					isAdmin: this.add.isAdmin,
					password: this.add.password,
					email: this.add.email
				};
        let result = newUser.email.match(/^[\w.-]+?@\w+?\.\w{2,6}$/);
        if(result === null) {
          this.$notify.error({
            title: 'Error',
            message: 'Invalid email!'
          });
          return;
        }
				try {
					await this.$http.put('/users', newUser);
					this.loadUsers();
					this.addModalVisible = false;
				} catch (e) {
          if(e.response.status === 400 && e.response.data.message !== undefined) {
            this.$notify.error({
              title: 'Error',
              message: e.response.data.message
            });
            console.log(e);
            return;
          }
					console.log(e);
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