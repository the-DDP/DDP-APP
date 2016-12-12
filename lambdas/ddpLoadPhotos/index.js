'use strict';
console.log('Loading function');

let async = require('async')
let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();

/**
 * Provide an event that contains the following keys:
 *
 *   - operation: one of the operations in the switch statement below
 *   - tableName: required for operations that interact with DynamoDB
 *   - payload: a parameter to pass to the operation being performed
 */
exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    console.log(event.userIds.length);
    if (!event.userIds) {
        let msg = "Missing request parameter userIds";
        console.log(msg);
        return callback(msg)
    }
    if (!Array.isArray(event.userIds)) {
        let msg = "The userIds request parameter must be an array";
        console.log(msg);
        return callback(msg);
    }

    let allPhotos = [];

    var oneWeekAgo = Date.now() - 7*24*3600*1000;

    function getItem(key, callback) {
        var spec = {
            "TableName" : "ddpPhoto",
            "ScanIndexForward" : false,
            "KeyConditionExpression" : "userId = :key AND addedOn > :time",
            "FilterExpression" : "flagged <> :flag",
            "ExpressionAttributeValues" : {
                ":key" : key,
                ":time" : oneWeekAgo,
                ":flag" : 1
            },
            "ConsistentRead" : false
        };
        dynamo.query(spec, function(err, data) {
            callback(err, data == null ? null : data.Items);
        });
    }

    async.concatSeries(event.userIds, getItem, function(err, photos) {
        if (err) {
            console.log("Error");
            console.log(err);
            callback(err)
        } else {
            console.log("Query response");
            console.log(photos);
            callback(err, {photos: photos})
        }
    });


};