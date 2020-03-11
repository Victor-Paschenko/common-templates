const S3Service = require('../services/s3');
const {key, secret, bucketName} = require('../configs/s3.json');
const s3 = new S3Service(key, secret, bucketName);
const csv = require('ya-csv');
const ContactProvider = require('../providers/contact');
const _ = require('lodash');
const contactsFields = _.sortBy(require('../configs/contactFields.json'), m => m.label);

const recursiveList = (filters, limit, callback, offset = 0) => {
    return ContactProvider.list({
                filters,
                limit,
                offset,
                newConnection: true
        }).then(contacts => {
            callback(contacts);

            if(contacts.length >= limit){
                return recursiveList(filters, limit, callback, offset + limit);
            }

            return true;
        })
}

const queueProcessor = async job => {
    const { data } = job;    
    const filters = data.filters || {};

    const objects = await s3.listObjects();

    const stream = require('stream');
    const passWriter = new stream.PassThrough();
    const muData = await s3.createMultipartUpload('test_upload/key1.csv');
    const parts = [];
    let partNumber = 0;
    
    passWriter._write = (chunk, encoding, callback) => {
        partNumber++;
        parts.push(s3.uploadPart('test_upload/key1.csv', muData.UploadId, chunk, partNumber));
        callback();
    }

    const writer = new csv.CsvWriter(passWriter);
    const headers = contactsFields.map(item => item.value);
    
    writer.writeRecord(headers);
    const CONTACTS_PER_CHUNK = 10000;
    
    return recursiveList(filters, CONTACTS_PER_CHUNK, contacts => {
        contacts.forEach(contact => {
            if (typeof contact.phone === 'string') {
                contact.phone = [contact.phone];
            }

            if (!contact.phone || contact.phone.length === 0) {
                contact.phone = [''];
            }

            contact.phoneArrayBackup = contact.phone;
            contact.phoneArrayBackup.forEach(phoneNumber => {
                contact.phone = phoneNumber;
                let row = [];

                contactsFields.forEach(field => {
                    row.push(typeof contact[field.value] === 'undefined' ? '' : contact[field.value]);
                });

                writer.writeRecord(row);
            });
        });
    })
    .then(() => {
        Promise.all(parts).then(data => {
            s3.completeMultipartUpload('test_upload/key1.csv', muData.UploadId, data);
        })
    }).catch(e => {
        console.log('file error', e);
    });
}

module.exports = () => {
    scheduleQueue.process(CONCURRENCY, queueProcessor);

    scheduleQueue.on('error', err => logger.logQueueError('error', err));
    scheduleQueue.on('failed', err => logger.logQueueError('failed', err));
    console.log('USERS CAMPAIGNS SCHEDULER INITIALIZED!');
};

module.exports.queProcessor = queueProcessor;