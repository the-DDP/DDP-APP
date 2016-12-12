'use strict';
console.log('Loading function');

let doc = require('dynamodb-doc');
let request = require("request")
let dynamo = new doc.DynamoDB();

/**
 * Provide an event that contains the following keys:
 *
 *   - operation: one of the operations in the switch statement below
 *   - tableName: required for operations that interact with DynamoDB
 *   - payload: a parameter to pass to the operation being performed
 */
exports.handler = (event, context, callback) => {

    var id = event.userId;
    var item = {
        userId        : ""+id,
        p1            : 0,
        accessToken   : event.accessToken,
        photoCount    : 0
    };

    if (event.email) item.email = event.email;
    if (event.firstName) item.firstName = event.firstName;
    if (event.lastName) item.lastName = event.lastName;

    validateAccessToken(event.accessToken, event.userId, function(err) {
        if (err) {
            callback(err);
        } else {
            console.log("Saving item: ");
            console.log(item);
            dynamo.putItem({
                "Item" : item,
                "TableName" : "ddpUser",
                "ConditionExpression" : "attribute_not_exists(userId)"
            }, function(err) {
                console.log("Error A");
                console.log(err);
                if (err && err.code == "ConditionalCheckFailedException") {
                    console.log("User already exists");
                    callback(null, {ok:true})
                } else if (!err) {
                    assignUserToPartyBeacon0(event.userId, callback);
                } else {
                    console.log("Exception caught");
                    console.log(err);
                    callback("An error occurred");
                }
            });

        }
    });
};

function assignUserToPartyBeacon0(userId, callback) {
    // START temporary code for the DDP (everyone joins the party beacon by default)
    var spec = {
        "TableName" : "ddpParty",
        "Item" : {
            "beaconId" : 0,
            "userId" : "" + userId,
            "addedOn" : Date.now()
        }
    };
    dynamo.putItem(spec, function(err) {
        if (err) {
            console.error(err);
            callback("An error occurred")
        } else {
            callback(null, {ok:true})
        }
    });
    // END temporary code for the DDP
}

function validateAccessToken(accessToken, userId, cb) {
    var appAccessToken = "TODO";
    console.log("validating accessToken '" + accessToken + "'");
    request("https://graph.facebook.com/debug_token?input_token=" +
        accessToken +
        "&access_token=" + appAccessToken,
        function(err, response, body) {
            if (!err && response.statusCode == 200) {
                var response = JSON.parse(body);
                if (response && response.data && response.data.is_valid) {
                    return cb(null, {ok:true})
                }
            }
            console.log("Error validating accessToken");
            console.log(err);
            return cb("Error validating accessToken");
        }
    )
}