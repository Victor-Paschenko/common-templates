const request = require('request');
const ENDPOINT = "ENDPOINT";

class ApiCaller {
    constructor(apiToken, apiVersion = "api/version") {
        this.apiToken = apiToken;
        this.apiVersion = apiVersion;
    }

    urlBuilder(actionUrl, queryParams = {}) {
        let query = '';
        if(Object.keys(queryParams).length > 0) {

            for(let key in queryParams) {
                if(query) {
                    query += '&'
                } else {
                    query += '?';
                };
                query += `${key}=${queryParams[key]}`;
            }
        }

        return `${ENDPOINT}${this.apiVersion}/${actionUrl}${query}`;
    }

    headers(headers = {}) {
        return Object.assign({}, {
            "X-API-KEY": this.apiToken
        }, headers);
    }


    get(url, headers = {}) {
        return new Promise((resolve, reject) => {
            request.get(url, {
                json: true,
                headers: this.headers(headers)
            }, (err, httpResponse, body) => {
                if(err) {
                    reject(err);
                }

                resolve(body);
            })
        })
    }

    post(url, body, headers = {}) {
        return new Promise((resolve, reject) => {
            request.post(url, {
                body,
                json: true,
                headers: this.headers(headers)
            }, (err, httpResponse, body) => {
                if(err) {
                    reject(err);
                }

                resolve(body);
            })
        })
    }
}

module.exports = ApiCaller;