const express = require('express')
const shortId = require('shortid')
const createHttpError = require('http-errors')
const mongoose = require('mongoose')
const path = require('path')
const ShortUrl = require('./models/url.model')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

mongoose
    .connect('mongodb://127.0.0.1:27017/url-shortner', {
        // dbName: 'url-shortner',
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        // useCreateIndex: true,
    })
    .then(() => console.log('Mongooose Connected Successfully 💾 ...'))
    .catch((error) => console.log('Error while connecting..'))

app.set('view engine', 'ejs')

const port = 8080;
const hostname = '127.0.30.04';

app.get('/', async (req, res, next) => {
    res.render('index')
})

app.post('/', async (req, res, next) => {
    try {
        const { url } = req.body
        if (!url) {
            throw createHttpError.BadRequest('Provide a Valid URL')
        }
        const urlExists = await ShortUrl.findOne({ url })
        if (urlExists) {
            res.render('index', {
                // short_url: `${req.hostname}/${urlExists.shortId}`,
                short_url: `http://localhost:8080/${urlExists.shortId}`,
            })
            return
        }
        const shortUrl = new ShortUrl({ url: url, shortId: shortId.generate() })
        const result = await shortUrl.save()
        res.render('index', {
            // short_url: `${req.hostname}/${urlExists.shortId}`,
            short_url: `http://localhost:8080/${result.shortId}`,
        })
    } catch (error) {
        next(error)
    }
})

app.get('/:shortId', async (req, res, next) => {
    try {
        const { shortId } = req.params
        const result = await ShortUrl.findOne({ shortId })
        if (!result) {
            throw createHttpError.NotFound('Short URL doesn\'t Exist')
        }
        res.redirect(result.url)
    } catch (error) {
        next(error)
    }
})

app.use((req, res, next) => {
    next(createHttpError.NotFound())
})
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('index', { error: err.message })
})

app.listen(port, () => {
    console.log(`Web🌎 is Live on ${hostname}:${port}`)
})