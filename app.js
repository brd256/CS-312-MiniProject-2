// import expres
const express = require('express');
//import body-parser to handle data
const bodyParser = require('body-parser');
//import axios for making HTTP requests 
const axios = require('axios');
// create an express application
const app = express();
//define the port 
const PORT = 3000;

// configure express to use ejs as the view engine and serve static files
app.set('view engine', 'ejs');
app.use(express.static('public'));

// parse url-encoded form data from POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// a temporary array stoing posts in memory
let posts = [];




// home route: display all posts with optional filtering

app.get('/', (req, res) => {
  //get category filter from query parameter
  const filter = req.query.filter;
  /// filter if available
  const filteredPosts = filter ? posts.filter(p => p.category === filter) : posts;
  // render the index view with posts
  res.render('index', { posts: filteredPosts });
});




// route to create new posts

app.post('/create', async (req, res) => {
  // get data from the form 
  const { title, content, author, category } = req.body;

  let joke = '';
  try {
    const response = await axios.get(`https://v2.jokeapi.dev/joke/Any?type=single`);
    joke = response.data.joke || 'No joke found.';
  } catch (error) {
    console.error('JokeAPI error:', error.message);
    joke = 'Could not fetch a joke.';
  }

  const newPost = {
    //genertes id based on the timestamp
    id: Date.now(),
    title,
    content,
    author,
    category,
    // add a timestamp part seen on blog post
    timestamp: new Date().toLocaleString()
    ,joke // include the fetched joke
  };
  // add new post to rthe array
  posts.push(newPost);
  // redirect to home page
  res.redirect('/');
});




// Route to load edit form for a post
app.get('/edit/:id', (req, res) => {
  // find post by id
  const post = posts.find(p => p.id == req.params.id);
  // handle missing post will return and erorr
  if (!post) return res.status(404).send('Post not found');
  // render the edit.ejs with the selected post
  res.render('edit', { post });
});




// route rto handle sumbison 

app.post('/edit/:id', (req, res) => {
  // get data from the edit form
  const { title, content, author, category } = req.body;
  //find the index of post to update
  const postIndex = posts.findIndex(p => p.id == req.params.id);
  // handle missing post
  if (postIndex === -1) return res.status(404).send('Post not found');
  // update the post details
  posts[postIndex] = {
    // keep existing id and timestamp, update other fields
    ...posts[postIndex],
    title,
    content,
    author,
    category,
    //update the timestamp
    timestamp: new Date().toLocaleString()
  };
  // redirecting...
  res.redirect('/');
});




// route to delete a post using the id

app.get('/delete/:id', (req, res) => {
  // remove post from array
  posts = posts.filter(p => p.id != req.params.id);
  // redirect...
  res.redirect('/');
});




// starting the express server on defined porrt = 3000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

