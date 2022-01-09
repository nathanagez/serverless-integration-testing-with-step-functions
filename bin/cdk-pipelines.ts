#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MyPipelineStack } from '../lib/cdk-pipelines-stack';
import {S3Stack} from "../lib/s3-bucket";

const app = new cdk.App();
new MyPipelineStack(app, 'MyPipelineStack', {
    env: {
        account: process.env.AWS_ACCOUNT,
        region: process.env.REGION,
    }
});

new S3Stack(app, 'S3Stack');


app.synth();