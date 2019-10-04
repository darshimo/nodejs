var express = require("express");
var router = express.Router();

var data = [
    { name: "taro", age: 35, mail: "taro@yamada" },
    { name: "hanako", age: 29, mail: "hana@flower" },
    { name: "sachiko", age: 44, mail: "sachi@happy" },
];

router.get("/", function (req, res, next) {
    var n = req.query.id;
    res.json(data[n]);
});

module.exports = router;