import * as AWS from "aws-sdk"
const s3 = new AWS.S3();

interface Event {
    arrangeActPayload: {
        actSuccess: boolean;
        errorMessage?: string;
        testObjectKey?: string;
    }
}

const REQUIRED_ENVS = [
    "BUCKET"
]

const errorResponse = (message: string) => {
    return {
        "success": false,
        "testName": "s3 upload",
        "errorMessage": message,
    }
}

const cleanUpWithSuccessResponse = async (key: string) => {
    // @ts-ignore
    await s3.deleteObject({
        Bucket: process.env.BUCKET,
        Key: key
    }).promise()
    return {"success": true, "testName": "s3-upload"}
}

const cleanUpWithErrorResponse = async (key: string, message: string) => {
    // @ts-ignore
    await s3.deleteObject({
        Bucket: process.env.BUCKET,
        Key: key
    }).promise()
    return errorResponse(message)
}

export const handler = async (event: Event) => {
    console.info("EVENT", event)
    const missing = REQUIRED_ENVS.filter(envName => !process.env[envName])
    if (missing.length) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }
    if (!event.arrangeActPayload.actSuccess)
        return errorResponse(event.arrangeActPayload.errorMessage || "Unknown error")

    try {
        const {testObjectKey = ""} = event.arrangeActPayload;
        // @ts-ignore
        const result = await s3.getObject({
            Bucket: process.env.BUCKET,
            Key: testObjectKey,
        }).promise();
        console.log(JSON.stringify(result, null, 2))
        if (!result.Metadata)
            return cleanUpWithErrorResponse(testObjectKey, "Missing Metadata")
        if (!result.Metadata.hasOwnProperty("width"))
            return cleanUpWithErrorResponse(testObjectKey, "Missing width")
        if (!result.Metadata.hasOwnProperty("height"))
            return cleanUpWithErrorResponse(testObjectKey, "Missing height")
        if (result.Metadata.width !== '172')
            return cleanUpWithErrorResponse(testObjectKey, "Invalid width")
        if (result.Metadata.height !== '178')
            return cleanUpWithErrorResponse(testObjectKey, "Invalid height")
        return cleanUpWithSuccessResponse(testObjectKey)
    } catch (e) {
        return errorResponse(e.message)
    }
}