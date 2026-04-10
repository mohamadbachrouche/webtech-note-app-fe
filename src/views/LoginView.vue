<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/services/AuthService'
import type { AxiosError } from 'axios'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

async function onSubmit() {
  errorMsg.value = ''
  isLoading.value = true
  try {
    await login(email.value, password.value)
    router.push('/')
  } catch (err) {
    const error = err as AxiosError
    if (error.response?.status === 401) {
      errorMsg.value = 'Invalid email or password. Please try again.'
    } else {
      errorMsg.value = 'Something went wrong. Please try again later.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <div class="auth-card">
      <h1 class="auth-title">Welcome Back</h1>
      <p class="auth-subtitle">Sign in to access your notes</p>

      <form @submit.prevent="onSubmit" class="auth-form">
        <div v-if="errorMsg" class="auth-error">{{ errorMsg }}</div>

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

        <button type="submit" class="auth-btn" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Log in' }}
        </button>
      </form>

      <p class="auth-footer">
        Don't have an account?
        <router-link to="/register">Create one</router-link>
      </p>
    </div>
  </div>
</template>
