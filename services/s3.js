const AWS = require('aws-sdk');

class S3Service {
    constructor(key, secret, bucketName) {
        this.s3 = new AWS.S3({ accessKeyId: key, secretAccessKey: secret });
        this.bucketName = bucketName;
    }

    upload(key) {
        const PassThrough = require('stream').PassThrough;
        const Body = new PassThrough();
        const promise = new Promise((resolve, reject) => {
            this.s3.upload({
                Key: key, 
                Body,
                Expires: moment().add(1, 'day').toDate(),
                Bucket: this.bucketName
            }, function(err, data){
                if(err) {
                    return reject(err);
                }

                return resolve(data);
            })
        })

        return { resp: promise, stream: Body };
    }

    completeMultipartUpload(key, uploadId, parts) {
        return this.s3.completeMultipartUpload({
            MultipartUpload: {Parts: parts},
            UploadId: uploadId,

            Key: key,
            Bucket: this.bucketName
        }).promise();
    }

    uploadPart(key, uploadId, body, partNumber) {
        return this.s3.uploadPart({
            Body: body,
            PartNumber: partNumber, 
            UploadId: uploadId,

            Key: key,
            Bucket: this.bucketName
        }, function(err, data) {
            console.log(err, data);    
        }).promise().then(data => {
            return {
                ETag: data.ETag,
                PartNumber: partNumber
            }
        });
    }

    createMultipartUpload(key) {
        return this.s3.createMultipartUpload({
            Key: key,
            Bucket: this.bucketName
        }, function(err, data) {
            console.log(err, data);    
        }).promise();
    }

    listObjects() {
        return this.s3.listObjectsV2({
            Bucket: this.bucketName,
            Prefix: "test"
        }).promise();
    }
}

module.exports = S3Service;