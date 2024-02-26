'use strict'

import bcrypt from 'bcrypt';

// could be reimplamented with fastify-passport
export default async function (fastify, opts) {
    // add a login route that returns a login page
  fastify.get('/login', (req, res) => {
    // currently only redirects to login page
    res.redirect('/login')
  })

  // add a login route that handles the actual login
  fastify.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {

      const user = await fastify.prisma.user.findUnique({ email})
      if (!user) {
        res.status(401)
        res.send('No user with that email')
        return
      }

      const result = await bcrypt.compare(password, user.password)
      if (!result) {
        res.status(401)
        res.send('Invalid password')
        return
      }
      return req.session.authenticated = true
    }
    catch (error) {
      res.status(500)
      res.send('Internal Server Error')
    }

  });

  // add a logout route
  fastify.get('/logout', (req, res) => {
    if (req.session.authenticated) {
      req.session.destroy((err) => {
        if (err) {
          res.status(500)
          res.send('Internal Server Error')
        } else {
          res.redirect('/')
        }
      })
    } else {
      res.redirect('/')
    }
  });
}
