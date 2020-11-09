import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Projects from "./views/Projects";
import Project from "./views/Project";
import UserManagement from './views/UserManagement';
import Login from './views/Login'
import store from './store'
import Config from "./views/Config";
import Board from "./components/Board";
import Hotfixes from "./components/Hotfixes";
import RolesAndMembers from "./components/RolesAndMembers";
import Page404 from "@/views/Page404";
import Setting from "@/components/Setting";
import ProjectBuilder from "./components/projects/ProjectBuilder";
import ProjectsList from "./components/projects/ProjectsList";
import Versions from "@/views/Versions";

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
            },
            children: [
                {
                    path: '/',
                    name: 'projects-list',
                    component: ProjectsList,
                },
                {
                    path: '/project-builder',
                    name: 'project-builder',
                    component: ProjectBuilder,
                    meta: {
                        requiresAdmin: true
                    }
                },
            ]
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
            path: '/config',
            name: 'config',
            component: Config,
            meta: {
                requiresAuth: true,
                requiresAdmin: true
            }
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/projects/:_id/',
            name: 'project',
            component: Project,
            children: [{
                path: '',
                component: Board
            }, {
                path: 'board',
                component: Board
            }, {
                path: 'roles',
                component: RolesAndMembers
            }, {
                path: 'hotfixes',
                component: Hotfixes
            }, {
                path: 'setting',
                component: Setting
            }, {
                path: 'versions',
                component: Versions
            }],
            meta: {
                requiresAuth: true
            },
            props: true
        },
        {
            path: '*',
            name: 'page404',
            component: Page404
        },
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
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (store.state.user.loggedIn) {
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
