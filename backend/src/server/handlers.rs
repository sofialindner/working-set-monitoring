use crate::clear_working_set;
use crate::terminate_process;
use crate::collect_process_json;
use crate::ProcessList;
use crate::WsCommand;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::{extract::Path, response::IntoResponse, Json};
use futures::lock::Mutex;
use std::sync::Arc;
use tokio::time::{self, Duration};

pub async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    let limit = Arc::new(Mutex::new(None::<usize>));
    ws.on_upgrade(move |socket| handle_ws(socket, limit))
}

pub async fn handle_ws(mut socket: WebSocket, limit: Arc<Mutex<Option<usize>>>) {
    let mut interval = time::interval(Duration::from_secs(1));

    loop {
        tokio::select! {

            // RECEBE MENSAGENS DO FRONTEND
            msg = socket.recv() => {
                let Some(Ok(Message::Text(text))) = msg else {
                    break;
                };

                println!("Recebido via WebSocket: {}", text);

                if let Ok(cmd) = serde_json::from_str::<WsCommand>(&text) {
                    let mut guard = limit.lock().await;
                    *guard = cmd.working_set_limit;   
                }
            }

            // EXECUTA A CADA 1s
            _ = interval.tick() => {

                // coleta processos
                let json = tokio::task::spawn_blocking(|| collect_process_json())
                    .await
                    .unwrap_or_else(|e| Err(format!("join error: {}", e)))
                    .unwrap_or_else(|e| format!(r#"{{"error":"{}"}}"#, e));

                // tenta parsear JSON em ProcessList
                if let Ok(process_list) = serde_json::from_str::<ProcessList>(&json) {

                    // lê limite atual
                    let limit_kb = *limit.lock().await;

                    if let Some(max_kb) = limit_kb {
                        for p in &process_list.processes {
                            if p.working_set_size > max_kb {

                                println!(
                                    "Processo {} (PID {}) excedeu limite: {} KB > {} KB. Limpando...",
                                    p.name, p.pid, p.working_set_size, max_kb
                                );

                                let pid = p.pid;
                                tokio::task::spawn_blocking(move || clear_working_set(pid));
                            }
                        }
                    }
                }

                // ENVIA JSON PARA O FRONTEND
                if socket.send(Message::Text(json.into())).await.is_err() {
                    break;
                }
            }
        }
    }
}

pub async fn clear_handler(Path(pid): Path<u32>) -> impl IntoResponse {
    let r = tokio::task::spawn_blocking(move || clear_working_set(pid)).await;

    let body = match r {
        Ok(Ok(json)) => json,
        Ok(Err(e)) => format!(r#"{{"error":"{}"}}"#, e),
        Err(e) => format!(r#"{{"error":"join: {}"}}"#, e),
    };

    Json(serde_json::from_str::<serde_json::Value>(&body).unwrap())
}

pub async fn terminate_handler(Path(pid): Path<u32>) -> impl IntoResponse {
    let r = tokio::task::spawn_blocking(move || unsafe {
        terminate_process(pid)
    })
    .await;

    let body = match r {
        Ok(Ok(())) => r#"{"status": "terminated"}"#.to_string(),
        Ok(Err(e)) => format!(r#"{{"error":"{}"}}"#, e),
        Err(e) => format!(r#"{{"error":"join: {}"}}"#, e),
    };

    Json(serde_json::from_str::<serde_json::Value>(&body).unwrap())
}
