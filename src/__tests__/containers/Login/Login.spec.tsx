/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import userEvent from '@testing-library/user-event'
import Login, { messages } from '@containers/Login'
import { invalidEmailFormat } from '@common/utilities/constants'

jest.mock('next/config', () => ({
  __esModule: true,
  default: () => ({ publicRuntimeConfig: { tenantId: 'fair' } }),
}))

describe('Login container', () => {
  test('Verify form title', () => {
    render(<Login />)
    const { welcome } = messages
    expect(screen.getByRole('heading')).toHaveTextContent(welcome)
  })

  test('Verify form inputs', () => {
    render(<Login />)
    expect(screen.getByLabelText('Email')).toBeVisible()
    expect(screen.getByLabelText('Password')).toBeVisible()
  })

  test('Verify email required validation', async () => {
    render(<Login />)
    const {
      validation: { emailRequired },
    } = messages
    userEvent.click(screen.getByText('Login'))
    await screen.findByText(emailRequired)
  })

  test('Verify password required validation', async () => {
    render(<Login />)
    const {
      validation: { passwordRequired },
    } = messages
    userEvent.click(screen.getByText('Login'))
    await screen.findByText(passwordRequired)
  })

  test('Verify email format validation', async () => {
    render(<Login />)
    userEvent.type(screen.getByLabelText('Email'), 'abc')
    userEvent.click(screen.getByText('Login'))
    await screen.findByText(invalidEmailFormat)
  })

  test('Verify button text change on form submit', async () => {
    render(<Login />)
    userEvent.type(screen.getByLabelText('Email'), 'rabbiyaalamgir@gmail.com')
    userEvent.type(screen.getByLabelText('Password'), '1234')
    userEvent.click(screen.getByText('Login'))
    await screen.findByText('Logging in')
  })
})
