const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');


console.log("THIS IS ONLY FOR TESTING")
//Function to generate random userID
const generateRandomString = function (length) {
  const chars =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsLength = chars.length
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return result;
};

//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [/* secret keys */"secret"],
}))

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const users = {};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//DATA-HELPER FUNCTIONS:
const urlsForUser = (userID) => {
  let results = {};
  for (let shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (userID === url.userID) {
      results[shortURL] = url;
    }
  }

  return results;
}

const emailLookup = () => {
  
};

const deleteURL = (url) => { 
  delete urlDatabase[url];
};

const editURL = (url, shortURL) => {
  urlDatabase[shortURL].longURL = url;
};
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//REGISTER USER:

app.get("/register", (req, res) => {
  let templateVars = {currentUser: undefined}
  res.render("register", templateVars);
});


app.post('/register', (req, res) => {
  const newUserID = generateRandomString(6); //createRandomID
  //users.id =  newUserID //set ID to ID key
  let temp = {
    id: newUserID,
    email: req.body.email,
    password: req.body.password
  };
 
  if (temp['password'] === '' || temp['email'] === '') {
    console.log('empty')
    return res.status(404).send('Please enter an email and password.');
  }

//Check if user email already exists:
//TO DO: CREATE AN EMAIL LOOKUP HELPER FUNCTION

  let foundUser;
  for (const id in users) {
    if (users[id]['email'] === temp['email']) {
      foundUser = users[id];
      //console.log('FOUND: ' + foundUser)
      return res.status(400).send('Email already registered.');
    }
  }

  users[newUserID] = temp;

  //res.cookie('user_id', newUserID);
  req.session.user_id = newUserID;
  res.redirect('/urls');
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//LOGIN/LOGOUT:

app.get('/login', (req, res) => {
  let templateVars = {currentUser: undefined}
  res.render('login', templateVars);
});


app.post('/logout', (req, res) => {
  //res.clearCookie('user_id')
  req.session = null;
  res.redirect('/urls');
});


app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!password || !email) {
    return res.status(400).send('Please enter an email and password');
  }

  let foundUser;
  for (const id in users) {

    if (users[id]['email'] === email) {
      foundUser = users[id]['id'];
      if (users[id]['password'] !== password) {
       return res.status(403).send('1: User or password not found.');
      }
    } else {
      return res.status(403).send('2: User or password not found.');
    }
  };
console.log(foundUser)
  //res.cookie('user_id', foundUser);
  req.session.user_id = newUserID;
  res.redirect('/urls');
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// app.post("/urls/:shortURL/edit", (req, res) => {
//   console.log("request to edit from myURLs page: ", req.params.shortURL)
//   const shortURL = req.params.shortURL;
//   res.redirect(`/urls/${shortURL}`);
// });


app.post("/urls/:shortURL", (req, res) => {
  console.log("request to edit: ", req.body, req.params.shortURL)

  const userID = req.session.user_id;
  const url = urlDatabase[req.params.shortURL];

  if (userID !== url.userID) {
    return res.status(401).send("Error, cannot edit URL that does not belong to you");
  }

  editURL(req.body.longURL, req.params.shortURL)
  res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("request to delete: ", req.params.shortURL)
  const userID = req.session.user_id;
  const url = urlDatabase[req.params.shortURL];

  if (userID !== url.userID) {
    return res.status(401).send("Error, cannot delete URL that does not belong to you");
  }

  deleteURL(req.params.shortURL);
  res.redirect("/urls");
});

//CHECK THAT REDIRECT IS WORKING....
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  console.log('111: ' + Object.keys(req.params))
  console.log('2222:   ' + Object.keys(urlDatabase))
  const longURL =  urlDatabase[shortURL].longURL
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString(6);
  const newLongURL = req.body['longURL']
  console.log("CL: " + req.body['longURL'] + 'NEW:   ' + newLongURL)
  
  urlDatabase[newShortURL] = {
    longURL: newLongURL,
    userID: req.session['user_id'],
  }
  console.log(urlDatabase)
  
  res.redirect(`/urls/${newShortURL}`);
});


app.get("/urls/new", (req, res) => {
  const user = req.session['user_id'];
  
  console.log('AND HEEERE:    ' + Object.keys(urlDatabase))

  // let tmp = Object.entries(urlDatabase);
  // console.log('TMP: ' + tmp)

  // let results = '';
  // for(const key of tmp) {
  //   for (const item of key) {
  //     console.log('ITEM: ' + item)
  //     if(typeof item === typeof {}) {
  //       console.log('===> ' + item)
  //       console.log('=======> ' + item['longURL'])
  //       results += item['longURL']
  //     }
  //   }
  // }
  // const longURL = results
  // console.log('RESULTS: ' + results)
  
  if (!user) {
    res.redirect('/login')
  }

  const templateVars = {
    currentUser: req.session['user_id'],
  }

  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = urlDatabase[shortURL]['longURL']
  const user = req.session['user_id'];
  const url = urlDatabase[shortURL];

  if (!user) {
    return res.redirect("/login");
  }

  if (user !== url.userID) {
    return res.status(401).send("Error, can only view URLs you have created.")
  }
  
  const templateVars = {shortURL, 
    longURL: newLongURL, //
    currentUser: req.session['user_id'],
  };

  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlsForUser(req.session.user_id), 
    currentUser: users[req.session.user_id],
  };
  
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