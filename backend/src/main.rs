use axum::{routing::get, Router};

mod domain;
mod winapi;
mod server;

use domain::models::*;
use winapi::processes::*;
use winapi::memory::*;
use  server::handlers::*;
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
    .allow_origin(Any)          
    .allow_methods(Any)
    .allow_headers(Any);

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .route("/clear/{pid}", get(clear_handler))
        .route("/terminate/{pid}", get(terminate_handler))
        .layer(cors);

    println!("Servidor rodando em http://127.0.0.1:8080");

    axum::serve(
        tokio::net::TcpListener::bind("127.0.0.1:8080")
            .await
            .unwrap(),
        app,
    )
    .await
    .unwrap();
}
