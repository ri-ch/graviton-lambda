import * as cdk from "aws-cdk-lib"
import { CdkStack } from "../lib/cdk-stack"

const app = new cdk.App()

new CdkStack(app, "graviton-lambda-stack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
})