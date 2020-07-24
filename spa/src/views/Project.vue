<template>
	<div style="height: 100%">
		<div style="height: 100%" v-if="projectReady">
			<Navbar></Navbar>
			<div class="project__menu">
				<div class="project__menu__item" v-bind:class="{active: activeMenuItem === 'board'}" @click="activeMenuItem = 'board'">
					<el-tooltip content="Board" placement="right-start">
						<i class="el-icon-data-board"></i>
					</el-tooltip>
				</div>
				<div class="project__menu__item" v-bind:class="{active: activeMenuItem === 'roles'}" v-if="canAccessRoles" @click="activeMenuItem = 'roles'">
					<el-tooltip content="Roles and members" placement="right-start">
						<i class="el-icon-user"></i>
					</el-tooltip>
				</div>
				<div class="project__menu__item" v-bind:class="{active: activeMenuItem === 'hotfixes'}" @click="activeMenuItem = 'hotfixes'">
					<el-tooltip content="Hotfixes" placement="right-start">
						<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
							<title>fire</title>
							<path d="M10.031 32c-2.133-4.438-0.997-6.981 0.642-9.376 1.795-2.624 2.258-5.221 2.258-5.221s1.411 1.834 0.847 4.703c2.493-2.775 2.963-7.196 2.587-8.889 5.635 3.938 8.043 12.464 4.798 18.783 17.262-9.767 4.294-24.38 2.036-26.027 0.753 1.646 0.895 4.433-0.625 5.785-2.573-9.759-8.937-11.759-8.937-11.759 0.753 5.033-2.728 10.536-6.084 14.648-0.118-2.007-0.243-3.392-1.298-5.312-0.237 3.646-3.023 6.617-3.777 10.27-1.022 4.946 0.765 8.568 7.555 12.394z"></path>
						</svg>
					</el-tooltip>
				</div>
				<el-popover placement="right" trigger="click" width="100">
					<div class="project__menu__item" v-if="canCreateIssues" slot="reference">
						<i class="el-icon-plus"></i>
					</div>
					<div class="project__menu__item_create">
						<div class="project__menu__item_create__option" @click="issueCreationModal.active = true">
							New Issue
						</div>
					</div>
					<div class="project__menu__item_create">
						<div class="project__menu__item_create__option">
							New Epic
						</div>
					</div>
				</el-popover>
			</div>
			<Board v-if="activeMenuItem === 'board'"></Board>
			<RolesAndMembers v-if="activeMenuItem === 'roles'"></RolesAndMembers>
			<Hotfixes v-if="activeMenuItem === 'hotfixes'"></Hotfixes>
			<el-dialog :visible.sync="issueCreationModal.active" title="New issue">
				<el-form model="issueCreationModal.form" v-loading="issueCreationModal.inProgress">
					<el-form-item label="Title">
						<el-input required v-model="issueCreationModal.form.title"></el-input>
					</el-form-item>
					<el-form-item label="Description">
						<el-input type="textarea" v-model="issueCreationModal.form.description" :rows="5"></el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="createIssue">Create</el-button>
						<el-button @click="issueCreationModal.active = false">Cancel</el-button>
					</el-form-item>
				</el-form>
			</el-dialog>
		</div>
		<div v-else style="height: 100%" v-loading="projectReady"></div>
	</div>
</template>

<script>
	import Navbar from "../components/Navbar";
	import Board from "../components/Board";
	import RolesAndMembers from "../components/RolesAndMembers";
	import Hotfixes from "../components/Hotfixes";
	export default {
		name: "Project",
		components: {Hotfixes, RolesAndMembers, Board, Navbar},
		props: {
			name: String,
			_id: String
		},
		data() {
			return {
				activeMenuItem: 'board',
				issueCreationModal: {
					active: false,
					inProgress: false,
					form: {
						title: '',
						description: ''
					}
				},
				projectReady: false
			}
		},
		async created() {
			this.$store.commit('setCurrentProject', {_id: this._id});
			await Promise.all([this.$store.dispatch('syncCurrentProjectRole'), this.$store.dispatch('syncCurrentProjectMeta')]);
			this.projectReady = true;
		},
		computed: {
			canAccessRoles: function () {
				return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager;
			},
			canCreateIssues: function () {
				return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager || this.$store.state.currentProject.role.isCreator;
			}
		},
		beforeRouteLeave(to, from, next) {
			try {
				this.$store.commit('unsetCurrentProject');
				next()
			} catch (e) {
				next()
			}
		},
		methods:{
			createIssue: async function() {
				this.issueCreationModal.inProgress = true;
				if (this.$schemaValidators.validateNewIssue(this.issueCreationModal.form)) {
					let result = await this.$http.put(`/projects/${this._id}/issues`, this.issueCreationModal.form);
					this.issueCreationModal.inProgress = false;
					this.issueCreationModal.active = false;
					this.issueCreationModal.title = '';
					this.issueCreationModal.description = '';
				} else {
					this.$notify({
						title: 'Error',
						message: 'Your issue is invalid',
						duration: 3000,
						type: 'error'
					});
					this.issueCreationModal.inProgress = false;
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.project {
		&__menu {
			//border-right: 2px solid #87A330;
			box-shadow: 6px -4px 14px -5px rgba(0,0,0,0.71);
			width: 40px;
			height: -webkit-calc(100% - 52px);
			height: -moz-calc(100% - 52px);
			height: calc(100% - 52px);
			display: flex;
			float: left;
			/*position: fixed;*/
			/*z-index: 1;*/
			/*top: 52px;*/
			/*left: 0;*/
			overflow-x: hidden;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;
			&__item {
				margin-top: 20px;
				width: 100%;
				text-align: center;
				i {
					font-size: 20px;
					font-weight: bold;
				}
				&.active {
					i {
						color: #87A330;
					}
				}
				&:hover {
					cursor: pointer;
				}
				&_create__option {
					&:hover {
						cursor: pointer;
						text-decoration: underline;
					}
				}
			}
		}
	}
</style>