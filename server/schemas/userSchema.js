import { z } from 'zod';

export default z.object({
  firstName: z
    .string()
    .min(2, 'First name must be between 2 and 30 characters long')
    .max(30, 'First name must be between 2 and 30 characters long'),

  middleName: z
    .string()
    .min(2, 'Middle name must be between 2 and 30 characters long')
    .max(30, 'Middle name must be between 2 and 30 characters long')
    .optional(),

  lastName: z
    .string()
    .min(2, 'Last name must be between 2 and 30 characters long')
    .max(30, 'Last name must be between 2 and 30 characters long'),

  email: z.string().email('Invalid email format'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must include uppercase, lowercase, number, and special character',
    ),

  licenseNumber: z.string().optional(),

  inviteId: z.string().optional(),
});
