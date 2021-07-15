//Server based js
let express = require("express") //Creates server easier using express
let mongodb = require("mongodb") //mongodb - database
let sanititizeHTML = require("sanitize-html") //for basic security
let app = express()
let db

//live project
let port = process.env.PORT
//localhost
if (port == null || port == "") {
  port = 3000
}
//port*

app.use(express.static("public"))

//needed to connect to mongodb database
let ConnectionString = "Connection_String_goes_here"

//connecting to database
mongodb.connect(ConnectionString, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
  db = client.db() // data(1*) from database
  app.listen(port) //port*
})

//Enable server to pass in arguments on post requests - middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//function(1*) for basic password protection
function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", 'Basic realm="Simple Todo App"')
  // console.log(req.headers.authorization)
  /*when you put a new password for the first time to see what it returns
  checking if password is correct */
  if (req.headers.authorization == "Basic YWRtaW46anM=") {
    next()
  } else {
    res.status(401).send("Authentication required")
  }
}
app.use(passwordProtected) //function(1*)

//page of the application
app.get("/", function (req, res) {
  db.collection("items") //loading data(1*) from database
    .find()
    .toArray(function (err, items) {
      res.send(
        /*loading the main html template for the page and sending data(2*)
        also using browser side js */
        `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id="create-form" action="/create-item" method="POST">
        <div class="d-flex align-items-center">
          <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary" >Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id="item-list" class="list-group pb-5">


    <!-- Generating items here -->


    </ul>
    
  </div>
<script>
let items = ${JSON.stringify(items) /* user will render later the data(2*) */} 
</script>
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
<script src="/browser.js"></script>
</body>
</html>
  `
        //loaded axios for server requests
      )
    })
})

//Creating item -> Browser sends request to /create-item  with content-text
app.post("/create-item", function (req, res) {
  safeText = sanititizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
  if (safeText) {
    db.collection("items").insertOne({ text: safeText }, function (err, info) {
      res.json(info.ops[0])
    })
  }
})

//Updating an existing item -> Browser sends request to /update-item with clicked items id and new content-text
app.post("/update-item", function (req, res) {
  safeText = sanititizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
  db.collection("items").findOneAndUpdate({ _id: new mongodb.ObjectId(req.body.id) }, { $set: { text: safeText } }, function () {
    res.send("Success") //response
  })
})

//Deleting an existing item  -> Browser sends request to /delete-item with clicked items id
app.post("/delete-item", function (req, res) {
  db.collection("items").deleteOne({ _id: new mongodb.ObjectId(req.body.id) }, function () {
    res.send("Success") //response
  })
})
