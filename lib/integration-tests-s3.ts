import {Duration} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {Chain} from "aws-cdk-lib/aws-stepfunctions";
import * as sfn from "aws-cdk-lib/aws-stepfunctions"
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks"

export class IntegrationTestsS3 extends Construct {
    public steps: Chain;

    constructor(scope: Construct, id: string, props?: {}) {
        super(scope, id);

        // Create a Lambda Function to upload an image to the bucket
        const arrangeActS3Upload = new Function(this, 'ArrangeAndActS3UploadFunction', {
            code: Code.fromAsset('TODO: replace'),
            handler: 'index.handler',
            timeout: Duration.seconds(300),
            runtime: Runtime.NODEJS_14_X,
        });

        const assertCleanupS3Upload = new Function(this, 'AssertAndCleanUpS3UploadFunction', {
            code: Code.fromAsset('TODO: replace'),
            handler: 'index.handler',
            timeout: Duration.seconds(300),
            runtime: Runtime.NODEJS_14_X,
        });

        const arrangeStep = new tasks.LambdaInvoke(this, 'ArrangeAndActS3UploadFunction', {
            lambdaFunction: arrangeActS3Upload
        });

        // Wait two seconds for the metadata to be written
        const sleepStep = new sfn.Wait(this, "Wait two seconds", {
            time: sfn.WaitTime.duration(Duration.seconds(2))
        })

        const assertStep = new tasks.LambdaInvoke(this, 'ArrangeAndActS3UploadFunction', {
            lambdaFunction: assertCleanupS3Upload,
            payload: sfn.TaskInput.fromObject({
                "ExecutionInput": sfn.JsonPath.stringAt("$$.Execution.Input"),
                "IntegrationTestResults.$": "$",
            })
        });

        this.steps = arrangeStep.next(sleepStep).next(assertStep);
    }
}