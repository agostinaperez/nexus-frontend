<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/modules/auth/composables/use.auth'

const { login, isLoading, isError, isSuccess } = useAuth()

const loginForm = ref({
  username: '',
  password: '',
})

const errorMessage = ref('')
const showPassword = ref(false) // Para alternar visibilidad de contraseña

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
//cuando uso el boton de iniciar sesion me loguea
const handleLogin = async () => {
  try {
    await login({
      username: loginForm.value.username,
      password: loginForm.value.password,
    })
    errorMessage.value = ''
  } catch (error: any) {
    errorMessage.value = error.message || 'Error en el login'
  }
}
</script>

<template>
  <v-container fluid class="login-wrapper pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Columna de Imagen -->
      <v-col cols="8" class="image-column d-flex align-center justify-center">
        <div class="hero">
          <v-icon color="primary" size="42" class="mb-4">mdi-shield-lock</v-icon>
          <h2>Monitorecoo seguro en tiempo real</h2>
          <p>
            Con Nexus, obtenés soporte integral para la administración de órdenes de carga de gas
            líquido.
          </p>
        </div>
      </v-col>

      <!-- Columna del Formulario -->
      <v-col cols="4" class="form-column d-flex justify-center align-center">
        <v-card class="data-container login-card" max-width="440">
          <div class="text-center mb-6">
            <v-img src="/src/assets/logo.png" width="120" height="80" class="mx-auto mb-2"></v-img>
            <h3 class="mb-1">Bienvenido de nuevo</h3>
            <p class="muted">Inicia sesión para continuar</p>
          </div>
          <v-form @submit.prevent="handleLogin" class="login-form">
            <!-- Campo de usuario -->
            <div class="field">
              <span class="field-label">Usuario</span>
              <v-text-field
                v-model="loginForm.username"
                placeholder="Ingresa tu usuario"
                required
                :disabled="isLoading.value"
                hide-details
                bg-color="transparent"
                density="comfortable"
                autofocus
                class="form-input"
                color="primary"
                variant="outlined"
              ></v-text-field>
            </div>
            <!-- Campo de contraseña -->
            <div class="field">
              <span class="field-label">Contraseña</span>
              <v-text-field
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Ingresa tu contraseña"
                required
                :disabled="isLoading.value"
                hide-details
                bg-color="transparent"
                density="comfortable"
                class="form-input"
                color="primary"
                variant="outlined"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="togglePasswordVisibility"
              ></v-text-field>
            </div>
            <!-- Botón de login -->
            <v-btn
              class="login-button mt-4"
              :loading="isLoading.value"
              :disabled="isLoading.value"
              color="primary"
              type="submit"
              size="large"
              block
            >
              <span v-if="!isLoading.value">Ingresar</span>
            </v-btn>
            <!-- Mensaje de error -->
            <v-alert
              v-if="isError.value"
              type="error"
              variant="tonal"
              class="mt-4 alert"
              transition="scale-transition"
              border="start"
              prominent
            >
              {{ errorMessage }}
            </v-alert>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-wrapper {
  background: var(--bg-gradient);
}

.image-column {
  position: relative;
  background:
    radial-gradient(circle at 20% 20%, rgba(72, 199, 142, 0.18), transparent 40%),
    linear-gradient(135deg, #0d141a 0%, #0f1a21 50%, #0b1116 100%),
    url('/src/assets/logo_login.jpg') center/cover no-repeat;
  min-height: 100vh;
}

.image-column::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(15, 23, 29, 0.85), rgba(18, 34, 32, 0.75));
}

.hero {
  position: relative;
  max-width: 520px;
  z-index: 1;
  color: var(--color-heading);
  text-align: left;
  padding: 24px;
  border-radius: 16px;
  background: rgba(22, 33, 41, 0.55);
  box-shadow: var(--shadow-soft);
}

.hero h2 {
  font-size: 32px;
  margin-bottom: 12px;
}

.hero p {
  margin: 0;
  color: var(--color-muted);
}

.form-column {
  background: linear-gradient(180deg, #0f171d 0%, #0d1419 100%);
}

.login-card {
  width: 100%;
  backdrop-filter: blur(6px);
  padding: 18px 22px;
}

.muted {
  color: var(--color-muted);
}

.field {
  margin-bottom: 18px;
}

.field-label {
  color: var(--color-muted);
  font-weight: 600;
}

.form-input :deep(.v-field__field) {
  background: var(--color-surface-3);
  border-radius: 12px;
}

.form-input :deep(.v-field--variant-outlined .v-field__outline__border) {
  color: transparent;
}

.login-button {
  box-shadow: 0 12px 24px rgba(72, 199, 142, 0.3);
}

.alert {
  background: rgba(240, 139, 107, 0.08);
}
</style>
