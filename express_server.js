const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

//implementing function to simulate generating a "unique" shortURL
const generateRandomString = function (length) {
  const chars =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const deleteURL = (url) => { 
  delete urlDatabase[url];
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const editURL = (url, shortURL) => {
  urlDatabase[shortURL] = url;
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.post("/logout", (req, res) => {
  //console.log()
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  //console.log(req.body, req.params);
  res.cookie('username', req.body.username);
  // const templateVars = {
  //   username: req.body['username'],
  // };
  console.log(req.body['username'])
  //res.render("urls_index", templateVars);
  res.redirect('/urls');
});
//=====>
app.post("/urls/:shortURL/edit", (req, res) => {
  console.log("request to edit from myURLs page: ", req.params.shortURL)
  const shortURL = req.params.shortURL;
  //deleteURL(req.params.shortURL);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  console.log("request to edit: ", req.body, req.params.shortURL)
  editURL(req.body.longURL, req.params.shortURL)
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("request to delete: ", req.params.shortURL)
  deleteURL(req.params.shortURL);
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString(6);
  const newLongURL = req.body.longURL;
  urlDatabase[newShortURL] = newLongURL; 
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = {shortURL, 
    longURL: urlDatabase[shortURL],
    username: req.cookies['username'],
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies['username'],
   };
   console.log(req.cookies)
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});