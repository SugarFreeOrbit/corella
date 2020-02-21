<template>
	<el-dialog v-visible:sync="active" title="New issue">
		<el-form model="form" v-loading="inProgress">
			<el-form-item label="Title">
				<el-input v-model="form.title"></el-input>
			</el-form-item>
			<el-form-item label="Description">
				<el-input v-model="form.description"></el-input>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>

<script>
	export default {
		name: "IssueCreationModal",
		data() {
			return {
				active: false,
				inProgress: false,
				form: {
					title: '',
					description: ''
				}
			}
		}
	}
</script>

<style scoped>

</style>