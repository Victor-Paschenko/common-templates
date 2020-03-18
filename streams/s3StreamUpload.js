const s3 = require('../services/s3');

const PassThrough = require('stream').PassThrough;
const toWrite = new PassThrough();

const { resp, stream } = s3.upload(`tmpexports/${filename}1.csv`);
const writer = new csv.CsvWriter(toWrite);
toWrite.pipe(stream);