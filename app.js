var express = require('express');
var path = require('path');
var app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const port = process.env.port || 3000;
const Handlebars = require('handlebars');

Handlebars.registerHelper('formatReviews', function(reviews) {
  const review0 = reviews === 0 || reviews === "0";
  const rowClass = review0 ? 'a' : '';

  return new Handlebars.SafeString(`
    <tr class="${rowClass}">
      <td>${reviews}</td>
    </tr>
  `);
});

app.get('/allData', (req, res) => {
  const jsonFilePathB = path.join(__dirname, 'datasetB.json');

  // Read the JSON file asynchronously
  fs.readFile(jsonFilePathB, 'utf8', (err, data) => {
    if (err) {
      console.error('Error loading JSON data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      // Parse the JSON data
      const jsonData = JSON.parse(data);
      // Render the Handlebars template with the product data
      res.render('partials/allData', { id : jsonData });
    }
  });
});

app.use(express.static(path.join(__dirname, 'public')));

const exphbs = require('express-handlebars');
app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout:"main"}));
app.set('view engine', 'hbs');


app.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

app.get('/users', function(req, res) {
  res.send('respond with a resource');
});

app.use(bodyParser.urlencoded({ extended:true}));

let jsonData = [];
const fileData = "datasetB.json";

fs.readFile(fileData, 'utf8', (err, data) => {
  if (err) {
      console.error("Error reading JSON file:", err);
      throw err;
  }
  jsonData = JSON.parse(data);
  console.log("JSON data loaded successfully.");
});

//step4
app.get('/data', (req, res) =>{
    res.render('partials/data', { title: 'Json data', body: jsonData });
  });
  
//Step5
app.get('/data/product/:index', (req, res) =>{
 
    const index = parseInt(req.params.index);
    if (index >= 0 && index < jsonData.length) {
      const id = jsonData[index];
      res.render('partials/id',{ id });
    } else {
      res.status(404).render('partials/error',{ title: 'Error', message: 'Please Enter proper Index' });
    }  
  });


//step 6
app.use(express.urlencoded({ extended: true }));

app.get('/data/search', (req, res) => {
  res.render('partials/search');
});

app.post('/data/search', (req, res) => {
  const productId = req.body.asin;
  const productInfo = jsonData.find(id => id.asin === productId);
  if (productInfo) {
      res.render('partials/id', { id: productInfo });
  } else {
      res.status(404).render('partials/error', { title: 'Error', message: 'Product not found' });
  }
});
//step7

app.get('/data/search/prdName', (req, res, next) => {
  res.send(`<form method="POST" action="/data/search/prdName">
  <input type="text" name="productName" placeholder="Product Name">
  <input type="submit">
  </form>`);
});

app.post('/data/search/prdName', function (req, res) {
  const productName = req.body.productName;

  const data1 = app.products.filter(product => product.title.includes(productName));

  if (data1.length > 0) {
      const displayProducts = data1.map(product => ({
          asin: product.asin,
          title: product.title,
          price: product.price
      }));

      res.json(data1);
  } else {
      res.status(404).send('Product Not Found');
  }
});





app.get('*', function(req, res) {
  res.render('error', { title: 'Error', message:'Wrong Route' });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})