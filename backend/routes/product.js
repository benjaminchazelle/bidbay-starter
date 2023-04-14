import express from 'express'
import { Product, Bid, User } from '../orm/index.js'
import authMiddleware from '../middlewares/auth.js'
import { getDetails } from '../validators/index.js'

const router = express.Router()

router.get('/api/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username']
      },
      {
        model: Bid,
        as: 'bids',
        attributes: ['id', 'price', 'productId', 'date']
      }]
    })

    res.json(products)
  } catch (error) {
    next(error)
  }
})

router.get('/api/products/:productId', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username']
      },
      {
        model: Bid,
        as: 'bids',
        attributes: ['id', 'price', 'productId', 'date'],
        include: {
          model: User,
          as: 'bidder',
          attributes: ['id', 'username']
        }
      }]
    })
    if (!product) {
      res.status(404).send()
    } else {
      res.status(200).json(product)
    }
  } catch (error) {
    next(error)
  }
})

// You can use the authMiddleware with req.user.id to authenticate your endpoint ;)

router.post('/api/products', authMiddleware, async (req, res, next) => {
  try {
    const { name, description, category, originalPrice, pictureUrl, endDate } = req.body
    const sellerId = req.user.id

    if (!name || !description || !category || !originalPrice || !pictureUrl || !endDate) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: 'Missing required fields' })
    }

    if (isNaN(originalPrice)) {
      return res.status(400).json({ error: 'Invalid or missing fields', details: 'Original price must be a number' })
    }

    const product = await Product.create({ name, description, category, originalPrice, pictureUrl, endDate, sellerId })
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
})

router.put('/api/products/:productId', authMiddleware, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId, {
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username']
      }]
    })
    if (!product) {
      res.status(404).send()
    } else if (product.sellerId !== req.user.id && !req.user.admin) { // Modified this line
      res.status(403).send()
    } else {
      const { name, description, category, originalPrice, pictureUrl, endDate } = req.body
      await product.update({ name, description, category, originalPrice, pictureUrl, endDate })
      res.json(product)
    }
  } catch (error) {
    next(error)
  }
})

router.delete('/api/products/:productId', authMiddleware, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId)
    if (!product) {
      res.status(404).send()
    } else if (product.sellerId !== req.user.id && !req.user.admin) {
      res.status(403).send()
    } else {
      await product.destroy()
      res.status(204).send()
    }
  } catch (error) {
    next(error)
  }
})

export default router
