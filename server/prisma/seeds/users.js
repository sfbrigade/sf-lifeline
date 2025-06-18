import { User, Role } from '#models/user.js';
import prisma from '../client.js';

export async function seedUsers () {
  const names = [
    'Staff User',
    'Volunteer User',
    'First Responder',
    'John Doe',
    'Jane Doe',
  ];
  const roles = [Role.STAFF, Role.VOLUNTEER, Role.FIRST_RESPONDER, Role.ADMIN];

  const seedPromises = names.map((name, index) => {
    const tuple = name.split(' ');
    return seedUser(tuple[0], tuple[1], roles[index % roles.length]);
  });

  await Promise.all(seedPromises);
  console.log('Seeded multiple users successfully');
}

/**
 *
 * @param {string} first name
 * @param {string} last name
 * @param {Role} role user role
 */
export async function seedUser (first, last, role) {
  const now = new Date();
  const data = {};
  const user = new User(data);
  user.firstName = first;
  user.lastName = last;
  user.email = `${first}.${last}@test.com`;
  await user.setPassword('Abcd1234!');
  user.role = role;
  user.emailVerifiedAt = now;
  user.approvedAt = now;
  await prisma.user.create({ data });
}
