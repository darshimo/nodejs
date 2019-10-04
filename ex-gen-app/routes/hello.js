var express = require("express");
var { check, validationResult } = require('express-validator');
var router = express.Router();

var mysql = require("mysql");

var knex = require("knex")({
    dialect: "mysql",
    connection: {
        host: "localhost",
        user: "root",
        password: "",
        database: "my-nodeapp-db",
        charset: "utf8",
    },
});

var Bookshelf = require("bookshelf")(knex);

var MyData = Bookshelf.Model.extend({
    tableName: "mydata"
});

var mysql_setting = {
    host: "localhost",
    user: "root",
    password: "",
    database: "my-nodeapp-db",
};

router.get("/", function (req, res, next) {

    new MyData().fetchAll().then(function (collection) {
        var data = { title: "hello", content: collection.toArray() };
        res.render("hello/index", data);
    }).catch(function (err) {
        res.status(500).json({ error: true, data: { message: err.message } });
    });
});

router.get("/add", function (req, res, next) {
    var data = {
        title: "hello/add",
        content: "input new record",
        form: { name: "", mail: "", age: 0 }
    };
    res.render("hello/add", data);
});

router.post("/add", [
    check("name", "NAME は必ず入力してください。").not().isEmpty(),
    check("mail", "MAIL はメールアドレスを記入してください。").isEmail(),
    check("age", "AGE は年齢を入力してください。").isInt(),
], function (req, res, next) {

    var result = validationResult(req);
    if (!result.isEmpty()) {
        var re = '<ul class="error">';
        var result_arr = result.array();
        for (var n in result_arr) {
            re += '<li>' + result_arr[n].msg + '</li>';
        }
        re += '</ul>';
        var data = {
            title: "hello/add",
            content: re,
            form: req.body
        };
        res.render("hello/add", data);
    } else {
        new MyData(req.body).save().then((model) => {
            res.redirect("/hello");
        });
    }
});

router.get("/show", function (req, res, next) {
    var id = req.query.id;

    var connection = mysql.createConnection(mysql_setting);

    connection.connect();

    connection.query("SELECT * from mydata where id=?", id, function (error, results, fields) {
        if (error == null) {
            var data = {
                title: "hello/show",
                content: "record whose id = " + id + " : ",
                mydata: results[0],
            };
            res.render("hello/show", data);
        }
    });

    connection.end();
});

router.get("/edit", function (req, res, next) {
    var id = req.query.id;

    var connection = mysql.createConnection(mysql_setting);

    connection.connect();

    connection.query("SELECT * from mydata where id=?", id, function (error, results, fields) {
        if (error == null) {
            var data = {
                title: "hello/edit",
                content: "record whose id = " + id + " : ",
                mydata: results[0],
            };
            res.render("hello/edit", data);
        }
    });

    connection.end();
});

router.post("/edit", function (req, res, next) {
    var id = req.body.id;
    var nm = req.body.name;
    var ml = req.body.mail;
    var ag = req.body.age;
    var data = { "name": nm, "mail": ml, "age": ag };

    var connection = mysql.createConnection(mysql_setting);

    connection.connect();

    connection.query("update mydata set ? where id = ?", [data, id], function (error, results, fields) {
        res.redirect("/hello");
    });

    connection.end();
});

router.get("/delete", function (req, res, next) {
    var id = req.query.id;

    var connection = mysql.createConnection(mysql_setting);

    connection.connect();

    connection.query("SELECT * from mydata where id=?", id, function (error, results, fields) {
        if (error == null) {
            var data = {
                title: "hello/delete",
                content: "record whose id = " + id + " : ",
                mydata: results[0],
            };
            res.render("hello/delete", data);
        }
    });

    connection.end();
});

router.post("/delete", function (req, res, next) {
    var id = req.body.id;

    var connection = mysql.createConnection(mysql_setting);

    connection.connect();

    connection.query("delete from mydata where id=?", id, function (error, results, fields) {
        res.redirect("/hello");
    });

    connection.end();
});

router.get("/find", (req, res, next) => {
    var data = {
        title: "/hello/find",
        content: "input id : ",
        form: { fstr: "" },
        mydata: null
    };
    res.render("hello/find", data);
});

router.post("/find", (req, res, next) => {
    new MyData().where("id", "=", req.body.fstr).fetch().then((collection) => {
        var data = {
            title: "hello/find",
            content: "result of id " + req.body.fstr + " : ",
            form: req.body,
            mydata: collection
        };
        res.render("hello/find", data);
    });
});

router.get("/:page", (req, res, next) => {
    var pg = req.params.page;
    pg *= 1;
    if (pg < 1) { pg = 1; }
    new MyData().fetchPage({ page: pg, pageSize: 3 }).then((collection) => {
        var data = {
            title: "hello",
            content: collection.toArray(),
            pagination: collection.pagination
        };
        console.log(collection.pagination);
        res.render("hello/index", data);
    }).catch((err) => {
        res.status(500).json({ error: true, data: { message: err.message } });
    });
});

module.exports = router;