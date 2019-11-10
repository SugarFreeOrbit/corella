<template>
	<div style="height: 100%">
		<navbar></navbar>
		<div v-if="projectBuilder.visible" class="projectBuilder">
			<div class="projectBuilder__close" @click="projectBuilder.visible = false"><i class="el-icon-close"></i></div>
			<div class="projectBuilder__content container">
				<el-steps :active="projectBuilder.step" align-center finish-status="success">
					<el-step title="Name your project"></el-step>
					<el-step title="Add columns"></el-step>
					<el-step title="Add roles"></el-step>
				</el-steps>
				<el-form :model="projectBuilder.naming" class="projectBuilder__content__naming container" v-if="projectBuilder.step === 0">
					<el-form-item label="Project name">
						<el-input v-model="projectBuilder.naming.name"></el-input>
					</el-form-item>
					<el-form-item label="Project description">
						<el-input v-model="projectBuilder.naming.description"></el-input>
					</el-form-item>
<!--					<el-form-item style="text-align: center">-->
<!--						<el-button type="primary" @click="processNaming">Next</el-button>-->
<!--					</el-form-item>-->
				</el-form>
				<div class="projectBuilder__content__columns" v-if="projectBuilder.step === 1">
					<el-card class="projectBuilder__content__columns__column" v-for="column in projectBuilder.columns" v-bind:key="column.name">
						<div slot="header">
							<div class="projectBuilder__content__columns__column__remove" @click="removeColumn(column.name)"><i class="el-icon-close"></i></div>
							<div class="projectBuilder__content__columns__column__header" slot="header">
								<p>{{column.name}}</p>
								<p v-if="column.limit">WIP limit: {{column.limit}}</p>
							</div>
						</div>
<!--						<div class="projectBuilder__content__columns__column__header" slot="header">-->
<!--							<div class="projectBuilder__content__columns__column__header__remove"><i class="el-icon-close"></i></div>-->
<!--							<p>{{column.name}}</p>-->
<!--							<p v-if="column.limit">WIP limit: {{column.limit}}</p>-->
<!--						</div>-->
					</el-card>
					<el-card class="projectBuilder__content__columns__add" v-if="projectBuilder.columns.length <= 6">
						<div slot="header">
							Add new column
						</div>
						<el-form :model="projectBuilder.newColumn">
							<el-form-item label="Column name" required>
								<el-input v-model="projectBuilder.newColumn.name" maxlength="15"></el-input>
							</el-form-item>
							<el-form-item label="WIP limit:">
								<el-input-number v-model="projectBuilder.newColumn.limit" size="mini"></el-input-number>
							</el-form-item>
							<el-form-item style="text-align: center">
								<el-button circle icon="el-icon-plus" type="primary" @click="addColumn"></el-button>
							</el-form-item>
						</el-form>
					</el-card>
				</div>
				<div class="projectBuilder__content__roles" v-if="projectBuilder.step === 2">
					<el-card v-for="role in projectBuilder.roles" style="margin-right: 10px">
						{{role.name}}
					</el-card>
					<el-button circle icon="el-icon-plus" type="primary" style="width: 65px; font-size: 20px" @click="projectBuilder.newRole.visible = true"></el-button>
					<el-dialog :visible.sync="projectBuilder.newRole.visible" center class="projectBuilder__content__roles__add">
						<el-form :model="projectBuilder.newRole">
							<el-form-item label="Role name">
								<el-input autocomplete="off" v-model="projectBuilder.newRole.name"></el-input>
							</el-form-item>
							<el-form-item label="Manage">
								<el-switch v-model="projectBuilder.newRole.isManager"></el-switch>
							</el-form-item>
							<el-form-item label="Create">
								<el-switch v-model="projectBuilder.newRole.isCreator"></el-switch>
							</el-form-item>
							<el-form-item label="Delete">
								<el-switch v-model="projectBuilder.newRole.isDestroyer"></el-switch>
							</el-form-item>
							<el-form-item label="Edit">
								<el-switch v-model="projectBuilder.newRole.isEditor"></el-switch>
							</el-form-item>
							<el-form-item>
								{{transitionSelect}}
							</el-form-item>
						</el-form>
					</el-dialog>
				</div>
				<div class="projectBuilder__content__control">
					<el-button @click="projectBuilder.step--" v-if="projectBuilder.step > 0">Previous</el-button>
					<el-button @click="progressBuilder" type="primary" v-if="projectBuilder.step < 2">Next</el-button>
					<el-button @click="progressBuilder" type="primary" v-if="projectBuilder.step === 2">Submit</el-button>
				</div>
			</div>
		</div>
		<div class="projects" v-loading="loading" v-else>
			<div class="projects__tools">
				<el-button round icon="el-icon-plus" type="primary" @click="projectBuilder.visible = true">Create new project</el-button>
			</div>
			<el-card v-for="project in projects" class="project" v-bind:key="project._id">
				<div slot="header" class="clearfix">
					<span><router-link to="/" class="project__name">{{project.name}}</router-link></span>
				</div>
				<div v-if="project.description !== undefined">
					{{project.description}}
				</div>
			</el-card>
		</div>
	</div>
