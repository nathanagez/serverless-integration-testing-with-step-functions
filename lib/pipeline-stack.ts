import {Construct} from "constructs";
import {Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'MyPipeline',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub('nathanagez/serverless-integration-testing-with-step-functions', 'master'),
                commands: ['npm ci', 'npm run build', 'npx cdk synth']
            })
        });
    }
}