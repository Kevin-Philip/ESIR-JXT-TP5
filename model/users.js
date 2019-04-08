const uuidv1 = require('uuid/v1')
const tcomb = require('tcomb')
const bcrypt = require('bcrypt')

const USER = tcomb.struct({
    id: tcomb.String,
    name: tcomb.String,
    login: tcomb.String,
    age: tcomb.Number,
    password: tcomb.String,
}, {strict: true})

const users = [
    {
        id: '45745c60-7b1a-11e8-9c9c-2d42b21b1a3e',
        name: 'Pedro Ramirez',
        login: 'pedro',
        age: 44
    }, {
        id: '456897d-98a8-78d8-4565-2d42b21b1a3e',
        name: 'Jesse Jones',
        login: 'jesse',
        age: 48
    }, {
        id: '987sd88a-45q6-78d8-4565-2d42b21b1a3e',
        name: 'Rose Doolan',
        login: 'rose',
        age: 36
    }, {
        id: '654de540-877a-65e5-4565-2d42b21b1a3e',
        name: 'Sid Ketchum',
        login: 'sid',
        age: 56
    }
]

const removePasswordFromFields = (user) => {
    let userWOPassword = Object.assign({}, user)
    delete userWOPassword['password']
    return userWOPassword
}

const generatePassword = async (password) => {
    let salt = process.env.PASSWORD_SALT
    let hashed_password = await bcrypt.hash(password, salt)
    return hashed_password
}

const get = (id) => {
    const usersFound = users.filter((user) => user.id === id)
    return usersFound.length >= 1
        ? removePasswordFromFields(usersFound[0])
        : undefined
}

const getAll = () => {
    return users.map((user) => { return removePasswordFromFields(user) })
}

const add = async (user) => {
    let hashed_password = await generatePassword(user['password'])
    user['password'] = hashed_password
    const newUser = {
        ...user,
        id: uuidv1()
    }
    if (validateUser(newUser)) {
        users.push(newUser)
    } else {
        throw new Error('user.not.valid')
    }
    return removePasswordFromFields(newUser)
}

const update = async (id, newUserProperties) => {
    const usersFound = users.filter((user) => user.id === id)

    if (usersFound.length === 1) {
        const oldUser = usersFound[0]

        // Si un nouveau password est donnée
        if(Object.keys(newUserProperties).indexOf('password') !== -1) {
            let hashed_password = await generatePassword(newUserProperties['password'])
            newUserProperties['password'] = hashed_password
        }

        const newUser = {
            ...oldUser,
            ...newUserProperties
        }

        // Control data to patch
        if (validateUser(newUser)) {
            // Object.assign permet d'éviter la suppression de l'ancien élément puis l'ajout
            // du nouveau Il assigne à l'ancien objet toutes les propriétés du nouveau
            Object.assign(oldUser, newUser)
            return removePasswordFromFields(oldUser)
        } else {
            throw new Error('user.not.valid')
        }
    } else {
        throw new Error('user.not.found')
    }
}

const remove = (id) => {
    const indexFound = users.findIndex((user) => user.id === id)
    if (indexFound > -1) {
        users.splice(indexFound, 1)
    } else {
        throw new Error('user.not.found')
    }
}

function validateUser(user) {
    let result = false
    /* istanbul ignore else */
    if (user) {
        try {
            const tcombUser = USER(user)
            result = true
        } catch (exc) {
            result = false
        }
    }
    return result
}

exports.get = get
exports.getAll = getAll
exports.add = add
exports.update = update
exports.remove = remove