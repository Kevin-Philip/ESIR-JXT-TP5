const chai = require('chai')
const chaiHttp = require('chai-http')
const {app} = require('../app')

chai.should()
chai.use(chaiHttp)

describe('Auth tests', () => {
  it('should login', done => {
    chai
      .request(app)
      .post('/v1/auth/login')
      .send({'login': 'pedro', 'password': 'pass'})
      .end((err, res) => {
        res
          .should
          .have
          .status(200)
        res.should.be.json
        res
          .body
          .should
          .be
          .a('object')
        res
          .body
          .should
          .have
          .property('access_token')
        res
          .body
          .should
          .have
          .property('expirity')
        done()
      })
  })

  it('should NOT login', done => {
    chai
      .request(app)
      .post('/v1/auth/login')
      .send({'login': 'pedro', 'password': 'fakepass'})
      .end((err, res) => {
        res
          .should
          .have
          .status(401)
        res.should.be.json
        res
          .body
          .should
          .be
          .a('object')
        res
          .body
          .should
          .have
          .property('code')
        res
          .body
          .should
          .have
          .property('type')
        res
          .body
          .should
          .have
          .property('message')
        done()
      })
  })

  it('should verify access', done => {
    chai
      .request(app)
      .post('/v1/auth/login')
      .send({'login': 'pedro', 'password': 'pass'})
      .end((err, res) => {
        chai
        .request(app)
        .get('/v1/auth/verifyaccess')
        .set('Authorization', `Bearer ${res.body.access_token}`)
        .end((err, res) => {
          res
            .should
            .have
            .status(200)
          res.should.be.json
          res
            .body
            .should
            .have
            .property('message')
          done()
        })
      })
    
  })

  it('should NOT verify access', done => {
    chai
      .request(app)
      .get('/v1/auth/verifyaccess')
      .set('Authorization', 'bearer faketoken')
      .end((err, res) => {
        res
          .should
          .have
          .status(401)
        res.should.be.json
        res
          .body
          .should
          .be
          .a('object')
        res
          .body
          .should
          .have
          .property('code')
        res
          .body
          .should
          .have
          .property('type')
        res
          .body
          .should
          .have
          .property('message')
        done()
      })
  })
})