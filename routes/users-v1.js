const express = require('express')
const router = express.Router()

let usersModel = undefined
let idp = undefined

/* Control usermodel initialisation */
router.use((req, res, next) => {
  /* istanbul ignore if */
  if (!usersModel || !idp) {
    res
      .status(500)
      .json({message: 'model not initialised'})
  }
  next()
})


/* On vérifie que l'utilisateur est connecté avant chaque requête */
router.use((req, res, next) => {
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
})

/* GET a specific user by id */
router.get('/:id', function (req, res, next) {
  const id = req.params.id

  /* istanbul ignore else */
  if (id) {
    try {
      const userFound = usersModel.get(id)
      if (userFound) {
        res.json(userFound)
      } else {
        res
          .status(404)
          .json({message: `User not found with id ${id}`})
      }
    } catch (exc) {
      /* istanbul ignore next */
      res
        .status(400)
        .json({message: exc.message})
    }

  } else {
    res
      .status(400)
      .json({message: 'Wrong parameter'})
  }
})

/* Add a new user. */
router.post('/', async (req, res, next) => {
  const newUser = req.body

  /* istanbul ignore else */
  if (newUser) {
    try {
      const user = await usersModel.add(newUser)
      req
        .res
        .status(201)
        .send(user)
    } catch (exc) {
      res
        .status(400)
        .json({message: exc.message})
    }
  } else {
    res
      .status(400)
      .json({message: 'Wrong parameters'})
  }
})

/* Update a specific user */
router.patch('/:id', async (req, res, next) => {
  const id = req.params.id
  const newUserProperties = req.body

  /* istanbul ignore else */
  if (id && newUserProperties) {
    try {
      const updated = await usersModel.update(id, newUserProperties)
      res
        .status(200)
        .json(updated)

    } catch (exc) {

      if (exc.message === 'user.not.found') {
        res
          .status(404)
          .json({message: `User not found with id ${id}`})
      } else {
        res
          .status(400)
          .json({message: 'Invalid user data'})
      }
    }
  } else {
    res
      .status(400)
      .json({message: 'Wrong parameters'})
  }
})

/* REMOVE a specific user by id */
router.delete('/:id', function (req, res, next) {
  const id = req.params.id

  /* istanbul ignore else */
  if (id) {
    try {
      usersModel.remove(id)
      req
        .res
        .status(200)
        .end()
    } catch (exc) {
      /* istanbul ignore else */
      if (exc.message === 'user.not.found') {
        res
          .status(404)
          .json({message: `User not found with id ${id}`})
      } else {
        res
          .status(400)
          .json({message: exc.message})
      }
    }
  } else {
    res
      .status(400)
      .json({message: 'Wrong parameter'})
  }
})

/* GET all users */
router.get('/', function (req, res, next) {
  res.json(usersModel.getAll())
})

/** return a closure to initialize model */
module.exports = (userModel, idpModel) => {
  usersModel = userModel
  idp = idpModel
  return router
}
