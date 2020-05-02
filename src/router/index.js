import Vue from 'vue'
import VueRouter from 'vue-router'
import About from '../views/About.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: About
    },
    {
        path: '/contacts',
        name: 'Contacts',
        component: () => import(/* webpackChunkName: "about" */ '../views/Contacts.vue')
    },
    {
        path: '/portfolio',
        name: 'Portfolio',
        component: () => import(/* webpackChunkName: "portfolio" */ '../views/Portfolio.vue')

    },
    {
        path: '/skills',
        name: 'Skills' ,
        component: () => import (/* webpackChunkName: "skills" */ "../views/Skills.vue")
    },
    {
        path: '/phoneBook',
        name: 'PhoneBook' ,
        component: () => import (/* webpackChunkName: "phoneBook" */ "../views/PhoneBook.vue")
    },
    {
        path: '*',
        name: 'NotFound',
        component: () => import (/* webpackChunkName: "NotFound" */ "../views/NotFound.vue")
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router
