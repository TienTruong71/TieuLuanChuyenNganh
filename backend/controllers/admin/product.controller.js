import Product from '../../models/productModel.js'

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category_id', 'category_name')
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
