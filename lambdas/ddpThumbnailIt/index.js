// dependencies
var async = require('async');
var path = require('path');
var AWS = require('aws-sdk');
var gm = require('gm').subClass({
    imageMagick: true
});
var util = require('util');

// get reference to S3 client
var s3 = new AWS.S3();
exports.handler = function(event, context, callback) {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {
        depth: 5
    }));
    var srcKey = event.Records[0].s3.object.key;
    var srcBucket = event.Records[0].s3.bucket.name;
    var dstBucket = srcBucket;
    var newSize = {
        width: 360,
        dstnKey: srcKey,
        destinationPath: "thumbnail"
    };
    console.log(srcBucket);
    console.log(srcKey);


    var fileName = path.basename(srcKey);
    var outFilename = srcKey.slice(0, -4) + "-thumb.jpg";


    // Transform, and upload to same S3 bucket but to a different S3 bucket.
    async.waterfall([

        function download(next) {
            console.time("downloadImage");
            console.log("download");
            // Download the image from S3 into a buffer.
            // sadly it downloads the image several times, but we couldn't place it outside
            // the variable was not recognized
            s3.getObject({
                Bucket: srcBucket,
                Key: srcKey
            }, next);
            console.timeEnd("downloadImage");
        },

        function process(response, next) {
            console.log("process image");
            console.time("processImage");
            // Transform the image buffer in memory.
            //gm(response.Body).size(function(err, size) {
            gm(response.Body).size(function(err, size) {
                // Infer the scaling factor to avoid stretching the image unnaturally.
                console.log(err);
                var scalingFactor = Math.min(
                    newSize.width /
                    size.width, newSize.width / size.height
                );
                console.log("scalingFactor : " + scalingFactor);
                var width = scalingFactor * size.width;
                var height = scalingFactor * size.height;
                console.log("width : " + width);
                console.log("height : " + height);
                this.resize(width, height).toBuffer(
                    'JPG', function(err,
                                    buffer) {
                        if (err) {
                            //next(err);
                            next(err);
                        } else {
                            console.timeEnd(
                                "processImage"
                            );
                            next(null,
                                buffer);
                        }
                    });
            });
        },
        function upload(data, next) {
            console.time("uploadImage");
            console.log("upload to path : " + outFilename);
            // Stream the transformed image to a different folder.
            s3.putObject({
                Bucket: dstBucket,
                Key: outFilename,
                Body: data,
                ContentType: 'JPG',
                ACL : 'public-read'
            }, next);
            console.timeEnd("uploadImage");
        }
    ], function(err, result) {
        if (err) {
            console.error(err);
        }
        // result now equals 'done'
        callback();
    });
};