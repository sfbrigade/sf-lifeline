#!/usr/bin/env node

// following copied from @fastify/secure-session/genkey.js
import sodium from 'sodium-native';
const buf = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);
sodium.randombytes_buf(buf);
// output as a hex string suitable for embedding in env vars
console.log(buf.toString('hex'));
