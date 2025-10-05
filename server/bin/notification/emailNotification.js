import 'dotenv/config';

import mailer from '#helpers/email/mailer.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUsers () {
  const users = await prisma.user.findMany({
    where: { patientNotification: true },
    select: {
      email: true,
      firstName: true
    }
  });
  return users;
}

async function getPatient () {
  // Get start and end of today
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const patients = await prisma.patient.findMany({
    where: {
      updatedAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  return patients;
}

async function emailNotification () {
  try {
    const [users, patients] = await Promise.all([getUsers(), getPatient()]);

    // Check if there are users to notify and patients to report
    if (users.length === 0) {
      console.log('No users with patient notifications enabled');
      return;
    }

    if (patients.length === 0) {
      console.log('No patients updated today');
      return;
    }

    const result = await mailer.send({
      message: {
        to: users.map(user => user.email).join(','),
      },
      template: 'patientChanges',
      locals: {
        patients
      }
    });

    console.log('Notifications Email sent successfully');
    return result;
  } catch (error) {
    console.error('Notification failed to send:', error.message);
    throw error;
  }
}

emailNotification();
