import {CfnOutput, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Bucket, EventType} from "aws-cdk-lib/aws-s3";
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import {S3EventSource} from "aws-cdk-lib/aws-lambda-event-sources";
import {Policy, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {IntegrationTests} from "./integration-tests";

export class CdkImageMetadata extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const inputHandler = new Function(this, 'imageMetadata', {
            runtime: Runtime.NODEJS_14_X, // execution environment
            code: Code.fromAsset('resources/metadata-lambda'), // code loaded from "resources/metadata-lambda" directory
            handler: 'image-metadata.handler' // file is "image-metadata", function is "handler"
        });
        const s3BucketPolicy = new PolicyStatement({
            actions: ['s3:*'],
            resources: ['arn:aws:s3:::*'],
        });
        inputHandler.role?.attachInlinePolicy(new Policy(this, 'buckets-policy', {
            statements: [s3BucketPolicy],
        }))

        const bucket = new Bucket(this, 'input-bucket', {
            autoDeleteObjects: true, removalPolicy: RemovalPolicy.DESTROY
        })

        const s3PutEventSource = new S3EventSource(bucket, {
            events: [EventType.OBJECT_CREATED_PUT]
        });

        inputHandler.addEventSource(s3PutEventSource);

        const resource = new IntegrationTests(this, 'IntegrationTests', {
            message: 'CustomResource says hello'
        })

        new CfnOutput(this, 'ResponseMessage', {
            description: 'The message that came back from the Custom Resource',
            value: resource.response
        });

    }
}
