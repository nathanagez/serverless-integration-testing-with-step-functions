import * as AWS from "aws-sdk"

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
    }
}

const REQUIRED_ENVS = [
    "STATE_MACHINE_ARN"
]

export const handler = async (event: Event) => {
    console.info('EVENT', event)
    const missing = REQUIRED_ENVS.filter(envName => !process.env[envName])
    if (missing.length) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }
    const stepFunctions = new AWS.StepFunctions();
    // @ts-ignore
    return stepFunctions.startExecution({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        input: JSON.stringify(event)
    }).promise()
}