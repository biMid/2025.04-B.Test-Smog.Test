import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
 
// 配置路由
const routes: Array<RouteRecordRaw> = [
  {
    name:'/',
    path: "/",
    redirect: "/index",
  },
  {
    name:'/index',
    path: "/index",
    component: () => import("../views/IndexPage.vue"),
  },
];

// 返回一个 router 实列，为函数，里面有配置项（对象） history
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_PATH as string),
  routes,
});
 
// 导出路由   然后去 main.ts 注册 router.ts
export default router