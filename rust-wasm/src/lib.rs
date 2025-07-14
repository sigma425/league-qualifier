use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

// TypeScriptのMatchResult型に対応
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MatchResult(pub i32, pub i32);

// TypeScriptのResultsMap型に対応
pub type ResultsMap = HashMap<String, HashMap<String, MatchResult>>;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// デバッグ用のマクロ
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    console_log!("Hello, {}!", name);
}

// 順位計算のサンプル関数
#[wasm_bindgen]
pub fn calculate_rankings(results_json: &str) -> String {
    console_log!("Calculating rankings for: {}", results_json);
    
    // JSONから ResultsMap にデシリアライズ
    let results: ResultsMap = match serde_json::from_str(results_json) {
        Ok(r) => r,
        Err(e) => {
            console_log!("Failed to parse JSON: {}", e);
            return "[]".to_string();
        }
    };
    
    // ここに順位計算のロジックを実装
    let mut points: HashMap<String, i32> = HashMap::new();
    
    for (player_a, matches) in results.iter() {
        for (player_b, result) in matches.iter() {
            let score_a = result.0;
            let score_b = result.1;
            
            if score_a > score_b {
                *points.entry(player_a.clone()).or_insert(0) += 3; // 勝利
            } else if score_a == score_b {
                *points.entry(player_a.clone()).or_insert(0) += 1; // 引き分け
                *points.entry(player_b.clone()).or_insert(0) += 1;
            } else {
                *points.entry(player_b.clone()).or_insert(0) += 3; // 相手の勝利
            }
        }
    }
    
    // ポイント順にソート
    let mut sorted_players: Vec<(String, i32)> = points.into_iter().collect();
    sorted_players.sort_by(|a, b| b.1.cmp(&a.1));
    
    // JSON形式で返す
    serde_json::to_string(&sorted_players).unwrap_or_else(|_| "[]".to_string())
}
