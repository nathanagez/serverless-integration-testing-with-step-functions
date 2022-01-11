const response = require('cfn-response');

exports.handler = async (event, context) => {
    console.log(`EVENT: ${JSON.stringify(event, null, 2)}`)
    response.send(event, context, "SUCCESS", {})
}