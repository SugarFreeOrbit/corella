<template>
	<div class="justify-content-center page-body-wrapper full-page-wrapper login">
		<b-row class="h-100" align-v="center">
			<b-col>
				<div class="login__form">
					<div class="login__form__logo"> </div>
					<el-form :model="loginForm">
						<el-form-item label="Username">
							<el-input v-model="loginForm.username"></el-input>
						</el-form-item>
						<el-form-item label="Password">
							<el-input v-model="loginForm.password" show-password></el-input>
						</el-form-item>
						<el-form-item>
							<el-button type="primary">Log in</el-button>
						</el-form-item>
					</el-form>
				</div>
			</b-col>
		</b-row>
	</div>
</template>

<script>
	export default {
		name: "Login.vue",
		data() {
			return {
				loginForm: {
					username: "",
					password: ""
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login__form {
		width: 300px;
		font-weight: bold;
		color: black;
	}
	.login {
		display: flex;
		height: 100%;
		background-color: #87A330;
		width: 100%;
		text-align: center;
	}
	.login__form__logo {
		background-image: url("../assets/birb.svg");
		background-size: 200% 200%;
		background-position: center;
		margin-left: auto;
		margin-right: auto;
		width: 200px;
		height: 200px;
		z-index: 10000;
	}
	.el-button {
		background-color: #FFE059;
		color: black;
		font-weight: bold;
		border: none;
	}
	.el-button:hover {
		background-color: #cfb24f;
	}
</style>