import prisma from '../client.js';

export async function seedPasskeys() {
  // Get the first user to associate passkeys with
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No users found. Skipping passkey seeding.');
    return;
  }

  const passkeyData = [
    {
      id: 'cred_1234567890abcdef',
      credPublicKey: Buffer.from('mock_public_key_data_1', 'utf8'),
      internalUserId: user.id,
      webauthnUserId: 'webauthn_user_1',
      counter: 1,
      backupEligible: true,
      backupStatus: false,
      transports: 'internal,usb',
      createdAt: new Date(),
      lastUsed: new Date(),
    },
    {
      id: 'cred_abcdef1234567890',
      credPublicKey: Buffer.from('mock_public_key_data_2', 'utf8'),
      internalUserId: user.id,
      webauthnUserId: 'webauthn_user_2',
      counter: 5,
      backupEligible: false,
      backupStatus: false,
      transports: 'nfc,ble',
      createdAt: new Date(),
      lastUsed: null,
    },
  ];

  for (const passkey of passkeyData) {
    await prisma.passkey.create({
      data: passkey,
    });
  }

  console.log('Seeded passkeys successfully');
}

/**
 * Create a passkey for a specific user
 * @param {string} userId - The user ID to associate the passkey with
 * @param {object} passkeyData - The passkey data
 */
export async function seedPasskey(userId, passkeyData) {
  const data = {
    id: passkeyData.id,
    credPublicKey: Buffer.from(passkeyData.credPublicKey, 'utf8'),
    internalUserId: userId,
    webauthnUserId: passkeyData.webauthnUserId,
    counter: passkeyData.counter || 0,
    backupEligible: passkeyData.backupEligible || false,
    backupStatus: passkeyData.backupStatus || false,
    transports: passkeyData.transports || null,
    createdAt: new Date(),
    lastUsed: passkeyData.lastUsed || null,
  };

  return await prisma.passkey.create({ data });
}
