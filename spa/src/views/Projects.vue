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
					<el-form-item style="text-align: center">
						<el-button type="primary" @click="processNaming">Next</el-button>
					</el-form-item>
				</el-form>
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
			processNaming: async function() {
				this.projectBuilder.step++;
			}
		},
		mounted() {
			this.loadProjects();
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
			width: 60%;
			&__naming {
				width: 60%;
				margin-top: 100px;
			}
		}
	}
</style>