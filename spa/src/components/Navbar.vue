<template>
	<div class="navbar">
		<div class="navbar__logo">
		</div>
		<div class="navbar__menu">
			<ul>
				<li><router-link to="/">Projects</router-link></li>
				<li v-if="userIsAdmin"><router-link>User management</router-link></li>
			</ul>
		</div>
		<div class="navbar__currentUser">
			Logged in as: {{username}}
		</div>
		<div>
			Log out
		</div>
		<div>
		</div>
	</div>
</template>

<script>
	export default {
		name: "Navbar",
		computed: {
			username: function () {
				return this.$store.user.username;
			},
			userIsAdmin: function () {
				return this.$store.user.isAdmin;
			}
		}
	}
</script>

<style scoped>
	.navbar {

	}
</style>