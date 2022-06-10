import { NextApiResponse } from 'next'

const healthcheck = (_: never, res: NextApiResponse): void => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ status: 'ok' }))
}

export default healthcheck
