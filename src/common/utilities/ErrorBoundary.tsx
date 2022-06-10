// eslint-disable-next-line max-classes-per-file
import { TenantConfig } from '@common/endpoints/typings.gen'
import { fetchTenantConfiguration } from '@common/endpoints/useTenantConfiguration'
import { ErrorDataType as ApiErrorDataType } from '@common/utilities/http-api'
import SplashScreen from '@layouts/SplashScreen'
import React, { Component, ReactNode, ErrorInfo } from 'react'

type AppErrorType = { title: string; code?: number; description?: string }

/**
 * Error that can be gracefuly parsed by ErrorBoundary.
 *
 * Can be created from ApiError `throw new AppError(apiError?.data)`
 * or by assigning it's properties:
 * ``` ts
 * throw new AppError({ title: 'Test', code: 123, description: 'Lorem ipsum' })`.
 * ```
 * All parameters are optional.
 */
export class AppError extends Error {
  title: AppErrorType['title']

  code?: AppErrorType['code']

  description?: AppErrorType['description']

  constructor(input?: Partial<AppErrorType> & ApiErrorDataType & { name?: string }) {
    super(input?.name || input?.title || input?.errorCode)

    this.title = input?.title || input?.errorCode || input?.name || 'App Error'
    this.description = input?.description || input?.message
    this.code = input?.code || input?.status
  }
}

type ErrorBoundaryProps = {
  children?: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error?: AppError
  serverSideProps?: TenantConfig
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, serverSideProps: undefined }
  }

  static getDerivedStateFromError(error: AppError): Partial<ErrorBoundaryState> | null {
    return { hasError: true, error }
  }

  async componentDidMount() {
    const { data } = await fetchTenantConfiguration()
    this.setState({ serverSideProps: data })
  }

  componentDidCatch(error: AppError, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo) // eslint-disable-line no-console
  }

  render(): ReactNode {
    const { children } = this.props
    const { hasError, error, serverSideProps } = this.state
    if (hasError) {
      return (
        <SplashScreen serverSideProps={serverSideProps}>
          <div className="my-3 pb-5">
            <h1>
              {error?.code !== undefined && (
                <span
                  className="text-primary font-weight-bold"
                  style={{ fontSize: '3em', fontFamily: 'MINIHeadlineSerif, MINISerif, MINISansSerif, sans-serif' }}
                >
                  {error?.code}
                </span>
              )}
              <div className={error?.code === undefined ? 'text-primary pt-3' : ''}>
                {error?.title || error?.name || 'App Error'}
              </div>
            </h1>
            <code>{error?.description || error?.message}</code>
          </div>
        </SplashScreen>
      )
    }

    return children
  }
}

export default ErrorBoundary
