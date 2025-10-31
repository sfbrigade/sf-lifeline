import fp from 'fastify-plugin';

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run cleanup every 5 minutes

async function cleanupExpiredOptions (prisma, logger) {
  try {
    const now = new Date();

    // Clean up expired registration options
    const deletedRegistrationOptions = await prisma.registrationOption.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    // Clean up expired authentication options
    const deletedAuthenticationOptions = await prisma.authenticationOption.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    if (deletedRegistrationOptions.count > 0 || deletedAuthenticationOptions.count > 0) {
      logger.info({
        registrationOptions: deletedRegistrationOptions.count,
        authenticationOptions: deletedAuthenticationOptions.count,
      }, 'Cleaned up expired passkey options');
    }
  } catch (error) {
    logger.error({ error }, 'Error cleaning up expired passkey options');
  }
}

const cleanupOptionsPlugin = fp(async (fastify) => {
  // Ensure prisma is available before starting cleanup
  if (!fastify.prisma) {
    throw new Error('Prisma plugin must be loaded before cleanup-options plugin');
  }

  // Start cleanup interval
  const cleanupInterval = setInterval(() => {
    cleanupExpiredOptions(fastify.prisma, fastify.log).catch((error) => {
      fastify.log.error({ error }, 'Cleanup task error');
    });
  }, CLEANUP_INTERVAL_MS);

  // Run cleanup once on startup (with a small delay to ensure DB is ready)
  setTimeout(() => {
    cleanupExpiredOptions(fastify.prisma, fastify.log).catch((error) => {
      fastify.log.error({ error }, 'Initial cleanup error');
    });
  }, 1000);

  // Clean up interval on server close
  fastify.addHook('onClose', async () => {
    clearInterval(cleanupInterval);
  });
});

export default cleanupOptionsPlugin;
