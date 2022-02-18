import * as AWS from "aws-sdk"
import * as fs from "fs"

const REQUIRED_ENVS = [
    "BUCKET"
]

export const handler = async (event: any) => {
    console.info("EVENT", event)
    const missing = REQUIRED_ENVS.filter(envName => !process.env[envName])
    if (missing.length) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }
    const objectKey = `test-file-${new Date()}.png`

    try {
        const s3 = new AWS.S3();
        const file = fs.readFileSync("./example.png")
        await s3.upload({
            // @ts-ignore
            Bucket: process.env.BUCKET,
            Key: objectKey,
            Body: file
        }).promise()
        return {"actSuccess": true, "testObjectKey": objectKey}
    } catch (e) {
        console.error(e)
        return {
            "actSuccess": false,
            "errorMessage": "failed to put object",
        }
    }
}