const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query)
})

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  const d = new Date()
  if (req.method === 'POST') {
    req.body.createdAt = d.toISOString().slice(0, 10)
    req.body.updatedAt = d.toISOString().slice(0, 10)
  } else if (req.method === 'PUT') {
    req.body.updatedAt = d.toISOString().slice(0, 10)
  }
  // Continue to JSON Server router
  next()
})

// In this example, returned resources will be wrapped in a body property
router.render = (req, res) => {
  const headers = res.getHeaders()

  const totalCountHeaders = headers['x-total-count']

  if (req.method === 'GET' && totalCountHeaders) {
    const result = {
      data: res.locals.data,
      pagination: {
        _totalRows: +totalCountHeaders
      }
    }
    return res.jsonp(result)
  }

  res.jsonp(res.locals.data)
}

// Use default router
server.use('/api', router)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log('JSON Server is running')
})