const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { users } = require('./mockUsers')

const loginUser = (username, password) => {
  return new Promise(async (resolve, reject) => {
    let foundUser = false

    for(user of users) {
      let { login } = user;
      if(login === username) {
        foundUser = true
        if(user.password === undefined) {
          return reject({type: "login_error", message: "Identifiant ou mot de passe incorrect.", code: 0})
        }
        let hashed_password = user.password
        try {
          let samePass = await bcrypt.compare(password, hashed_password)
          if(!samePass) {
            return reject({type: "login_error", message: "Identifiant ou mot de passe incorrect.", code: 0})
          }
        } catch (err) {
          return reject({type: "bcrypt", message: "Erreur du serveur.", code: 0})
        }
      }
    }

    if(!foundUser) {
      return reject({type: "login_error", message: "Identifiant ou mot de passe incorrect.", code: 0})
    }

    let exp = Math.floor(Date.now() / 1000) + (60 * 60)

    jwt.sign({exp , username}, process.env.SECRET_KEY, (err, token) => {
      let res
      if(err !== null) {
        res = undefined
      } else {
        res = {
          "access_token": token,
          "expirity": exp
        } 
      }
      if(res === undefined) {
        reject({
          type: "jwt_error",
          message: "Erreur du serveur.",
          code: 0,
        })
      } else {
        resolve(res)
      }
    })
  })
}

const verifyUser = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if(err !== null) {
        reject()
      } else {
        resolve()
      }
    })
  })
}

exports.loginUser = loginUser
exports.verifyUser = verifyUser