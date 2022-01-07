#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MyPipelineStack } from '../lib/cdk-pipelines-stack';

const app = new cdk.App();
new MyPipelineStack(app, 'MyPipelineStack', {
    env: {
        account: process.env.AWS_ACCOUNT,
        region: process.env.REGION,
    }
});

app.synth();