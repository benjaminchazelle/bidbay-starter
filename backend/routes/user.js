import express from 'express'
import { User, Product, Bid } from '../orm/index.js'

const router = express.Router()

router.get('/api/users/:userId', async (req, res) => {

  try {

    let { userId } = req.params;

    let data = await User.findOne(
      {
        where: { id: userId },
        include: [{
          model: Product,
          as: 'products',
        },
        {
          model: Bid,
          as: 'bids',
          include: [{
            model: Product,
            as: 'product',
          }]
        }]

      }
    )

    if (!data) {
      res.status(404).send()
    } else {
      res.status(200).json(data);
    }

  } catch (error) {
    res.status(404).json({ error: "Invalid or missing fields", details: error })
  }

  res.status(600).send()
})

export default router
