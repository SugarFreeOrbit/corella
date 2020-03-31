<template>
	<div class="roles" v-loading="loading">
		<el-card class="roles__role" v-for="role in roles" v-bind:key="role._id">
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
					<el-button circle type="danger" icon="el-icon-delete"></el-button>
				</el-tooltip>
			</div>
		</el-card>
	</div>
</template>

<script>
	export default {
		name: "RolesAndMembers",
		data() {
			return {
				roles: [],
				loading: false
			}
		},
		computed: {
			projectId: function () {
				return this.$store.state.currentProject._id;
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
		}
	}
</script>

<style scoped lang="scss">
	.roles {
		height: 100%;
		padding-left: 80px;
		padding-right: 55px;
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