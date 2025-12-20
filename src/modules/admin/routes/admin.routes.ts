export default {
  path: '/admin',
  name: 'admin',
  children: [
    {
      path: '',
      name: 'OrdersManager',
      meta: { requiresAuth: true, role: 'ROLE_ADMIN' },
      component: () => import('@/modules/admin/views/OrdersView.vue'),
    },
    {
      path: 'products',
      name: 'ProductsManager',
      meta: { requiresAuth: true, role: 'ROLE_ADMIN' },
      component: () => import('@/modules/admin/views/ProductsView.vue'),
    },
    {
      path: 'users',
      name: 'UserManager',
      meta: { requiresAuth: true, role: 'ROLE_ADMIN' },
      component: () => import('@/modules/admin/views/UsersView.vue'),
    },
    {
      path: 'orders/:id',
      name: 'OrderDetailManager',
      meta: { requiresAuth: true, role: 'ROLE_ADMIN' },
      component: () => import('@/modules/admin/views/OrderDetailView.vue'),
    },
  ],
}
