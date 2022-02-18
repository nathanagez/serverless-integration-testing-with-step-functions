import {Construct} from "constructs";
import {Stack, StackProps} from "aws-cdk-lib";
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {PipelineStage} from "./pipeline-stage";

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'IntegrationTestsSample',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub('nathanagez/serverless-integration-testing-with-step-functions', 'master'),
                commands: ['npm ci', 'npm run build', 'npx cdk synth']
            }),
            dockerEnabledForSelfMutation: true,
            dockerEnabledForSynth: true
        });

        const deploy = new PipelineStage(this, 'dev');
        pipeline.addStage(deploy);
    }
}