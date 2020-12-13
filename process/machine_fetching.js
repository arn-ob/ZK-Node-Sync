// ANCHOR Module Import
const axios = require('axios');
const ld = require('lodash')
const moment = require('moment')
const config_settings = require('./../config/settings')
const ZKLib = require('zklib');
const main_routers = require('./../data/machine_detials')
const routers = main_routers



// NOTE Router Sync with Fingerprint machine
const sync = (API_sync, ngrokJSON, Att_Data, IP, Port, Machine_Details) => {
    return new Promise((resolve, reject) => {

        console.log("Process Running");
        let parse_data = JSON.parse(Att_Data)
        const _filter_data = ld.filter(parse_data, e => {
            let a_1 = moment()
            let a_2 = moment(e.timestamp)
            let diffs = a_1.diff(a_2, 'days')

            if(diffs < config_settings.parse_date_diff){
                return e
            }
        })

        
        let requestTime = new Date().toISOString();
        let captureIP = IP;
        let capturePort = Port;
        let captureRequestData = JSON.stringify(_filter_data);
        let ngrokJSON_send = ngrokJSON;
        let timestamp = Number(new Date())


        const send_data = {
            requestTime: requestTime,
            captureIP: captureIP,
            capturePort: capturePort,
            captureRequestData: captureRequestData,
            ngrokJSON: ngrokJSON_send,
            timestamp: timestamp,
            Machine_Details: Machine_Details,
            device_id: config_settings.device_id,
        }

        axios.post(API_sync, send_data).then(function (response) {
            resolve(true)
        }).catch(function (error) {
            console.log("sync Error");
            resolve(false)
        });
    })
}



// ANCHOR Export to parent
module.exports = (machine_config, API_sync, API_config, ngrokJSON) => {
    
    let machine_details = routers[machine_config];
    const search = machine_details

    ZK = new ZKLib(search);

    // connect to access control device
    ZK.connect(function (err) {
        if (err) {
            console.log("Internal Error ZK")
        } else {
            // read the time info from th device
            ZK.getAttendance(function (err, att) {

                // disconnect from the device
                ZK.disconnect();

                if (err) {
                    console.log("Internal Error ZK")
                } else {
                    let jsonData = JSON.stringify(att);
                    let machine_details_descrbe = search;
                    sync(API_sync, ngrokJSON, jsonData, search.ip, search.port, machine_details_descrbe)
                }
            });
        }
    });
}
