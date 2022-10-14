use lambda_runtime::{service_fn, Error, LambdaEvent};
use log::LevelFilter;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use simple_logger::SimpleLogger;

#[derive(Serialize)]
struct Response {
    api_data: Value,
}

#[derive(Deserialize)]
struct Request {
    #[serde(rename = "queryStringParameters")]
    query_string_parameters: Option<QueryString>,
}

#[derive(Deserialize)]
struct QueryString {
    user: String,
}

async fn handler(event: LambdaEvent<Request>, client: &reqwest::Client) -> Result<Response, Error> {
    let request = event.payload;

    if request.query_string_parameters.is_none() {
        return Ok(Response {
            api_data: serde_json::Value::Null,
        });
    }

    let query_string = request.query_string_parameters.unwrap();

    let response = client
        .get(format!(
            "https://api.github.com/users/{}",
            query_string.user
        ))
        .header("User-Agent", "github client v1")
        .send()
        .await
        .expect("Failed to send request");
    Ok(Response {
        api_data: response.json().await.expect("Failed to read response data"),
    })
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let client = reqwest::Client::new();
    SimpleLogger::new()
        .with_level(LevelFilter::Info)
        .init()
        .unwrap();
    let func = service_fn(|event| handler(event, &client));
    lambda_runtime::run(func).await?;
    Ok(())
}
