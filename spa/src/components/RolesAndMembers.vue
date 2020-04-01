<template>
	<div class="roles" v-loading="loading">
		<div class="roles__control">
			<el-button round icon="el-icon-plus" type="primary" @click="addRoleModal.visible = true">Add new role</el-button>
		</div>
		<el-card class="roles__role" v-for="role in roles" v-bind:key="role.name">
			<div class="roles__role__name" slot="header">
				{{role.name}}
			</div>
			<div class="roles__role__controls">
				<el-tooltip placement="bottom" content="View members">
					<el-button circle type="primary" icon="el-icon-user"></el-button>
				</el-tooltip>
				<el-tooltip placement="bottom" content="Edit role">
					<el-button circle type="primary" icon="el-icon-edit"></el-button>
				</el-tooltip>
				<el-tooltip placement="bottom" content="Delete role and it's members">
					<el-button circle type="danger" icon="el-icon-delete" @click="deleteRole(role.name)"></el-button>
				</el-tooltip>
			</div>
		</el-card>
		<el-dialog class="roles__modal_add" :visible.sync="addRoleModal.visible" v-loading="addRoleModal.loading">
			<el-form>
				<el-form-item label="Role name">
					<el-input autocomplete="off" v-model="addRoleModal.name"></el-input>
				</el-form-item>
				<el-form-item label="Manage">
					<el-switch v-model="addRoleModal.isManager"></el-switch>
				</el-form-item>
				<el-form-item label="Create">
					<el-switch v-model="addRoleModal.isCreator"></el-switch>
				</el-form-item>
				<el-form-item label="Delete">
					<el-switch v-model="addRoleModal.isDestroyer"></el-switch>
				</el-form-item>
				<el-form-item label="Edit">
					<el-switch v-model="addRoleModal.isEditor"></el-switch>
				</el-form-item>
				<el-form-item v-for="startingColumn in columns" v-bind:key="startingColumn.id">
					{{startingColumn.name}} <i class="el-icon-right"></i> {{" "}}<el-select v-model="addRoleModal.issueTransitionMatrix[startingColumn.id]" multiple placeholder="Select transitions">
					<el-option v-for="targetColumn in columns" :label="targetColumn.name" :key="targetColumn.id" :value="targetColumn.id" v-if="startingColumn.id !== targetColumn.id"></el-option>
				</el-select>
				</el-form-item>
				<el-form-item style="text-align: center">
					<el-button @click="addRoleModal.visible = false">Cancel</el-button>
					<el-button type="primary" @click="addRole">Create</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: "RolesAndMembers",
		data() {
			return {
				roles: [],
				loading: false,
				addRoleModal: {
					visible: false,
					loading: false,
					name: '',
					isManager: false,
					isCreator: false,
					isDestroyer: false,
					isEditor: false,
					issueTransitionMatrix: {}
				}
			}
		},
		computed: {
			projectId: function () {
				return this.$store.state.currentProject._id;
			},
			columns: function () {
				return this.$store.state.currentProject.columns.map(col => {
					return {
						id: col.id,
						name: col.name,
						isStarting: col.isStarting,
						isClosing: col.isClosing
					};
				});
			}
		},
		async created() {
			this.loading = true;
			let getRoles = await this.$http.get(`/projects/${this.projectId}/roles`);
			this.roles = getRoles.data.roles.map(role => {
				role.expanded = false;
				return role;
			});
			this.loading = false;
		},
		methods: {
			addRole: async function() {
				let revert = this.roles;
				try {
					this.addRoleModal.loading = true;
					let payload = {
						name: this.addRoleModal.name,
						isManager: this.addRoleModal.isManager,
						isCreator: this.addRoleModal.isCreator,
						isDestroyer: this.addRoleModal.isDestroyer,
						isEditor: this.addRoleModal.isEditor,
						issueTransitionMatrix: this.addRoleModal.issueTransitionMatrix
					};
					this.roles.push(payload);
					await this.$http.patch(`/projects/${this.projectId}/roles`, this.roles);
					this.addRoleModal.loading = false;
					this.addRoleModal.visible = false;
				} catch (e) {
					this.roles = revert;
					this.addRoleModal.loading = false;
					console.log(e);
				}
			},
			deleteRole: async function(name) {
				await this.$confirm("This will permanently delete this role and all of it's members. Continue?", 'Warning', {
					confirmButtonText: 'Confirm',
					cancelButtonText: 'Cancel',
					type: "warning"
				});
				let revert = this.roles;
				try {
					this.roles = this.roles.filter(role => role.name !== name);
					await this.$http.patch(`/projects/${this.projectId}/roles`, this.roles);
				} catch (e) {
					this.roles = revert;
					console.log(e);
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.roles {
		height: 100%;
		padding-left: 80px;
		padding-right: 55px;
		&__control {
			text-align: center;
			margin-top: 25px;
		}
		&__role {
			width: 350px;
			display: inline-block;
			margin: 30px;
			&__name {
				font-weight: bold;
				&:hover {
					color: #a9c737;
					cursor: pointer;
				}
			}
		}
	}
</style>