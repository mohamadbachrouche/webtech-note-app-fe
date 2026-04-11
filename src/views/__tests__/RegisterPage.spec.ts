import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import RegisterPage from '../RegisterPage.vue'

const registerMock = vi.fn()
const saveAuthMock = vi.fn()

vi.mock('@/services/AuthService', () => ({
  register: (...args: unknown[]) => registerMock(...args),
  saveAuth: (...args: unknown[]) => saveAuthMock(...args),
}))

const pushMock = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const globalStubs = {
  stubs: {
    'router-link': {
      template: '<a><slot /></a>',
    },
  },
}

describe('RegisterPage.vue', () => {
  beforeEach(() => {
    registerMock.mockReset()
    saveAuthMock.mockReset()
    pushMock.mockReset()
  })

  async function fillAndSubmit(
    wrapper: ReturnType<typeof mount>,
    email: string,
    password: string,
    confirmPassword: string = password,
  ) {
    await wrapper.find('#email').setValue(email)
    await wrapper.find('#password').setValue(password)
    await wrapper.find('#confirm-password').setValue(confirmPassword)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()
  }

  it('renders the register form with the password rules hint', () => {
    const wrapper = mount(RegisterPage, { global: globalStubs })
    expect(wrapper.text()).toContain('Create Account')
    expect(wrapper.find('#password-help').text()).toContain('at least 8 characters')
    expect(wrapper.find('#password-help').text()).toContain('uppercase')
    expect(wrapper.find('#password-help').text()).toContain('lowercase')
    expect(wrapper.find('#password-help').text()).toContain('digit')
  })

  it('rejects a password that is too short before hitting the API', async () => {
    const wrapper = mount(RegisterPage, { global: globalStubs })
    await fillAndSubmit(wrapper, 'a@b.c', 'Short1')

    expect(wrapper.find('.auth-error').text()).toContain('at least 8 characters')
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('rejects a password missing an uppercase letter', async () => {
    const wrapper = mount(RegisterPage, { global: globalStubs })
    await fillAndSubmit(wrapper, 'a@b.c', 'password1')

    expect(wrapper.find('.auth-error').text()).toContain('uppercase')
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('rejects a password missing a digit', async () => {
    const wrapper = mount(RegisterPage, { global: globalStubs })
    await fillAndSubmit(wrapper, 'a@b.c', 'Password')

    expect(wrapper.find('.auth-error').text()).toContain('digit')
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords before hitting the API', async () => {
    const wrapper = mount(RegisterPage, { global: globalStubs })
    await fillAndSubmit(wrapper, 'a@b.c', 'Password1', 'Password2')

    expect(wrapper.find('.auth-error').text()).toContain('Passwords do not match')
    expect(registerMock).not.toHaveBeenCalled()
  })

  it('saves auth and navigates to / on successful registration', async () => {
    registerMock.mockResolvedValue({ data: { token: 't0k3n', email: 'a@b.c' } })
    const wrapper = mount(RegisterPage, { global: globalStubs })

    await fillAndSubmit(wrapper, 'a@b.c', 'Password1')

    expect(registerMock).toHaveBeenCalledWith('a@b.c', 'Password1')
    expect(saveAuthMock).toHaveBeenCalledWith({ token: 't0k3n', email: 'a@b.c' })
    expect(pushMock).toHaveBeenCalledWith('/')
    expect(wrapper.find('.auth-error').exists()).toBe(false)
  })

  it('shows the "account already exists" message on 409', async () => {
    registerMock.mockRejectedValue({ response: { status: 409 } })
    const wrapper = mount(RegisterPage, { global: globalStubs })

    await fillAndSubmit(wrapper, 'taken@b.c', 'Password1')

    expect(wrapper.find('.auth-error').text()).toContain('already exists')
    expect(saveAuthMock).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('shows a generic error message for non-409 failures', async () => {
    registerMock.mockRejectedValue({ response: { status: 500 } })
    const wrapper = mount(RegisterPage, { global: globalStubs })

    await fillAndSubmit(wrapper, 'a@b.c', 'Password1')

    expect(wrapper.find('.auth-error').text()).toContain('Something went wrong')
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolveRegister: (v: unknown) => void = () => {}
    registerMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve
        }),
    )

    const wrapper = mount(RegisterPage, { global: globalStubs })
    await wrapper.find('#email').setValue('a@b.c')
    await wrapper.find('#password').setValue('Password1')
    await wrapper.find('#confirm-password').setValue('Password1')
    await wrapper.find('form').trigger('submit.prevent')

    const btn = wrapper.find('button[type="submit"]')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toContain('Creating account')

    resolveRegister({ data: { token: 't', email: 'a@b.c' } })
    await flushPromises()
  })
})
