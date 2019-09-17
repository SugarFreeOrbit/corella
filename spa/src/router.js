import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login'

Vue.use(Router);

const router = new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			name: 'home',
			component: Home,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/login',
			name: 'login',
			component: Login
		}
		// {
		// 	path: '/about',
		// 	name: 'about',
		// 	// route level code-splitting
		// 	// this generates a separate chunk (about.[hash].js) for this route
		// 	// which is lazy-loaded when the route is visited.
		// 	component: function () {
		// 		return import(/* webpackChunkName: "about" */ './views/About.vue')
		// 	}
		// }
	]
});

router.beforeEach((to, from, next) => {
	if(to.matched.some(record => record.meta.requiresAuth)) {
		if(localStorage.getItem('jwt')) {
			next();
		} else {
			next({
				path: '/login',
				query: {redirect: to.fullPath}
			});
		}
	} else {
		next();
	}
});

export default router;
