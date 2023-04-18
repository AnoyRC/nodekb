const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

//Bring in Models
let Article = require("../models/article");

//User Model
let User = require("../models/user");
//Add routes
router.get("/add", ensureAuthenticated, function (req, res) {
  res.render("add_article", {
    title: "Add Articles",
  });
});

//Get Single Articles
router.get("/:id", function (req, res) {
  Article.findById(req.params.id, function (err, article) {
    User.findById(article.author, function (err, user) {
      res.render("article", {
        article: article,
        author: user.name,
      });
    });
  });
});

//Add Submit POST Route
router.post(
  "/add",
  [
    check("title", "Title must not be empty").isLength({ min: 1 }),
    //check('author', 'Author must not be empty').isLength({ min: 1 }),
    check("body", "Body must not be empty").isLength({ min: 1 }),
  ],
  (req, res) => {
    //Get errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add_article", {
        title: "Add Article",
        errors: errors,
      });
    } else {
      let article = new Article();
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save((err) => {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Article Added");
          res.redirect("/");
        }
      });
    }
  }
);

//Load Edit form
router.get("/edit/:id", ensureAuthenticated, function (req, res) {
  Article.findById(req.params.id, function (err, article) {
    if (article.author != req.user._id) {
      req.flash("danger", "Not Authorized");
      res.redirect("/");
    }
    res.render("edit_article", {
      title: "Edit Article",
      article: article,
    });
  });
});

//Update Submit POST Route
router.post("/edit/:id", function (req, res) {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = { _id: req.params.id };

  Article.updateOne(query, article, function (err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Updated");
      res.redirect("/");
    }
  });
});

//delete id
router.delete("/:id", function (req, res) {
  if (!req.user._id) {
  }

  let query = { _id: req.params.id };

  Article.findById(req.params.id, function (err, article) {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, function (err) {
        if (err) {
          console.log(err);
        }
        res.send("Success");
      });
    }
  });
});

//Access control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.redirect("/users/login");
  }
}

module.exports = router;
