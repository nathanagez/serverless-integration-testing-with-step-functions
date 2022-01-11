import {Construct} from "constructs";
import {CustomResource, Duration} from "aws-cdk-lib";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {Provider} from "aws-cdk-lib/custom-resources";

export class IntegrationTests extends Construct {
    public readonly response: string;

    constructor(scope: Construct, id: string, props: {}) {
        super(scope, id);

        const fn = new Function(this, 'CustomResourceLambda', {
            code: Code.fromAsset('resources/integration-test-lambda'),
            handler: 'index.handler',
            timeout: Duration.seconds(300),
            runtime: Runtime.NODEJS_14_X,
        });

        const provider = new Provider(this, 'Provider', {
            onEventHandler: fn,
        });

        const resource = new CustomResource(this, 'Resource', {
            serviceToken: provider.serviceToken,
            properties: props,
        });

        this.response = resource.getAtt('Response').toString();
    }
}