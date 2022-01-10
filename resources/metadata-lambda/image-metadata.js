const AWS = require('aws-sdk');
const sizeOf = require('image-size')

exports.handler = async function (event) {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const s3 = new AWS.S3();
    const {bucket, object} = event.Records[0].s3
    const key = decodeURIComponent(object.key.replace(/\+/g, ' '));
    try {
        const {Body} = await s3.getObject({Bucket: bucket.name, Key: key}).promise()
        const {width, height} = sizeOf(Body)
        return s3.copyObject({
            Bucket: bucket.name,
            CopySource: `/${bucket.name}/${object.key}`,
            Key: key,
            MetadataDirective: 'REPLACE',
            Metadata: {
                width: width.toString(),
                height: height.toString()
            }
        }).promise()
    } catch (e) {
        console.error(e)
    }
};
