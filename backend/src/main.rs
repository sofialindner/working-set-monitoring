use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::{extract::Path, response::IntoResponse, routing::get, Json, Router};
use std::mem::{size_of, zeroed};
use tokio::time::{self, Duration};

use windows_sys::Win32::{
    Foundation::{CloseHandle, HANDLE},
    System::{
        ProcessStatus::{
            GetProcessMemoryInfo,
            PROCESS_MEMORY_COUNTERS,
            PROCESS_MEMORY_COUNTERS_EX
        },
        Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_SET_QUOTA},
    },
};
mod domain;
mod winapi;

use domain::models::*;
use winapi::processes::*;
// FFI
#[link(name = "kernel32")]
extern "system" {
    fn SetProcessWorkingSetSize(
        hProcess: HANDLE,
        dwMinimumWorkingSetSize: usize,
        dwMaximumWorkingSetSize: usize,
    ) -> i32;
}

// -------------------------------------------
// CLEAR WORKING SET
// -------------------------------------------

fn clear_working_set(pid: u32) -> Result<String, String> {
    unsafe {
        let h = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_SET_QUOTA, 0, pid);
        if h.is_null() {
            return Err(format!("Falha ao abrir processo {}", pid));
        }

        let mut before: PROCESS_MEMORY_COUNTERS_EX = zeroed();
        GetProcessMemoryInfo(
            h,
            &mut before as *mut _ as *mut PROCESS_MEMORY_COUNTERS,
            size_of::<PROCESS_MEMORY_COUNTERS_EX>() as u32,
        );

        let ok = SetProcessWorkingSetSize(h, usize::MAX, usize::MAX) != 0;

        let mut after: PROCESS_MEMORY_COUNTERS_EX = zeroed();
        GetProcessMemoryInfo(
            h,
            &mut after as *mut _ as *mut PROCESS_MEMORY_COUNTERS,
            size_of::<PROCESS_MEMORY_COUNTERS_EX>() as u32,
        );

        CloseHandle(h);

        Ok(serde_json::json!({
            "pid": pid,
            "success": ok,
            "before": {
                "working_set_kb": before.WorkingSetSize / 1024,
                "private_kb": before.PrivateUsage / 1024
            },
            "after": {
                "working_set_kb": after.WorkingSetSize / 1024,
                "private_kb": after.PrivateUsage / 1024
            }
        })
        .to_string())
    }
}

// -------------------------------------------
// AXUM HANDLERS
// -------------------------------------------

async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_ws)
}

// Loop que envia lista de processos a cada 1s
async fn handle_ws(mut socket: WebSocket) {
    let mut interval = time::interval(Duration::from_secs(1));

    loop {
        interval.tick().await;

        let json = tokio::task::spawn_blocking(|| collect_process_json())
            .await
            .unwrap_or_else(|e| Err(format!("join error: {}", e)))
            .unwrap_or_else(|e| format!(r#"{{"error":"{}"}}"#, e));

        if socket.send(Message::Text(json.into())).await.is_err() {
            break;
        }
    }
}

async fn clear_handler(Path(pid): Path<u32>) -> impl IntoResponse {
    let r = tokio::task::spawn_blocking(move || clear_working_set(pid)).await;

    let body = match r {
        Ok(Ok(json)) => json,
        Ok(Err(e)) => format!(r#"{{"error":"{}"}}"#, e),
        Err(e) => format!(r#"{{"error":"join: {}"}}"#, e),
    };

    Json(serde_json::from_str::<serde_json::Value>(&body).unwrap())
}

// -------------------------------------------
// MAIN
// -------------------------------------------

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .route("/clear/{pid}", get(clear_handler));

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
