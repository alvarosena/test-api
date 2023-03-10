const express = require('express')
const fauna = require('./databse')
const q = require('faunadb')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  return res.json({ message: 'hello, world' })
})

app.post('/api/v1/products', async (req, res) => {
  const { name, price } = req.body

  const product = await fauna.query(
    q.query.Create(
      q.query.Collection('products'),
      { data: { id: uuidv4(), name, price } }
    ),
  )

  return res.status(201).json(product)
})

app.get('/api/v1/products/all', async (req, res) => {
  const products = await fauna.query(
    q.Map(
      q.query.Paginate(q.Match(q.Index('findMany'))),
      q.query.Lambda(product => q.Get(product))
    )
  )

  return res.json(products)
})

app.delete('/api/v1/products/:id/delete', async (req, res) => {
  const { id } = req.params

  await fauna.query(
    q.Map(
      q.Paginate(q.Match(q.Index("findById"), id)),
      q.Lambda(
        "ref",
        q.Delete(q.Var("ref"))
    ))
  )

  return res.status(204).send()
})

const port = 3000 || process.env.PORT
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})

module.exports = app