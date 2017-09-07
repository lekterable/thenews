const express = require('express')
const router = express.Router()

let Article = require('../models/article')
let User = require('../models/user')

//Artykuły
router.get('/edit/:id', ensureAuthenticated, (req, res)=>{
  Article.findById(req.params.id, (err, article)=>{
    if(article.author != req.user._id){
      req.flash('danger', 'Nie masz do tego uprawnień')
      res.redirect('/')
    }
    res.render('edit_article', {
      title:'Edytuj Artykuł',
      article: article
    })
  })
})

router.post('/edit/:id', (req, res)=>{
  let article = {}
  article.title = req.body.title
  article.author = req.body.author
  article.body = req.body.body

  let query = {_id:req.params.id}

  Article.update(query, article, (err)=>{
    if (err) {
      console.log(err)
      return
    } else {
      req.flash('success', 'Artykuł Edytowany')
      res.redirect('/')
    }
  })
})

router.delete('/:id', (req, res)=>{

  if(!req.user._id){
    res.status(500).send()
  }

  let query = {_id:req.params.id}

  Article.findById(req.params.id, (err, article)=>{
    if(article.author != req.user._id){
      res.status(500).send()
    } else {
      Article.remove(query, (err)=>{
        if(err) {
          console.log(err)
        }
        res.send('Success')
      })
    }
  })

})

router.get('/add', ensureAuthenticated, (req, res)=>{
  res.render('add_article', {
    title: 'Dodaj artykuł'
  })
})

router.post('/add', (req, res)=>{
  req.checkBody('title', 'Tytuł jest wymagany').notEmpty()
  req.checkBody('body', 'Treść jest wymagana').notEmpty()

  let errors = req.validationErrors()

  if(errors){
    res.render('add_article', {
      title:'Dodaj artykuł',
      errors:errors
    })
  } else {

  }

  let article = new Article()
  article.title = req.body.title
  article.author = req.user._id
  article.body = req.body.body

  article.save((err)=>{
    if (err) {
      console.log(err)
      return
    } else {
      req.flash('success', 'Artykuł Dodany')
      res.redirect('/')
    }
  })
})

router.get('/:id', (req, res)=>{
  Article.findById(req.params.id, (err, article)=>{
    User.findById(article.author, (err, user)=>{
      res.render('article', {
        article: article,
        author: user.name
      })
    })
  })
})

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated())
    return next()
  else {
    req.flash('danger', 'Zaloguj się')
    res.redirect('/users/login')
  }
}

module.exports = router
