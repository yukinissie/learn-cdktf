import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput, S3Backend } from "cdktf";
import { AwsProvider } from "./.gen/providers/aws/provider";
import { Instance } from "./.gen/providers/aws/instance";

require("dotenv").config();

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "AWS", {
      region: "ap-northeast-1",
    });

    const ec2Instance = new Instance(this, "compute", {
      ami: "ami-0329eac6c5240c99d",
      instanceType: "t2.micro",
    });

    new TerraformOutput(this, "public_ip", {
      value: ec2Instance.publicIp,
    });
  }
}

const app = new App();
const stack = new MyStack(app, "aws_instance");

new S3Backend(stack, {
  profile: `${process.env.AWS_PROFILE}`,
  region: `${process.env.AWS_REGION}`,
  bucket: `${process.env.TFSTATE_BUCKET_NAME}`,
  key: `${[process.env.PROJECT_NAME]}/terraform.tfstate`,
  dynamodbTable: `${process.env.TFSTATE_LOCK_DYNAMODB_TABLE_NAME}`,
});

app.synth();
