const express = require('express')
const router = express.Router()

let idp = undefined

/* Control idp initialisation */
router.use((req, res, next) => {
  /* istanbul ignore if */
  if (!idp) {
    res
      .status(500)
      .json({message: 'idp not initialised'})
  }
  next()
})

router.post('/login', (req, res) => {
  const { login: username, password } = req.body;
  
  idp.loginUser(username, password)
    .then((result) => {
      res.json(result)
    })
    .catch((result) => {
      res.status(401).json(result)
    })
})

router.get('/verifyaccess', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).send()
  }
  let token = req.headers.authorization.split(' ')[1]
  idp.verifyToken(token)
    .then(() => {
      res.status(200).json({
        message: "OK"
      })
    })
    .catch(() => {
      res.status(401).json({
        message: "Unauthorized",
        type: "Unauthorized",
        code: 0
      })
    })

})

/** return a closure to initialize model */
module.exports = (model) => {
  idp = model
  return router
}
