const express = require('express')
const app = express()
const axios = require('axios');
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' })) // parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '50mb' }))                          // parse application/json

// NOTE Child Process for Executre ngrok cmd
const { exec } = require('child_process');

// NOTE Node cron project
const cron1 = require("node-cron");


// ANCHOR App running Port 
const port = 0000;

// ANCHOR Server API links
const API_sync = 'https://*******************/sync'
const API_start = 'https://*******************/notice'
const API_confgi = 'https://*******************/config'


// Process
const tunnel_fetching = require('./process/tunnel_fetching')
const machine_fetching = require('./process/machine_fetching')

// Consts
let isNgrokStart = true;
let ngrokJSON = '';


cron1.schedule("*/20 * * * *", async function () {
    config(ngrokJSON)
    await tunnel_fetching(isNgrokStart).then(res => ngrokJSON = res)
    machine_fetching(0, API_sync, API_confgi, ngrokJSON)
});

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
    process.exit(1)
})

app.get('/', (req, res) => res.send('API ok'))

// NOTE Testing With ID
app.get('/test/:id', async (req, res) => {

    let prms = Number(req.params.id)
    config(ngrokJSON)
    await tunnel_fetching(isNgrokStart).then(res => ngrokJSON = res)
    await machine_fetching(prms, API_sync, API_confgi, ngrokJSON)
})


// NOTE Config For ngrok JSON
const config = (ngrokJSON) => {
    let send_data = { acc: "******", ngrokJSON: ngrokJSON }
    axios.post(API_confgi, send_data)
        .then(function (response) { })
        .catch(function (error) {
            console.log("Internal Error");
        });
}


app.listen(port, () => {

    // Kill If Running
    exec('killall ngrok')
    axios.post(API_start, { start: 'Start Message' }).then(function (response) {
        config(ngrokJSON)
    }).catch(function (error) {
        console.log("ngrok main connection Error");
    });

    exec('ngrok tcp 22', (e) => {
        if (e) {
            isNgrokStart = false
            console.log("Ngrok Start Conn Error")
            exec('killall ngrok')
        } else {
            isNgrokStart = true
            console.log("Data Update")
        }
    })

    console.log(`Listening on port ${port}!`)
})
