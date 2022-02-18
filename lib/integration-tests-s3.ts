import {Duration} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {Chain} from "aws-cdk-lib/aws-stepfunctions";
import * as sfn from "aws-cdk-lib/aws-stepfunctions"
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as nodeJsLambda from "aws-cdk-lib/aws-lambda-nodejs";

interface Props {
    bucket: Bucket
}

export class IntegrationTestsS3 extends Construct {
    public steps: Chain;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        // Create a Lambda Function to upload an image to the bucket
        const arrangeActS3Upload = new nodeJsLambda.NodejsFunction(this, 'arrangeActS3Upload', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'handler',
            entry: 'resources/lambda-functions/arrange-act-s3/index.ts',
            bundling: {
                externalModules: ['aws-sdk'],
                commandHooks: {
                    beforeBundling(inputDir: string, outputDir: string): string[] {
                        return [];
                    },
                    afterBundling(inputDir: string, outputDir: string): string[] {
                        return [`cp ${inputDir}/resources/lambda-functions/arrange-act-s3/example.png ${outputDir}`];
                    },
                    beforeInstall() {
                        return [];
                    }
                }
            },
            environment: {
                "BUCKET": props.bucket.bucketName
            },
        })
        props.bucket.grantReadWrite(arrangeActS3Upload)

        // Assert and cleanup Lambda function
        const assertCleanupS3Upload = new nodeJsLambda.NodejsFunction(this, 'AssertAndCleanUpS3UploadFunction', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'handler',
            entry: 'resources/lambda-functions/assert-cleanup-s3/index.ts',
            bundling: {
                externalModules: ['aws-sdk'],
            },
            environment: {
                "BUCKET": props.bucket.bucketName
            }
        })
        props.bucket.grantReadWrite(assertCleanupS3Upload)

        const arrangeStep = new tasks.LambdaInvoke(this, 'Arrange & Act', {
            lambdaFunction: arrangeActS3Upload
        });

        // Wait two seconds for the metadata to be written
        const sleepStep = new sfn.Wait(this, "Wait 5 seconds", {
            time: sfn.WaitTime.duration(Duration.seconds(5))
        })

        const assertStep = new tasks.LambdaInvoke(this, 'Assert & Clean Up', {
            lambdaFunction: assertCleanupS3Upload,
            payload: sfn.TaskInput.fromObject({
                "arrangeActPayload": sfn.JsonPath.stringAt("$.Payload")
            })
        });

        this.steps = arrangeStep.next(sleepStep).next(assertStep);
    }
}