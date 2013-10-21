/* jshint node:true */
/* global describe:true, before:true, after:true, it:true */
var server = require('../server.js'),
    request = require('supertest');

require('should');

describe('RESTAPI', function () {

    before(function (done) {
        server.start(done);
    });

    after(function (done) {
        server.stop(done);
    });

    describe('authenticate', function () {
        it('should return access token', function (done) {
            request('http://localhost:3000')
                .post('/api/v1/account/authenticate')
                .send({
                email: 'piotr@outof.me',
                password: '123456'
            })
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                if (err) {
                    throw err;
                }
                res.body.should.have.property('access_token').with.lengthOf(32);
                res.body.should.have.property('token_type', 'Bearer');
                done();
            });
        });
    });
});