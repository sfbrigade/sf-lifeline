// This file contains code that we reuse
// between our tests.

import helper from 'fastify-cli/helper.js';
import path from 'path';
import * as nodemailerMock from 'nodemailer-mock';
import quibble from 'quibble';
import { fileURLToPath } from 'url';
import { StatusCodes } from 'http-status-codes';

import { PrismaClient } from '@prisma/client';
import {
  Builder,
  fixturesIterator,
  Loader,
  Parser,
  Resolver,
} from '@getbigger-io/prisma-fixtures-cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AppPath = path.join(__dirname, '..', 'app.js');

// Environment variable overrides/additions for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = `${process.env.DATABASE_URL}_test`;

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

// Dependency mocks for testing
await quibble.esm('nodemailer', { default: nodemailerMock });

// Fill in this config with all the configurations
// needed for testing the application
function config () {
  return {};
}

// automatically build and tear down our instance
async function build (t, options = { trace: false }) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath];

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const logger = options?.trace
    ? {
        level: 'trace',
        transport: {
          target: 'pino-pretty',
          options: {
            destination: 2,
          },
        },
      }
    : false;
  const app = await helper.build(argv, config(), { logger });

  // clear sent mail
  nodemailerMock.mock.reset();

  // clear all the db tables
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
  t.prisma = prisma;

  // set up fixture loader
  const loader = new Loader();
  const resolver = new Resolver();
  const builder = new Builder(prisma, new Parser());
  t.loadFixtures = async function () {
    loader.load(path.resolve(__dirname, 'fixtures/db'));
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    for (const fixture of fixturesIterator(fixtures)) {
      await builder.build(fixture);
    }
  };

  // set up auth helper
  t.authenticate = async function (email, password) {
    const response = await app.inject().post('/api/v1/auth/login').payload({
      email,
      password,
    });
    if (!response.statusCode === StatusCodes.OK) {
      throw new Error();
    }
    // send back headers needed to authenticate
    return {
      cookie: response.headers['set-cookie']
        ?.split(';')
        .map((t) => t.trim())[0],
    };
  };

  // tear down our app after we are done
  t.after(async () => {
    await prisma.$disconnect();
    app.close();
  });

  return app;
}

export { config, build, nodemailerMock };
