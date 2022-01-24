import {Construct} from "constructs";
import {CustomResource, Duration} from "aws-cdk-lib";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {Provider} from "aws-cdk-lib/custom-resources";
import * as sfn from "aws-cdk-lib/aws-stepfunctions"
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks"
import {IntegrationTestsS3} from "./integration-tests-s3";


export class IntegrationTests extends Construct {
    public readonly response: string;

    constructor(scope: Construct, id: string, props: {}) {
        super(scope, id);

        const updateCfnLambda = new Function(this, 'UpdateCfnLambda', {
            code: Code.fromAsset('TODO: replace'),
            handler: 'index.handler',
            timeout: Duration.seconds(300),
            runtime: Runtime.NODEJS_14_X,
        });

        const updateCfnStep = new tasks.LambdaInvoke(this, 'Invoke Handler', {
            lambdaFunction: updateCfnLambda,
            payload: sfn.TaskInput.fromObject({
                "ExecutionInput": sfn.JsonPath.stringAt("$$.Execution.Input"),
                "IntegrationTestResults.$": "$",
            })
        });

        const integrationTestsS3 = new IntegrationTestsS3(this, 'TestS3');

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
        const customResourceHandler = new Function(this, 'UpdateCfnLambda', {
            code: Code.fromAsset('TODO: replace'),
            handler: 'index.handler',
            timeout: Duration.seconds(300),
            runtime: Runtime.NODEJS_14_X,
        });
        stateMachine.grantExecution(customResourceHandler)

        const provider = new Provider(this, 'Provider', {
            onEventHandler: updateCfnLambda,
        });

        const resource = new CustomResource(this, 'Resource', {
            serviceToken: customResourceHandler.functionArn,
            // Passing the time as a parameter will trigger the custom
            // resource with every deployment.
            properties: {"ExecutionTime": (new Date().toString())},
        });
    }
}