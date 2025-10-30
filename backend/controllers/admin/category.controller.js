import Category from '../../models/categoryModel.js'

// Lấy toàn bộ category
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
    res.json(categories)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Thêm mới category
export const createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body
    const category = new Category({ category_name, description })
    const created = await category.save()
    res.status(201).json(created)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
