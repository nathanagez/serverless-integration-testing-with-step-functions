import {App} from "aws-cdk-lib";
import {Template} from 'aws-cdk-lib/assertions';
import {CdkImageMetadata} from "../lib/cdk-image-metadata";

test('Metadata lambda created', () => {
    const app = new App();
    // WHEN
    const stack = new CdkImageMetadata(app, 'ImageMetadataConstruct',);
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::Lambda::Function", {
        Handler: "image-metadata.handler",
        Runtime: "nodejs14.x",
    });
});
