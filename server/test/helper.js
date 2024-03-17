// This file contains code that we reuse
// between our tests.

import helper from 'fastify-cli/helper.js';
import path from 'path';
import * as nodemailerMock from 'nodemailer-mock';
import quibble from 'quibble';
import { fileURLToPath } from 'url';

import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AppPath = path.join(__dirname, '..', 'app.js');

// Environment variable overrides/additions for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = `${process.env.DATABASE_URL}_test`;

// Dependency mocks for testing
await quibble.esm('nodemailer', { default: nodemailerMock });

// Fill in this config with all the configurations
// needed for testing the application
function config() {
  return {};
}

// automatically build and tear down our instance
async function build(t) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath];

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await helper.build(argv, config());

  // clear all the db tables
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
  await prisma.$connect();
  await prisma.$transaction([
    prisma.physician.deleteMany(),
    prisma.hospital.deleteMany(),
    prisma.condition.deleteMany(),
    prisma.medication.deleteMany(),
    prisma.allergy.deleteMany(),
    prisma.contact.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.invite.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  await prisma.$disconnect();

  // tear down our app after we are done
  t.after(() => app.close());

  return app;
}

export { config, build, nodemailerMock };
