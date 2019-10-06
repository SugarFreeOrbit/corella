import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Projects from "./views/Projects";
import UserManagement from './views/UserManagement';
import Login from './views/Login'
import store from './store'

Vue.use(Router);

const router = new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			name: 'projects',
			component: Projects,
			meta: {
				requiresAuth: true
			}
		},
		{
			path: '/user-management',
			name: 'userManagement',
			component: UserManagement,
			meta: {
				requiresAuth: true,
				requiresAdmin: true
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
		if(store.state.user.loggedIn) {
			if (to.matched.some(record => record.meta.requiresAdmin)) {
				if (store.state.user.isAdmin) {
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
