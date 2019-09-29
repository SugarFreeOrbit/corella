<template>
	<div style="height: 100%">
		<navbar></navbar>
		<div class="projects" v-loading="loading">
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
				this.data.projects = res.data;
				this.data.loading = false;
			}
		}
	}
</script>

<style scoped lang="scss">
	.projects {
		height: 100%;
	}
</style>