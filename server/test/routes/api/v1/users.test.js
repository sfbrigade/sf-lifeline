import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import bcrypt from 'bcrypt';
import { build, nodemailerMock } from '../../../helper.js';

describe('/api/v1/users', () => {
  describe('POST /register', () => {
    it('should return valid results', async (t) => {
      const app = await build(t);

      const res = await app.inject().post('/api/v1/users/register').payload({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        role: 'FIRST_RESPONDER',
        password: 'test',
        licenseNumber: 'test',
      });

      assert.deepStrictEqual(res.statusCode, 201);

      const responseBody = JSON.parse(res.payload);

      assert.deepStrictEqual(responseBody.role, 'FIRST_RESPONDER');

      const record = await t.prisma.user.findUnique({
        where: { id: responseBody.id },
      });

      assert.deepStrictEqual(record.role, 'FIRST_RESPONDER');

      console.log(record.hashedPassword);
      bcrypt.compare('test', record.hashedPassword, function (err, result) {
        assert.deepStrictEqual(result, true);
      });

      const sentMails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(sentMails.length, 1);
      assert.deepStrictEqual(sentMails[0].to, 'john.doe@test.com');
      assert.deepStrictEqual(
        sentMails[0].subject,
        'SF Lifeline - Please Verify Your Email',
      );
    });
  });
});
