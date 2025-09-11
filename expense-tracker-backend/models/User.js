const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  static async updateProfile(id, name, email) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { name, email }
      });
      
      return user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      const user = await prisma.user.delete({
        where: { id }
      });
      return user;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async findByIdWithAccounts(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          accounts: {
            select: {
              id: true,
              name: true,
              type: true,
              balance: true,
            },
          },
        },
      });
      return user;
    } catch (error) {
      console.error('Error finding user by ID with accounts:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: updates,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

module.exports = User;
