// ANCHOR Tunnel Fetching and get the tunnel result
const { exec } = require('child_process');


module.exports = async (isNgrokStart) => {
    return new Promise((resolve, reject) => {
        
        const fetch = require('node-fetch')
        let ngrokJSON = "";
        
        if(isNgrokStart){
           
            fetch('http://localhost:4040/api/tunnels').then(res => res.json())
            .then(json => {
                console.log("Ngrok Data Fatched")
                ngrokJSON = JSON.stringify(json)
                resolve(ngrokJSON)
            })
            .catch(err => {
                if (err.code === 'ECONNREFUSED') {
                    ngrokJSON = '';
                    console.error("Looks like you're not running ngrok.")
                    exec('killall ngrok')
                    exec('ngrok tcp 22')
                    resolve(ngrokJSON)
                }
                console.error("Error ngrok")
            })
        } else {
            ngrokJSON = 'Not running or Connected'
            exec('killall ngrok')
            exec('ngrok tcp 22')   
            resolve(ngrokJSON)
        }
    })
}