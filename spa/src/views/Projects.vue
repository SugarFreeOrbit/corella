<template>
	<div style="height: 100%">
		<navbar></navbar>
		<div class="projects" v-loading="loading">
			<div class="projects__tools">
				<el-button round icon="el-icon-plus" type="primary">Create new project</el-button>
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
				loading: true
			}
		},
		methods: {
			loadProjects: async function() {
				let res = await this.$http.get('/projects');
				this.projects = res.data;
				this.loading = false;
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
</style>