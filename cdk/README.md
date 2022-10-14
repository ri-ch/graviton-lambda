# Graviton Lambda

An example of an AWS lambda written in Rust, running on a Graviton 2 processor.

## Why

### Rust
Mostly curiosity. I like Rust and wanted to see what it looked like fitting into my day to day problems.
More scientifically, the 'resource cost' for compiled languages is lower. Lambda is billed by time and
there is an incentive to use the fastest and most efficient language / runtime that is practical.

The developer experience of Rust is a an acquired taste but I personally appreciate the additional confidence I 
can have in my code given the compiler requirements.

### Graviton 2 Processors
ARM based processors (that AWS refers to as 'Graviton 2') are considerably cheaper to run, costing up to 20% less for a given duration (https://aws.amazon.com/blogs/aws/aws-lambda-functions-powered-by-aws-graviton2-processor-run-your-functions-on-arm-and-get-up-to-34-better-price-performance/)[https://aws.amazon.com/blogs/aws/aws-lambda-functions-powered-by-aws-graviton2-processor-run-your-functions-on-arm-and-get-up-to-34-better-price-performance/]

## Pre-requisites

You will need the `cargo-lambda` cargo extension installed to handle cross compiling your application for Lambda. [https://www.cargo-lambda.info/](https://www.cargo-lambda.info/)

## Notable Points

The `openssl` crate doesn't easily support cross compilation. In order to work around this we are using the `rustls` library as the crypto backend for validating TLS certificates etc. You can see an example of this
in the configuration of the `reqwest` dependency:

```toml
reqwest = { version = "0.11.11", features = ["json", "rustls-tls"], default-features = false }
```