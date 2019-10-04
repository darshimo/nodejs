var express = require('express');
var router = express.Router();

/* new */
var { check, validationResult } = require('express-validator');

var mysql = require('mysql');

var knex = require('knex')({
    dialect: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'my-nodeapp-db',
        charset: 'utf8'
    }
});

var Bookshelf = require('bookshelf')(knex);

var User = Bookshelf.Model.extend({
    tableName: 'users'
});

router.get('/add', (req, res, next) => {
    var data = {
        title: 'Users/Add',
        form: { name: '', password: '', comment: '' },
        content: 'input name,password,comment'
    }
    res.render('users/add', data);
});

router.post('/add', [
    check('name', 'input NAME').not().isEmpty(),
    check('password', 'input PASSWORD').not().isEmpty(),
], (req, res, next) => {
    var result = validationResult(req);
    if (!result.isEmpty()) {
        var content = '<ul class="error">';
        var result_arr = result.array();
        for (var n in result_arr) {
            content += '<li>' + result_arr[n].msg + '</li>'
        }
        content += '</ul>';
        var data = {
            title: 'Users/Add',
            content: content,
            form: req.body
        }
        res.render('users/add', data);
    } else {
        req.session.login = null;
        new User(req.body).save().then((model) => {
            res.redirect('/');
        });
    }
});

router.get('/', (req, res, next) => {
    var data = {
        title: 'Users/Login',
        form: { name: '', password: '' },
        content: 'input name, password'
    }
    res.render('users/login', data);
});

router.post('/', [
    check('name', 'input NAME').not().isEmpty(),
    check('password', 'input PASSWORD').not().isEmpty(),
], (req, res, next) => {
    var result = validationResult(req);
    if (!result.isEmpty()) {
        var content = '<ul class="error">';
        var result_arr = result.array();
        for (var n in result_arr) {
            content += '<li>' + result_arr[n].msg + '</li>'
        }
        content += '</ul>';
        var data = {
            title: 'Users/Login',
            content: content,
            form: req.body
        }
        res.render('users/login', data);
    } else {
        var nm = req.body.name;
        var pw = req.body.password;
        console.log("check");
        User.query({ where: { name: nm }, andWhere: { password: pw } })
            .fetch()
            .then((model) => {
                console.log("ok");
                req.session.login = model.attributes;
                var data = {
                    title: 'Users/Login',
                    content: '<p>You logined<br>back to toppage and send message</p>',
                    form: req.body
                };
                res.render('users/login', data);
            }).catch((err) => {
                console.log("ng");
                var data = {
                    title: 're-input',
                    content: '<p class="error">name or password is not correct</p>',
                    form: req.body
                };
                res.render('users/login', data);
            });
    }
});

module.exports = router;
