const express = require('express')
const jwt = require('jsonwebtoken')
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
  
})

/** return a closure to initialize model */
module.exports = (model) => {
  idp = model
  return router
}
