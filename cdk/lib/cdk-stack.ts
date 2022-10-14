import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as child_process from 'child_process'
import { Construct } from 'constructs'

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The executable you give to lambda has to be called 'bootstrap'
    // https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html
    const handler = new lambda.Function(this, 'graviton-lambda', {
      functionName: 'graviton-lambda',
      runtime: lambda.Runtime.PROVIDED_AL2023,
      code: lambda.Code.fromAsset('../', {
        bundling: {
          image: lambda.Runtime.PROVIDED_AL2023.bundlingImage,
          local: {
            tryBundle: (outputDir) => {
              child_process.execSync(
                [
                  'cd ..',
                  'cargo lambda build --release --arm64',
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

    const url = handler.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE
    })

    new cdk.CfnOutput(this, 'api-url', {
      value: url.url
    })
  }
}
