<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/services/AuthService'
import type { AxiosError } from 'axios'

const router = useRouter()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

async function onSubmit() {
  errorMsg.value = ''

  if (password.value.length < 8) {
    errorMsg.value = 'Password must be at least 8 characters.'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }

  isLoading.value = true
  try {
    await register(email.value, password.value)
    router.push('/')
  } catch (err) {
    const error = err as AxiosError
    if (error.response?.status === 409) {
      errorMsg.value = 'An account with this email already exists.'
    } else {
      errorMsg.value = 'Something went wrong. Please try again later.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-view">
    <div class="auth-card">
      <h1 class="auth-title">Create Account</h1>
      <p class="auth-subtitle">Sign up to start taking notes</p>

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
            placeholder="At least 8 characters"
            required
            minlength="8"
            autocomplete="new-password"
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="auth-btn" :disabled="isLoading">
          {{ isLoading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <router-link to="/login">Log in</router-link>
      </p>
    </div>
  </div>
</template>
