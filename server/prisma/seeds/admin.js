import { User, Role } from '../../models/user.js';
import prisma from '../client.js';

export async function seedAdminUser () {
  const now = new Date();
  const data = {};
  const user = new User(data);
  user.firstName = 'Admin';
  user.lastName = 'User';
  user.email = 'admin.user@test.com';
  await user.setPassword('Abcd1234!');
  user.role = Role.ADMIN;
  user.emailVerifiedAt = now;
  user.approvedAt = now;
  await prisma.user.create({ data });
  console.log('Admin User seeded successfully');
}

export default seedAdminUser;
