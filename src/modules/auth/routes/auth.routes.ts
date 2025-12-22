export default {
  path: '/',
  name: 'auth',
  // Grupo de rutas públicas de autenticación (solo login en esta versión).
  children: [
    {
      path: '/',
      name: 'Login',
      component: () => import('@/modules/auth/views/LoginView.vue'),
    },
  ],
}
