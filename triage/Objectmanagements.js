/**
 * Created by ilya.starostin on 4/1/2019.
 */
'use strict';
const configuration = require('../../configuration/Configuration');
const IDS_OFFSETS = configuration.adminHashingKeys;
const objectIdEnctypter = require('./ObjectIdEncrypter');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    encryptOrDecryptOutput: (role, data, encrypt) => {
        if(!data) {
            return;
        }

        if(data instanceof Array) {
            let elements = [];

            for(let currentItem of data) {
                let mappedData = module.exports.encryptOrDecryptOutput(role, currentItem, encrypt);
                elements.push(mappedData);
            }

            return elements;
        }

        if(data instanceof ObjectId || (typeof data === 'string' && data.length === 24)) {
            let parsed = null;

            try {
                parsed = new ObjectId(data);
            } catch(e) {
                return data;
            }

            let moved =  encrypt ? objectIdEnctypter.encrypt(parsed.toString(), IDS_OFFSETS[role]) : objectIdEnctypter.decrypt(parsed.toString(), IDS_OFFSETS[role]);

            return moved;
        }

        for(let prop in data) {
            if(data.hasOwnProperty(prop)) {
                let value = data[prop];

                if(value === null) {
                    continue;
                }

                if(value instanceof ObjectId || (typeof value === 'string' && value.length === 24)) {
                    let parsed = null;

                    try {
                        parsed = new ObjectId(value);
                    } catch(e) {
                        continue;
                    }

                    let moved =  encrypt ? objectIdEnctypter.encrypt(parsed.toString(), IDS_OFFSETS[role]) : objectIdEnctypter.decrypt(parsed.toString(), IDS_OFFSETS[role]);

                    data[prop] = moved;

                    continue;
                }

                if(value instanceof Array) {
                    let elements = [];

                    for(let currentItem of value) {
                        let mappedData = module.exports.encryptOrDecryptOutput(role, currentItem, encrypt);
                        elements.push(mappedData);
                    }

                    data[prop] = elements;
                    continue;
                }

                if(typeof value === 'object') {
                    let result = module.exports.encryptOrDecryptOutput(role, value, encrypt);
                    data[prop] = result;
                }
            }
        }

        return data;
    },
    encryptWithIgnore: (role, data, ignorePath = [], path = '') => {
        if(!data) {
            return;
        }

        if(data instanceof Array) {
            let elements = [];

            for(let currentItem of data) {
                let mappedData = module.exports.encryptWithIgnore(role, currentItem, ignorePath, path);
                elements.push(mappedData);
            }

            return elements;
        }

        if(data instanceof ObjectId || (typeof data === 'string' && data.length === 24)) {
            let parsed = null;

            try {
                parsed = new ObjectId(data);
            } catch(e) {
                return data;
            }

            if(ignorePath.includes(path)){
                return data;
            }

            return objectIdEnctypter.encrypt(parsed.toString(), IDS_OFFSETS[role]);
        }

        for(let prop in data) {
            if(data.hasOwnProperty(prop)) {
                let value = data[prop];
                let currentPath = `${path}.${prop}`;

                if(value === null) {
                    continue;
                }

                if(value instanceof ObjectId || (typeof value === 'string' && value.length === 24)) {
                    let parsed = null;
                    try {
                        parsed = new ObjectId(value);
                    } catch(e) {
                        continue;
                    }

                    if(!ignorePath.includes(currentPath)){
                        data[prop] = objectIdEnctypter.encrypt(parsed.toString(), IDS_OFFSETS[role]);
                    }                    

                    continue;
                }

                if(value instanceof Array) {
                    let elements = [];

                    for(let currentItem of value) {
                        let mappedData = module.exports.encryptWithIgnore(role, currentItem, ignorePath, currentPath);
                        elements.push(mappedData);
                    }

                    data[prop] = elements;
                    continue;
                }

                if(typeof value === 'object') {
                    let result = module.exports.encryptWithIgnore(role, value, ignorePath, currentPath);
                    data[prop] = result;
                }
            }
        }

        return data;
    }
};
