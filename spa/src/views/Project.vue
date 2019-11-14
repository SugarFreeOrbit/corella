<template>
	<div style="height: 100%">
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
		</div>
		<Board></Board>
	</div>
</template>

<script>
	import Navbar from "../components/Navbar";
	import Board from "../components/Board";
	export default {
		name: "Project",
		components: {Board, Navbar},
		props: {
			name: String,
			_id: String
		},
		data() {
			return {
				activeMenuItem: 'board'
			}
		},
		async created() {
			this.$store.commit('setCurrentProject', {_id: this._id});
			await this.$store.dispatch('syncCurrentProjectRole');
		},
		computed: {
			canAccessRoles: function () {
				return this.$store.state.user.isAdmin || this.$store.state.currentProject.role.isManager;
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
			}
		}
	}
</style>