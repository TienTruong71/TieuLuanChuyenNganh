import Role from '../models/roleModel.js'
import colors from 'colors'

const seedRoles = async () => {
  try {
    console.log('Checking roles in database...'.cyan)

    const requiredRoles = ['admin', 'customer', 'inventory', 'service', 'sale']

    for (const roleName of requiredRoles) {
      const existingRole = await Role.findOne({ role_name: roleName })

      if (!existingRole) {
        await Role.create({ role_name: roleName })
        console.log(`Created role: ${roleName}`.green)
      } else {
        console.log(`⏭Role already exists: ${roleName}`.gray)
      }
    }

    console.log('Role seeding completed!'.green.bold)
  } catch (error) {
    console.error('Error seeding roles:'.red.bold, error.message)
  }
}

export default seedRoles