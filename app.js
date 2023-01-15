const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const cookieParser = require('cookie-parser');

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use(cookieParser());

const items = ["Code", "Eat", "Sleep"];

app.get("/", function(req, res) {
    if(req.cookies.name == null)
        res.render("login");
    else {
        res.render("list", {
            listTitle: req.cookies.name,
            listArray: items
        });
    }
});

app.post("/", function(req, res){
    let item = req.body.task;
        items.push(item);
        res.redirect("/");
    }
);

app.get("/reset", function(req, res){
    res.clearCookie('name');
    res.redirect("/");
});

app.get("/list", function(req, res){
    if(req.query.username != null){
        res.cookie("name", req.query.username);
        res.render("list", {
            listTitle: req.query.username,
            listArray: items
        });
    } else if(req.cookies.name != null){
        res.render("list", {
            listTitle: req.cookies.name,
            listArray: items
        });
    } else {
        res.redirect("/");
    }
})

app.listen("3000", () => console.log("The server is live on port 3000."));


