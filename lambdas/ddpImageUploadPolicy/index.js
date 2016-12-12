'use strict';
console.log('Loading function');
let doc = require('dynamodb-doc');
let dynamo = new doc.DynamoDB();

var policy_gen = require("s3-post-policy");
	
/**
 * Provide an event that contains the following keys:
 *
 *   - operation: one of the operations in the switch statement below
 *   - tableName: required for operations that interact with DynamoDB
 *   - payload: a parameter to pass to the operation being performed
 */
exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    if (!event.userId) {
        callback("userId parameter missing from request")
        return;
    }

	var policy = policy_gen({
		id: "TODO",
		secret: "TODO",
		date:  Date.now(),
		region: "us-west-2",
		bucket: "party-revolution",
		policy: {
			expiration: new Date(2020, 6),
			conditions: [
				{"acl": "public-read"},
				["starts-with", "$Content-Type", "image/"],
				["starts-with", "$key", ""]
			]
		}
	});

    dynamo.updateItem(
        {
            "TableName" : "ddpUser",
            "Key" : { "userId" : ""+event.userId },
            "UpdateExpression" : "set photoCount = photoCount + :num",
            "ExpressionAttributeValues": {
                ":num": 1
            },
            "ReturnValues" : "UPDATED_NEW"
        },
        function (err, data) {
            var ok = true;
            if (err) {
                console.log("Error")
                console.log(err);
            } else {
                console.log("Success")
                console.log(data);
                policy.photoCount = data["Attributes"]["photoCount"];
            }
            callback(err, policy);
        }
    );

};