<template>
	<div class="justify-content-center page-body-wrapper full-page-wrapper login">
		<b-row class="h-100" align-v="center">
			<b-col>
				<div class="login__form">
					<div class="login__form__logo"> </div>
          <form @submit.prevent="login">
            <div class="form-group">
              <label>Username</label>
              <el-input v-model="loginForm.username"></el-input>
            </div>
            <div class="form-group">
              <label>Password</label>
              <el-input v-model="loginForm.password" show-password></el-input>
            </div>
            <div class="btn-wrapper">
              <button type="submit">Log in</button>
            </div>
          </form>
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
		},
    computed: {
      loggedIn() {
        return this.$store.state.user.loggedIn;
      }
    },
    mounted() {
		  if(this.loggedIn)
		    this.$router.push('/');
    },
    methods: {
			login: async function () {
				try {
					let res = await this.$http.post("/login", {
						username: this.loginForm.username,
						password: this.loginForm.password
					});
					this.$store.commit('logIn', {
						username: res.data.username,
						isAdmin: res.data.isAdmin,
						jwt: res.data.jwt
					});
          if(this.$route.query.redirect !== undefined && this.$route.query.redirect !== null && this.$route.query.redirect !== '' && this.$route.query.redirect !== '/login')
            this.$router.push(this.$route.query.redirect);
          else
            this.$router.push('/');
				} catch (e) {
					this.$notify({
						title: 'Invalid username or password',
						duration: 2000,
						type: 'error'
					});
					console.log(e);
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
		border: none !important;
	}
	.el-button:hover {
		background-color: #cfb24f;
		color: #000000;
	}
	.el-button:active {
		background-color: #b4974e;
		outline: none;
		color: #000000;
	}
	.el-button:focus {
		background-color: #e8ca55;
		outline: none;
		color: #000000;
	}

  .form-group {
    > label {
      text-align: left;
      float: left;
      margin-bottom: 2px;
      color: #666666;
    }
  }

  .btn-wrapper {
    > button {
      background-color: #FFE059;
      border: none;
      padding: 8px 18px;
      border-radius: 5px;
      font-weight: bold;

      transition: 0.3s;

      &:hover { background-color: #CFB24F }

    }
  }
</style>
