const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const config = require('./config/database')

mongoose.connect(config.database,{
  useMongoClient: true,
})

let db = mongoose.connection

//Połączenie z bazą
db.once('open', ()=>{
  console.log('Connected to MongoDB')
})

//Błędy bazy
db.on('error', (err)=>{
  console.log(err)
})

//Aplikacja
const app = express()

//Modele
let Article = require('./models/article')

//Silnik szablonów
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
//Body Parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Folder publiczny
app.use(express.static(path.join(__dirname, 'public')))

//Express session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

//Express messages
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//Express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
      root    = namespace.shift(),
      formParam = root

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']'
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    }
  }
}))

//Passport config
require('./config/passport')(passport)

//Passport
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next)=>{
  res.locals.user = req.user || null
  next()
})

//Strona domowa
app.get('/', (req, res)=>{
  Article.find({}, (err, articles)=>{
    if(err)
      console.log(err)
    else {
      res.render('index', {
        title: 'Artykuły' ,
        articles: articles
      })
    }
  })
})

//Routing
app.use('/articles', require('./routes/articles'))
app.use('/users', require('./routes/users'))

//Start serwera
app.listen(3000, ()=>{
  console.log('Serwer działa na porcie 3000')
})
