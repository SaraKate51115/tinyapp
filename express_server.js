const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

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

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const deleteURL = (url) => {
  delete urlDatabase[url];
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
//
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString(6);
  //console.log(newShortURL); //random short URL generated
  const newLongURL = req.body.longURL;
  //console.log(newLongURL) //longURL input from browser
  urlDatabase[newShortURL] = newLongURL; //set input url to new shortURL key in database
  //console.log(urlDatabase);
  //res.send("Ok");  //=> tell browser to go to new page
  res.redirect(`/urls/${newShortURL}`);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const templateVars = {shortURL, longURL: urlDatabase[shortURL]}; //chnageged to new
  res.render("urls_show", templateVars);
});

//pass the url data to our template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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