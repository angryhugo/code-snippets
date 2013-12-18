require('./abstract-test');
var async = require('async');
var assert = require('assert');
var entityFactory = require('../app/models/entity-factory');
var User = entityFactory.User;

describe('test user model', function() {
    it('test create user', function(done) {
        var userObject = {
            id: '0001',
            email: 'test@test.com',
            password: '123456',
            name: 'test'
        };

        User.create(userObject).success(function(user) {
            assert.equal(user.id, '0001');
            done();
        }).error(function(err) {
            done(err);
        });
    });

    it('test update user', function(done) {
        var userObject = {
            id: '0001',
            email: 'test@test.com',
            password: '123456',
            name: 'test'
        };

        User.create(userObject).success(function(user) {
            user.name = 'newTest';
            user.save().success(function(newUser) {
                assert.equal(newUser.name, 'newTest');
                done();
            }).error(function(err) {
                done('update failure...');
            });
        }).error(function(err) {
            done('create failure...');
        });
    });
});