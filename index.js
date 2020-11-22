const express=require('express')
const mongoose=require('mongoose')
const app=express()
const bodyParser=require("body-parser");
const session = require('express-session')
const passport=require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy = require('passport-local').Strategy;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs")
PORT=3000

app.use(session({
  secret:"this is secret",//key must be inside env variable
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://Localhost:27017/personalAssistant",{useNewUrlParser:true})
mongoose.set("useCreateIndex",true)
var name;

//schema for signup
const signupsc=new mongoose.Schema({
  
  Name:String,
  Username:String,
  Email:String,
  password:String
})

//passport
signupsc.plugin(passportLocalMongoose)


//model creation
const User= new mongoose.model("userDetail",signupsc)


//passport local strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//get req for signup
app.get("/signup",function(req,res){
  res.render("membership",{clss:"",errormssg:""})

})
//post req for signup
app.post('/signup',function(req,res){

  User.find({username:req.body.username},function(err,result){
    if(result.length!=0)
    {
      res.render("membership",{clss:"error",errormssg:"This username is already taken please try another one"})
    }
    else{
      //res.render("thankyou",{heading:"Membership processed successfully",subheading:"Welcome to personal assistant"})
      var Users=new User({Name:req.body.name,username:req.body.username,Email:req.body.email})
      User.register(Users,req.body.password,function(err,user){
        if(err)
        {
          console.log(err)
          res.redirect("/signup")
        }
        else{
          res.render("thankyou",{heading:"Membership processed successfully",subheading:"Welcome to personal assistant"})
        }

      })
     }
  })
})

// get req for login
app.get("/login",function(req,res){
  res.render("login",{clss:"",errormssg:""})

})
//post req for login
app.post("/login",function(req,res){
 const user=new User({
   username:req.body.username,
   password:req.body.password
 })
 req.login(user,function(err){
   if(err)
   {
     console.log(err)
   }
   else{
    passport.authenticate("local",{failureRedirect: '/loginf' })(req,res,function(){
      User.find({username:req.body.username},function(err,res){
        name=res[0]

      })
      res.redirect("/main")
    })
   }

 })
})
// get req if login fails
app.get("/loginf",function(req,res){
  res.render("login",{clss:"error",errormssg:"Your username or password is incorrect"})
})

//get req for logout
app.get("/logout",function(req,res){
  req.logout()
  res.redirect("/")
})

//get req on main page after successful login
app.get("/main",function(req,res){
  res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  if(req.isAuthenticated())
  {
    res.render("mainpage",{username:name.username,name:name.Name,email:name.Email})
    
  }
  else{
    res.render("login",{clss:"error",errormssg:"Login First"})
  }
})

//get req for bookings page
app.get("/bookings",function(req,res){
  res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  if(req.isAuthenticated())
  res.render("bookings",{username:name.username})
  else
  res.render("login",{clss:"error",errormssg:"Login First"})
})

//get req on task page
app.get("/task",function(req,res){
  res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  if(req.isAuthenticated())
  res.render("form",{err:"",mssg:"",username:name.username,heading:"Task Remainder",name:"event"})
  else
  res.render("login",{clss:"error",errormssg:"login First"})
})

//post req on task page

const task=new mongoose.Schema({
  
  id:String,
  Username:String,
  EventName:String,
  Date:String,
  Description:String
})
const tasks= new mongoose.model("task",task)

app.post("/event",function(req,res){
  res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  if(req.isAuthenticated()){
  res.render("form",{err:"error",mssg:"Added to event list successfully",username:name.username,heading:"Task Remainder",name:"event"})

  const var2=new tasks({
    id:name._id,
  Username:name.username,
  EventName:req.body.eventname,
  Date:req.body.date,
  Description:req.body.eventdesc
  })
  var2.save()
}
else
res.render("login",{clss:"error",errormssg:"login First"})
})

//get req on bookingform page
app.get("/bookingForm",function(req,res){
  res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  if(req.isAuthenticated())
  res.render("form",{err:"",mssg:"",username:name.username,heading:"Bookings",name:"Booking"})
  else
  res.render("login",{clss:"error",errormssg:"login First"})
})

//post req on bookingform

const book=new mongoose.Schema({
  
  id:String,
  Username:String,
  BookingName:String,
  Date:String,
  Description:String
})

const bookings= new mongoose.model("book",book)

app.post("/booking",function(req,res){
  res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  if(req.isAuthenticated()){
  const var2=new bookings({
    id:name._id,
  Username:name.username,
  BookingName:req.body.eventname,
  Date:req.body.date,
  Description:req.body.eventdesc
  })
  var2.save()

  res.render("form",{err:"error",mssg:"Added to bookings list successfully",username:name.username,heading:"Bookings",name:"Booking"})
}
else
res.render("login",{clss:"error",errormssg:"login First"})
})



//add new route
app.get('/taskm', function(req, res) {
  res.header('Cache-Control','no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
  if(req.isAuthenticated())
  res.render("taskm")
  else
  res.render("login",{clss:"error",errormssg:"login First"})
});



//listening on port 3000
app.listen(PORT,function(){
    console.log("running")
});