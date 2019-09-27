<template>
	<div class="navbar">
		<div class="navbar__logo">
		</div>
		<div class="navbar__menu">
			<ul>
				<li><router-link to="/">Projects</router-link></li>
				<li v-if="userIsAdmin"><router-link to="/">User management</router-link></li>
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
				return this.$store.state.user.username;
			},
			userIsAdmin: function () {
				return this.$store.state.user.isAdmin;
			}
		}
	}
</script>

<style scoped lang="scss">
	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
		background-color: #87A330;
	}
	li {
		float: left;
	}
	li a {
		display: block;
		color: white;
		text-align: center;
		padding: 14px 16px;
	}
	li a:hover {
		background-color: #a9c737;
		text-decoration: none;
	}
	.navbar {
		padding: 0;
		background-color: #87A330;
		text-decoration: none;
		font-weight: bold;

		&__logo {
			background-image: url("../assets/birb.svg");
			width: 50px;
			height: 50px;
			background-size: 200% 200%;
			background-position: center;
		}
		&__menu {
			float: left;
		}
	}
</style>