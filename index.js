const express = require('express');
const app = express();
const Joi = require('joi');
app.set('view engine','ejs');

app.use(log);

let products = [
    { id: 1, name: 'iPhone 12 Pro', price: 1099.99 },
    { id: 2, name: 'Samsung Galaxy S21', price: 999.99 },
    { id: 3, name: 'Sony PlayStation 5', price: 499.99 },
    { id: 4, name: 'MacBook Pro 16', price: 2399.99 },
    { id: 5, name: 'DJI Mavic Air 2', price: 799.99 },
];

const PORT = process.env.PORT || 3000;

function log(req, res, next) {
    const requestTime = new Date();
    console.log(`[ ${req.method} ${req.url} ${requestTime}] `);
    next();
}

app.use(express.json()); 

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
});

app.get('/', log, (req, res) => {
    res.render('home',{title:'home',products});
    //res.send(products);
});

app.get('/products/search', log, (req, res) => {
    const searchQuery = req.query.q;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    res.send(`Search Query: ${searchQuery}, Min Price: ${minPrice}, Max Price: ${maxPrice}`);
});

app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.filter(p => p.id === productId);
    const data={
        products:product,
    }

    if (!product) return res.status(404).send('Product not found.');

    res.render('productdetaills',{title:'home',data});
    // res.send(product);
});

app.post('/products', (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        price: Joi.number().min(0).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const product = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price,
    };

    products.push(product);
    res.send(product);
});

app.put('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);

    if (!product) return res.status(404).send('Product not found.');

    const schema = Joi.object({
        name: Joi.string().min(3).required(),
        price: Joi.number().min(0).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    product.name = req.body.name;
    product.price = req.body.price;
    res.send(product);
});

app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) return res.status(404).send('Product not found.');

    const deletedProduct = products.splice(productIndex, 1)[0];
    res.send(deletedProduct);
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

