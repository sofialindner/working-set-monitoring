use crate::clear_working_set;
use crate::collect_process_json;
use crate::terminate_process;
use crate::ProcessList;
use crate::WsCommand;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::{extract::Path, response::IntoResponse, Json};
use chrono::Local;
use futures::lock::Mutex;
use serde_json::json;
use std::sync::Arc;
use tokio::time::{self, Duration};

pub async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    let limit = Arc::new(Mutex::new(None::<usize>));
    ws.on_upgrade(move |socket| handle_ws(socket, limit))
}

pub async fn handle_ws(mut socket: WebSocket, limit: Arc<Mutex<Option<usize>>>) {
    let mut interval = time::interval(Duration::from_secs(1));
    let mut total_cleaned: usize = 0;

    loop {
        tokio::select! {
            msg = socket.recv() => {
                let Some(Ok(Message::Text(text))) = msg else { break };

                println!("Recebido via WebSocket: {}", text);

                if let Ok(cmd) = serde_json::from_str::<WsCommand>(&text) {
                    let mut guard = limit.lock().await;
                    *guard = cmd.working_set_limit;
                }
            }

            _ = interval.tick() => {
                let cleaned = total_cleaned.clone();
                let json = tokio::task::spawn_blocking(move || collect_process_json(cleaned))
                    .await
                    .unwrap_or_else(|e| Err(format!("join error: {}", e)))
                    .unwrap_or_else(|e| format!(r#"{{"error":"{}"}}"#, e));

                let parsed = serde_json::from_str::<ProcessList>(&json);
                let mut logs: Vec<serde_json::Value> = Vec::new();

            if let Ok(process_list) = parsed {
                let limit_kb = *limit.lock().await;

                if let Some(max_kb) = limit_kb {
                    for p in &process_list.processes {
                        if p.working_set_size > max_kb {

                            let msg = format!(
                                "[PID {}] {} - Limite excedido. {} KB > {} KB. Limpando...",
                                p.pid, p.name, p.working_set_size, max_kb
                            );

                            println!("{}", msg);

                            // log informativo
                            logs.push(serde_json::json!({
                                "type": "info",
                                "timestamp": format!("{}", Local::now().format("%H:%M:%S")),
                                "message": msg
                            }));

                            let pid = p.pid;

                            // roda a limpeza e captura o RESULTADO
                            let result = tokio::task::spawn_blocking(move || clear_working_set(pid))
                                .await
                                .map_err(|e| format!("Erro no join: {}", e))
                                .and_then(|r| r);

                            match result {
                                Ok((json_str, proc_cleaned)) => {
                                    total_cleaned += proc_cleaned;

                                    logs.push(serde_json::json!({
                                        "type": "success",
                                        "timestamp": format!("{}", Local::now().format("%H:%M:%S")),
                                        "message": format!("[PID {}] {} - Limpeza concluída. {}", p.pid, p.name, json_str)
                                    }));
                                }
                                Err(err_msg) => {
                                    logs.push(serde_json::json!({
                                        "type": "error",
                                        "timestamp": format!("{}", Local::now().format("%H:%M:%S")),
                                        "message": err_msg
                                    }));
                                }
                            }
                        }
                    }
                }
            }


                let mut value: serde_json::Value =
                    serde_json::from_str(&json).unwrap_or_else(|_| serde_json::json!({}));

                value["logs"] = serde_json::json!(logs);

                let final_json = value.to_string();

                // <-- aqui: converte String -> Utf8Bytes via Into
                if socket.send(Message::Text(final_json.into())).await.is_err() {
                    break;
                }
            }
        }
    }
}

pub async fn clear_handler(Path(pid): Path<u32>) -> impl IntoResponse {
    let r = tokio::task::spawn_blocking(move || clear_working_set(pid)).await;

    match r {
        Ok(Ok((json, _))) => {
            let msg = format!("Working set do processo [PID {}] limpo com sucesso!", pid);
            println!("{}", msg);
            Json(json!({
                "type": "success",
                "text": msg,
                "data": json
            }))
        }
        Ok(Err(e)) => {
            let msg = format!("Falha ao limpar working set do processo [PID {}].", pid);
            println!("{}", msg);
            Json(json!({
                "type": "error",
                "error": e,
                "text": msg
            }))
        }
        Err(e) => {
            let msg = "Erro interno ao aguardar task.".to_string();
            println!("{}", msg);
            Json(json!({
                "type": "error",
                "error": format!("join: {}", e),
                "text": msg
            }))
        }
    }
}

pub async fn terminate_handler(Path(pid): Path<u32>) -> impl IntoResponse {
    let r = tokio::task::spawn_blocking(move || unsafe { terminate_process(pid) }).await;

    match r {
        Ok(Ok(())) => {
            let msg: String = String::from(format!("Processo [PID {}] encerrado com sucesso!", pid));
            println!("{}", msg);
            Json(json!({
                "type": "success",
                "text": msg
            }))
        }
        Ok(Err(e)) => {
            let msg: String = String::from(format!("Falha ao encerrar o processo [PID {}].", pid));
            println!("{}", msg);
            Json(json!({
                "type": "error",
                "error": e,
                "text": msg
            }))
        }
        Err(e) => {
            let msg: String = String::from("Erro interno ao aguardar task.");
            println!("{}", msg);
            Json(json!({
                "type": "error",
                "error": format!("join: {}", e),
                "text": msg
            }))
        }
    }
}
