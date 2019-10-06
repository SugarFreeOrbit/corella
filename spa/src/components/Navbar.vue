<template>
	<div class="navbar">
		<div class="navbar__logo">
		</div>
		<div class="navbar__menu">
			<ul>
				<li><router-link to="/">Projects</router-link></li>
				<li v-if="userIsAdmin"><router-link to="/user-management">User management</router-link></li>
			</ul>
		</div>
		<div class="navbar__currentUser">
			Logged in as: {{username}}
		</div>
		<button class="navbar__logOut" @click="logout">
			Log out
		</button>
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
		},
		methods: {
			logout: function () {
				this.$store.dispatch('logOut');
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
		text-align: right;

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
		&__currentUser {
			float: right;
			text-align: center;
			padding: 14px 16px;
		}
		&__logOut {
			float: right;
			text-align: center;
			padding: 14px 16px;
			font-weight: bold;
			border: none;
			background-color: #FFE059;
			&:hover {
				background-color: #e4c654;
			}
			&:active {
				background-color: #c6a952;
			}
		}
	}
</style>