</template>

<script>
	import Navbar from "../components/Navbar";
	export default {
		name: "Projects",
		components: {Navbar},
		data() {
			return {
				projects: [],
				loading: true,
				projectBuilder: {
					visible: false,
					step: 0,
					naming: {
						name: '',
						description: ''
					},
					columns: [
						{
							name: 'column',
							isStarting: true,
							isClosing: false
						},
						{
							name: 'column1',
							isStarting: false,
							isClosing: false
						}
					],
					newColumn: {
						name: '',
						limit: 0,
						isClosing: false
					},
					roles: [
						{
							name: "Manager"
						},
						{
							name: "Developer"
						}
					],
					newRole: {
						visible: false,
						name: '',
						isManager: false,
						isCreator: false,
						isDestroyer: false,
						isEditor: false,
						itm: {},
						columns: []
					}
				}
			}
		},
		methods: {
			loadProjects: async function() {
				let res = await this.$http.get('/projects');
				this.projects = res.data;
				this.loading = false;
			},
			progressBuilder: function() {
				switch (this.projectBuilder.step) {
					case 2:
						this.projectBuilder.newRole.itm = {};
						this.projectBuilder.columns.forEach(col => {
							this.projectBuilder.newRole.columns.push(col.name);
						})
						// this.projectBuilder.newRole.itm = {};
						// this.projectBuilder.columns.forEach((startCol, startColIndex) => {
						// 	this.projectBuilder.newRole.itm[startCol] = [];
						// 	// this.projectBuilder.columns.forEach(endCol => {
						// 	// 	if(startCol.name !== endCol.name) {
						// 	// 		this.projectBuilder.newRole.itm[startColIndex].push(false);
						// 	// 	} else {
						// 	// 		this.projectBuilder.newRole.itm[startColIndex].push(true);
						// 	// 	}
						// 	// });
						// })
				}
				this.projectBuilder.step++;
			},
			addColumn: function() {
				if (this.projectBuilder.newColumn.limit <= 0) {
					this.projectBuilder.columns.push({
						name: this.projectBuilder.newColumn.name,
						isStarting: this.projectBuilder.columns.length === 0,
						isClosing: false
					})
				} else {
					this.projectBuilder.columns.push({
						name: this.projectBuilder.newColumn.name,
						isStarting: this.projectBuilder.columns.length === 0,
						isClosing: false,
						limit: this.projectBuilder.newColumn.limit
					})
				}
			},
			removeColumn: function (name) {
				let index = this.projectBuilder.columns.findIndex(col => col.name === name);
				this.projectBuilder.columns.splice(index, 1);
			}
		},
		mounted() {
			this.loadProjects();
		},
		computed: {
			transitionSelect: function () {
				
			}
		}
	}
</script>

<style scoped lang="scss">
	.projects {
		height: 100%;
		&__tools {
			display: flex;
			justify-content: center;
			padding-top: 25px;
			box-sizing: border-box;
		}
	}
	.project {
		width: 350px;
		display: inline-block;
		margin: 30px;
		&__name {
			text-decoration: none;
			color: #87A330;
			font-weight: bold;
			&:hover {
				color: #a9c737;
			}
			&:active {
				color: #87A330;
			}
		}
	}
	.projectBuilder {
		&__close {
			font-size: 25px;
			position: relative;
			top: 15px;
			left: 15px;
			cursor: pointer;
			display: inline-block;
			box-sizing: border-box;
			padding: 2px;
			&:hover {
				color: #87A330;
			}
		}
		&__content {
			display: flex;
			justify-content: space-between;
			flex-direction: column;
			flex-wrap: wrap;
			width: 70%;
			&__control {
				text-align: center;
				margin-top: 50px;
			}
			&__naming {
				width: 60%;
				margin-top: 100px;
			}
			&__columns {
				display: flex;
				flex-direction: row;
				align-items: stretch;
				justify-content: center;
				height: 50vh;
				margin-top: 30px;
				&__column {
					color: black;
					width: 20%;
					margin-right: 5px;
					&__remove {
						position: relative;
						display: inline-block;
						top: -10px;
						left: -10px;
						&:hover {
							cursor: pointer;
							color: #87A330;
						}
					}
					&__header {
						height: 45px;
						display: flex;
						justify-content: center;
						flex-direction: column;
						align-items: center;
						//flex-wrap: wrap;
						font-weight: bold;
					}
				}
			}
			&__roles {
				display: flex;
				justify-content: center;
				flex-wrap: wrap;
			}
		}
	}

</style>