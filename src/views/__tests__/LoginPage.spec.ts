import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LoginPage from '../LoginPage.vue'

// Mock AuthService so the component talks to spies instead of axios.
const loginMock = vi.fn()
const saveAuthMock = vi.fn()

vi.mock('@/services/AuthService', () => ({
  login: (...args: unknown[]) => loginMock(...args),
  saveAuth: (...args: unknown[]) => saveAuthMock(...args),
}))

// Mock vue-router's useRouter() so we can assert on navigation without
// mounting an actual router.
const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

/**
 * Vue's test-utils will try to render <router-link> inside the template;
 * stubbing it keeps the markup simple and avoids pulling in a real router.
 */
const globalStubs = {
  stubs: {
    'router-link': {
      template: '<a><slot /></a>',
    },
  },
}

describe('LoginPage.vue', () => {
  beforeEach(() => {
    loginMock.mockReset()
    saveAuthMock.mockReset()
    pushMock.mockReset()
  })

  async function fillAndSubmit(wrapper: ReturnType<typeof mount>, email: string, password: string) {
    await wrapper.find('#email').setValue(email)
    await wrapper.find('#password').setValue(password)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
  }

  it('renders the sign-in form', () => {
    const wrapper = mount(LoginPage, { global: globalStubs })
    expect(wrapper.text()).toContain('Welcome Back')
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Sign In')
  })

  it('saves auth and navigates to / on successful login', async () => {
    loginMock.mockResolvedValue({ data: { token: 't0k3n', email: 'a@b.c' } })
    const wrapper = mount(LoginPage, { global: globalStubs })

    await fillAndSubmit(wrapper, 'a@b.c', 'Password1')

    expect(loginMock).toHaveBeenCalledWith('a@b.c', 'Password1')
    expect(saveAuthMock).toHaveBeenCalledWith({ token: 't0k3n', email: 'a@b.c' })
    expect(pushMock).toHaveBeenCalledWith('/')
    expect(wrapper.find('.auth-error').exists()).toBe(false)
  })

  it('shows the "Invalid email or password" message on 401', async () => {
    loginMock.mockRejectedValue({ response: { status: 401 } })
    const wrapper = mount(LoginPage, { global: globalStubs })

    await fillAndSubmit(wrapper, 'a@b.c', 'wrong')

    const errorEl = wrapper.find('.auth-error')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Invalid email or password')
    expect(saveAuthMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('shows a generic error message for non-401 failures', async () => {
    loginMock.mockRejectedValue({ response: { status: 500 } })
    const wrapper = mount(LoginPage, { global: globalStubs })

    await fillAndSubmit(wrapper, 'a@b.c', 'Password1')

    const errorEl = wrapper.find('.auth-error')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.text()).toContain('Something went wrong')
  })

  it('disables the submit button while the request is in flight', async () => {
    // Never-resolving promise simulates a slow network so we can observe
    // the disabled state mid-flight.
    let resolveLogin: (v: unknown) => void = () => {}
    loginMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve
        }),
    )

    const wrapper = mount(LoginPage, { global: globalStubs })
    await wrapper.find('#email').setValue('a@b.c')
    await wrapper.find('#password').setValue('Password1')
    await wrapper.find('form').trigger('submit.prevent')

    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toContain('Signing in')

    resolveLogin({ data: { token: 't', email: 'a@b.c' } })
    await flushPromises()
  })
})
