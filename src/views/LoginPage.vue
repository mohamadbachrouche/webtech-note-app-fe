<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, saveAuth } from '@/services/AuthService'
import type { AxiosError } from 'axios'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    const response = await login(email.value, password.value)
    saveAuth(response.data)
    router.push('/')
  } catch (err) {
    const error = err as AxiosError
    if (error.response?.status === 401) {
      errorMessage.value = 'Invalid email or password. Please try again.'
    } else {
      errorMessage.value = 'Something went wrong. Please try again later.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Welcome Back</h1>
      <p class="auth-subtitle">Sign in to access your notes</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="errorMessage" class="auth-error">{{ errorMessage }}</div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="auth-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-footer">
        Don't have an account?
        <router-link to="/register">Create one</router-link>
      </p>
    </div>
  </div>
</template>
