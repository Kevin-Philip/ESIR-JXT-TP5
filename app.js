const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')

const usersRouter = require('./routes/users-v1')
const usersModel = require('./model/users')
const authRouter = require('./routes/auth-v1')
const idp = require('./model/idp')

require('dotenv').config()

const app = express()

let authChecker = (req, res, next) => {
  if (req.path === '/v1/auth/login' && req.method === 'POST') {
    next()
    return
  }

  if (!req.headers.authorization) {
    return res.status(401).send()
  }

  let token = req.headers.authorization.split(' ')[1]
  idp.verifyToken(token)
    .then(() => {
      next()
    })
    .catch(() => {
      res.status(401).json({
        message: "Unauthorized",
        type: "Unauthorized",
        code: 0
      })
    })
}

/* On vérifie que l'utilisateur est connecté avant chaque requête */
app.use(authChecker)

app.use(bodyParser.json())

// Activation de Helmet
app.use(helmet({noSniff: true}))

// On injecte le model dans les routers. Ceci permet de supprimer la dépendance
// directe entre les routers et le modele
app.use('/v1/users', usersRouter(usersModel))
app.use('/v1/auth', authRouter(idp))

// For unit tests
exports.app = app