import type { RequestHandler } from 'express'

type Parser<T> = (input: unknown) => T
type Segment = 'params' | 'query' | 'body'

export function validate<T>(segment: Segment, parser: Parser<T>): RequestHandler {
  return (req, res, next) => {
    const parsed = parser(req[segment])
    res.locals.validated = res.locals.validated ?? {}
    res.locals.validated[segment] = parsed
    next()
  }
}
