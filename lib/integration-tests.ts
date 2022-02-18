import {Construct} from "constructs";
import {CustomResource, Duration} from "aws-cdk-lib";
import {Bucket} from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as nodeJsLambda from "aws-cdk-lib/aws-lambda-nodejs"
import * as sfn from "aws-cdk-lib/aws-stepfunctions"
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks"
import {IntegrationTestsS3} from "./integration-tests-s3";

interface Props {
    bucket: Bucket
}

export class IntegrationTests extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const updateCfnLambda = new nodeJsLambda.NodejsFunction(this, 'UpdateCfnLambda', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'handler',
            entry: 'resources/lambda-functions/update-cfn-custom-resource/index.ts',
            bundling: {
                externalModules: ['aws-sdk'],
            }
        })

        const updateCfnStep = new tasks.LambdaInvoke(this, 'Update CloudFormation', {
            lambdaFunction: updateCfnLambda,
            payload: sfn.TaskInput.fromObject({
                "ExecutionInput": sfn.JsonPath.stringAt("$$.Execution.Input"),
                "IntegrationTestResults.$": "$",
            })
        });

        const integrationTestsS3 = new IntegrationTestsS3(this, 'TestS3', {
            bucket: props.bucket
        });

        const parallel = new sfn.Parallel(this, 'Parallel Container', {outputPath: "$[*].Payload"})

        parallel.branch(integrationTestsS3.steps)
        parallel.addCatch(updateCfnStep, {
            errors: ["States.ALL"]
        })

        const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
            definition: parallel.next(updateCfnStep),
            timeout: Duration.minutes(5)
        })

        // The Lambda Function backing the custom resource
        const customResourceHandler = new nodeJsLambda.NodejsFunction(this, 'CustomResourceHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'handler',
            entry: 'resources/lambda-functions/custom-resource-handler/index.ts',
            bundling: {
                externalModules: ['aws-sdk'],
            },
            environment: {
                STATE_MACHINE_ARN: stateMachine.stateMachineArn
            }
        })
        stateMachine.grantStartExecution(customResourceHandler)

        new CustomResource(this, 'CustomResource', {
            serviceToken: customResourceHandler.functionArn,
            // Passing the time as a parameter will trigger the custom
            // resource with every deployment.
            properties: {"ExecutionTime": (new Date().toString())},
        });
    }
}