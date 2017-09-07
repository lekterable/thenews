const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport');

let User = require('../models/user')

router.get('/register', (req, res)=>{
  res.render('register')
})
//Rejestracja
router.post('/register', (req, res)=>{
  const name = req.body.name
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password
  const password2 = req.body.password2

  //Walidacja formularza
  req.checkBody('name', 'Imie jest wymagane').notEmpty()
  req.checkBody('email', 'Email jest wymagany').notEmpty()
  req.checkBody('email', 'Email nie jest prawidłowy').isEmail()
  req.checkBody('username', 'Nazwa użytkownika jest wymagana').notEmpty()
  req.checkBody('password', 'Hasło jest wymagane').notEmpty()
  req.checkBody('password2', 'Hasła nie są takie same').equals(req.body.password)

  let errors = req.validationErrors()
  if(errors)  {
    res.render('register', {
      errors: errors
    })
  } else {
    let newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    })
    //Hashowanie hasła
    bcrypt.genSalt(10, (err, salt)=>{
      bcrypt.hash(newUser.password, salt, (err, hash)=>{
        if(err){
          console.log(err)
        }
        newUser.password = hash
        newUser.save((err)=>{
          if(err){
          console.log(err)}
          else {
            req.flash('success', 'Zarejestrowano pomyślnie, możesz się zalogować')
            res.redirect('/users/login')
          }
        })
      })
    })
  }
})

//Formularz logowania
router.get('/login', (req, res)=>{
  res.render('login')
})

//Logowanie
router.post('/login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash:true
  })(req, res, next)
})

//Wylogowywanie
router.get('/logout', (req, res)=>{
  req.logout()
  req.flash('success', 'Wylogowano pomyślnie')
  res.redirect('/users/login')
})
module.exports = router
