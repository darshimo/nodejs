var express = require("express");
var ejs = require("ejs");

var app = express();
app.engine("ejs", ejs.renderFile);
app.use(express.static("public"));

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));


var data = {
    "taro": "taro@yamada",
    "hanako": "foo@bar",
    "ichiro": "ichi@baseball",
}

app.get("/", function (req, res) {
    var msg = "this is index page.<br>display data."
    res.render("index.ejs", { title: "index", content: msg, data: data, });
})

var server = app.listen(3000, function () {
    console.log("server is running.");
});