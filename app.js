const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");


const itemsSchema = {
    name: {
        type: String,
        required: [true, "This field cannot be empty!"]
    }
};

const Item = new mongoose.model("Item", itemsSchema);

const task1 = new Item({
    name: "Wake up"
});

const task2 = new Item({
    name: "Eat"
});

const task3 = new Item({
    name: "Code"
});

const defaultItems = [task1, task2, task3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find(function (err, items) {
        
        if(items.length === 0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Successfully inserted the elements to the database!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                listArray: items
            });
        }
    })
});


app.get("/:paramName", function(req, res){
    const newParam = _.capitalize(req.params.paramName);

    List.findOne({name: newParam}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: newParam,
                    items: defaultItems
                });
                list.save();
                console.log(newParam);
                res.redirect("/" + newParam);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    listArray: foundList.items
                });
            }
        }
    });
});



app.post("/", function (req, res) {
    
    let itemName = req.body.task;
    let listName = req.body.list;

    const newTask = new Item({
        name: itemName
    })

    if(listName === "Today"){
        newTask.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(newTask);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})

app.post("/delete", function(req, res){
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedId, function(err){
            if(err){
                console.log(err);
            }
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }  
})

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function () {
    console.log("The server is live on port 3000.");
})