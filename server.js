const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config({path : "./config.env"})
var path = require('path');
const app = express();
app.set('views', path.join(__dirname, 'frontend', 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/frontend'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     next();
// });
// app.use(cors());

const Razorpay=require("razorpay");

const razorpay=new Razorpay({
    key_id:'rzp_test_QJ6Y7G3p1zOqrc',
    key_secret:'L4hBgXCAhj5bviskr9OV5A2m'
});
const dbURI ='mongodb+srv://123:123@cluster0.b4ebesk.mongodb.net/?retryWrites=true&w=majority';

mongoose
    .connect(dbURI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Database Connected"))
    .catch((err) => console.log(err));
mongoose.Promise = global.Promise;
const itemLib = require("./backend/lib/itemlib");
const houseModel = require("./backend/models/house");
const adminModel = require("./backend/models/admin");
const userModel = require("./backend/models/user");
const checkauth = require("./backend/middleware/checkauth");
app.post("/order",(req,res)=>
{
    var options = {
        amount: 100,  
        currency: "INR"
      };
      razorpay.orders.create(options, function(err, order) {
        console.log(order,err);
        res.json(order);
      });
});
app.post("/is-order-complete/:houseid/:uid",(req, res)=>
{
    razorpay.payments.fetch(req.body.razorpay_payment_id).then((doc)=> {
        if(doc.status=="captured"){
            const userId = req.params.uid
            const houseId=req.params.houseid;
            itemLib.updateItemField({ _id: houseId }, { $set: { "occupiedStatus": true,"currentUser":userId, usersInterested: []}}, houseModel, (err, data) => {
                if (err) {
                    res.status(404).json({
                        message: err,
                    });
                } else {
                    itemLib.updateItemField({ _id:userId }, { $pull: { housesInterested: { houseId: houseId} }}, userModel, (err, data1) => {
                        if (err) {
                            res.status(404).json({
                                message: err,
                            });
                        } else {
                            itemLib.updateItemField({ _id:userId }, { $push: { housesJoined: { houseId: houseId } }}, userModel, (err, data1) => {
                                if (err) {
                                    res.status(404).json({
                                        message: err,
                                    });
                                }
                                else{
                                    res.redirect("/success");

                                }
                            });
                           

                        }
                    })
                }
            })
        }
        else
        res.redirect("/");
    })
});

app.post("/is-order-completed",(req, res)=>
{
    res.redirect("/success");
});

app.get("/", (req, res) => {
    res.render('home', { title: "home" })
})
app.get("/login", (req, res) => {
    res.render('login', { title: "home" })
})
app.get("/register", (req, res) => {
    res.render('register', { title: "home" })
})
app.get("/verify", (req, res) => {
    res.render('verify', { title: "home" })
})
app.get("/verifyadmin", (req, res) => {
    res.render('verifyadmin', { title: "home" })
})
app.get("/resend", (req, res) => {
    res.render('resend', { title: "home" })
})
app.get("/resendadmin", (req, res) => {
    res.render('resendadmin', { title: "home" })
})
app.get("/dashboard", (req, res) => {
    res.render('dashboard', { title: "home" })
})
app.get("/admin/dashboard", (req, res) => {
    res.render('admindashboard', { title: "home" })
})
app.get("/home/:homeid", (req, res) => {
    res.render('homedetail', { title: "home" })
})
app.get("/adminhome/:homeid", (req, res) => {
    res.render('adminhomedetails', { title: "home" })
})
app.get("/addhome", (req, res) => {
    res.render('addhouses', { title: "home" })
})
app.get("/updatehome/:id", (req, res) => {
    res.render('updatehome', { title: "home" })
})
app.get("/wishlist", (req, res) => {
    res.render('wishlist', { title: "home" })
})
app.get("/profile/", (req, res) => {
    res.render('updateprofile', { title: "home" })
})
app.get("/admin/profile/", (req, res) => {
    res.render('updateadminprofile', { title: "home" })
})
app.get("/signup/organiser", (req, res) => {
    res.render('organisersignup', { title: "home" })
})
app.get("/login/organiser", (req, res) => {
    res.render('adminlogin', { title: "home" })
})
app.get("/joinedhouses",(req, res) => {
    res.render("joinedhouses",{ title: "home" })
})
app.get("/acceptedhouses", (req, res) => {
    res.render('acceptedhouses', { title: "home" })
})
app.get("/success", (req, res) => {
    res.render('success', { title: "home" })
})
app.use("/api", require("./backend/api/allapiroutes"))

let PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})