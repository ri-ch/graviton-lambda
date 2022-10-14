import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha'
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import * as child_process from 'child_process'
import { Construct } from 'constructs'

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    // The exectuable you give to lambda has to be called 'bootstrap'
    // https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html
    const handler = new lambda.Function(this, 'graviton-lambda', {
      functionName: 'graviton-lambda',
      runtime: lambda.Runtime.PROVIDED_AL2,
      code: lambda.Code.fromAsset('../', {
        bundling: {
          image: lambda.Runtime.PROVIDED_AL2.bundlingImage,
          local: {
            tryBundle: (outputDir) => {
              child_process.execSync(
                [
                  'cd ..',
                  'cross build --release --target aarch64-unknown-linux-musl',
                  `cp target/aarch64-unknown-linux-musl/release/bootstrap ${outputDir}`
                ].join(' && ')
              )
              return true
            }
          }
        }
      }),
      architecture: lambda.Architecture.ARM_64,
      handler: 'n/a'
    })

    const api = new apigw.HttpApi(this, 'api', {
      defaultIntegration: new integrations.HttpLambdaIntegration('graviton-integration', handler) 
    })

    new cdk.CfnOutput(this, 'api-url', {
      value: api.url!
    })
  }
}
