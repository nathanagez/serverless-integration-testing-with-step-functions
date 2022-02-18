import * as https from "https";
import * as url from "url";

interface TestResult {
    success: boolean;
    testName: string;
    errorMessage: string;
}

interface Event {
    ExecutionInput: {
        RequestType: string
        ServiceToken: string
        ResponseURL: string
        StackId: string
        RequestId: string
        LogicalResourceId: string
        ResourceType: string
        ResourceProperties: {
            ServiceToken: string
            ExecutionTime: string
        }
    },
    IntegrationTestResults: Array<TestResult>
}

interface StackProps {
    cfnUrl: string;
    cfnStackId: string;
    cfnRequestId: string;
    logicalResourceId: string;
}

interface CfnResponse {
    Status: string;
    Reason?: string,
    PhysicalResourceId: string;
    StackId: string;
    RequestId: string;
    LogicalResourceId: string;
}

export const callCfn = async (body: CfnResponse, cfnUrl: string) => {
    const parsedUrl = url.parse(cfnUrl);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "application/json",
            "content-length": JSON.stringify(body).length,
        },
    };

    console.info("SENDING RESPONSE...");

    return new Promise((resolve, reject) => {

        const request = https.request(options, (response: any) => {
            console.info("STATUS", response.statusCode);
            console.info("HEADERS", response.headers);
            resolve(response)
        });

        request.on("error", (error: any) => {
            console.info("sendResponse Error:" + error);
            reject(error)
        });

        request.write(JSON.stringify(body));
        request.end();
    })

}

export const errorResponse = async (message: string, {
    cfnUrl, cfnStackId, cfnRequestId, logicalResourceId
}: StackProps) => {
    await callCfn({
        "Status": "FAILED",
        "Reason": message,
        "PhysicalResourceId": logicalResourceId,
        "StackId": cfnStackId,
        "RequestId": cfnRequestId,
        "LogicalResourceId": logicalResourceId,
    }, cfnUrl)
}

export const successResponse = async ({cfnUrl, cfnStackId, cfnRequestId, logicalResourceId}: StackProps) => {
    await callCfn({
        "Status": "SUCCESS",
        "PhysicalResourceId": logicalResourceId,
        "StackId": cfnStackId,
        "RequestId": cfnRequestId,
        "LogicalResourceId": logicalResourceId,
    }, cfnUrl)
}

export const handler = async (event: Event) => {
    console.info('EVENT', event)
    const {
        ResponseURL: cfnUrl,
        StackId: cfnStackId,
        RequestId: cfnRequestId,
        LogicalResourceId: logicalResourceId,
    } = event.ExecutionInput
    const errors: Array<string> = []
    const lambdaResults = event.IntegrationTestResults
    const parallelSuccess = Array.isArray(lambdaResults)

    if (!parallelSuccess)
        return errorResponse("Execution error in parallel state", {
            cfnUrl, cfnStackId, cfnRequestId, logicalResourceId
        })

    lambdaResults.map((result) => {
        if (!result.success)
            errors.push(result.testName)
    })

    if (errors.length)
        return errorResponse(`Tests failed: [${errors.join(', ')}]`, {
            cfnUrl, cfnStackId, cfnRequestId, logicalResourceId
        })
    return successResponse({cfnUrl, cfnStackId, cfnRequestId, logicalResourceId})
}