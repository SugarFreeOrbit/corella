<template>
	<div id="app">
		<router-view/>
	</div>
</template>

<style lang="scss">
	/*#app {*/
	/*	font-family: 'Avenir', Helvetica, Arial, sans-serif;*/
	/*	-webkit-font-smoothing: antialiased;*/
	/*	-moz-osx-font-smoothing: grayscale;*/
	/*	text-align: center;*/
	/*	color: #2c3e50;*/
	/*}*/
	/*#nav {*/
	/*	padding: 30px;*/
	/*	a {*/
	/*		font-weight: bold;*/
	/*		color: #2c3e50;*/
	/*		&.router-link-exact-active {*/
	/*			color: #42b983;*/
	/*		}*/
	/*	}*/
	/*}*/
	html, body {
		height: 100%;
	}
	body {
		margin: 0;
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
	#app {
		height: 100%;
	}
</style>
