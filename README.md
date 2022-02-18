# serverless-integration-testing-with-step-functions

Inspired from [Bite-Sized Serverless](https://bitesizedserverless.com/) courses and [serverless-integration-testing-with-step-functions
](https://github.com/bitesizedserverless/serverless-integration-testing-with-step-functions).

- [Getting Started](#getting-started)
    - [Setup](#setup)
    - [Bootstrapping](#bootstrapping)
    - [GitHub Token](#github-token)
    - [Deploy](#deploy)
    - [Temporary stage](#temporary-stage)
- [Useful commands](#useful-commands)

This sample repository integrate [serverless-integration-testing-with-step-functions](https://github.com/bitesizedserverless/serverless-integration-testing-with-step-functions) with CDK Pipelines, in TypeScript.
All credits go to [@donkersgood](https://twitter.com/donkersgood) for his work on [bitesizedserverless.com](https://bitesizedserverless.com/).

## Getting started

### Setup
The following tools need to be installed on your system prior to installing the CDK:

- [Node.js >= 14.15.0](https://nodejs.org/download/release/latest-v14.x/)
    - We recommend using a version in [Active LTS](https://nodejs.org/en/about/releases/)
- [Yarn >= 1.19.1, < 2](https://yarnpkg.com/lang/en/docs/install)
- [Docker >= 19.03](https://docs.docker.com/get-docker/)
    - the Docker daemon must also be running

### Bootstrapping

Deploying AWS CDK apps into an AWS environment (a combination of an AWS account and region) may require that you
provision resources the AWS CDK needs to perform the deployment. These resources include an Amazon S3 bucket for storing
files and IAM roles that grant permissions needed to perform deployments. The process of provisioning these initial
resources is called bootstrapping.

```
$ cdk bootstrap aws://<ACCOUNT-NUMBER-1/REGION-1
```

### GitHub token

By default, the pipeline authenticates to GitHub using a personal access token stored in Secrets Manager under the name
`github-token`.

Read more about CodePipeline sources [here](https://github.com/aws/aws-cdk/blob/master/packages/@aws-cdk/pipelines/README.md#github-using-oauth).

### Deploy
```sh
$ cdk deploy
```

### Temporary stage
If you need to test a feature before making a PR you can deploy your own stack by creating a stage inside `bin/curation-tool-cdk`.

This saves you the trouble of triggering CodePipelines.

⚠️ Don't push your temporary stage on the repository.

```ts
new PipelineStage(app, 'your-local-stage', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    }
})
```

Synthesize an AWS CloudFormation template for the app, as follows.

```sh
$ cdk synth
```

Deploy your temporary stage CloudFormation template, as follows.

```sh
$ cdk deploy -a cdk.out/assembly-your-local-stage
```

Once done, don't forget delete the stack.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
