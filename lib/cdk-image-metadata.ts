import {RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Bucket, EventType} from "aws-cdk-lib/aws-s3";
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import {IntegrationTests} from "./integration-tests";
import {LambdaDestination} from "aws-cdk-lib/aws-s3-notifications";

export class CdkImageMetadata extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const inputHandler = new Function(this, 'imageMetadata', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset('resources/lambda-functions/metadata-lambda'),
            handler: 'image-metadata.handler'
        });

        const bucket = new Bucket(this, 'input-bucket', {
            autoDeleteObjects: true, removalPolicy: RemovalPolicy.DESTROY
        })
        bucket.grantReadWrite(inputHandler)

        const extensions = ['jpeg', 'png', 'jpg']
        extensions.map((extension: string) => bucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(inputHandler), {suffix: extension}))

        new IntegrationTests(this, 'IntegrationTests', {
            bucket
        })

    }
}
