import React, { useState } from 'react';
import MatchTable, { type ResultsMap } from './components/MatchTable';


const App: React.FC = () => {
  const [players, setPlayers] = useState<string[]>([
    'PlayerA',
    'PlayerB',
    'PlayerC',
    'PlayerD',
  ]);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [results, setResults] = useState<ResultsMap>({
    PlayerA: { PlayerC: [3, 2] },
    PlayerC: { PlayerA: [2, 3] },
  });

  const handleNameChange = (idx: number, newName: string) => {
    const oldName = players[idx];
    
    setPlayers((ps) => {
      const next = [...ps];
      next[idx] = newName;
      return next;
    });
    
    // 結果マップ内のキーも更新
    if (oldName !== newName) {
      setResults((prev) => {
        const newResults = { ...prev };
        
        // 古い名前のキーがある場合、新しい名前にリネーム
        if (newResults[oldName]) {
          newResults[newName] = { ...newResults[oldName] };
          delete newResults[oldName];
        }
        
        // 他のプレイヤーの結果内でも古い名前を新しい名前に更新
        Object.keys(newResults).forEach(playerName => {
          if (newResults[playerName][oldName]) {
            newResults[playerName][newName] = newResults[playerName][oldName];
            delete newResults[playerName][oldName];
          }
        });
        
        return newResults;
      });
    }
  };

  const handleRemove = (idx: number) => {
    setPlayers((ps) => ps.filter((_, i) => i !== idx));

    setResults((prev) => {
      const newResults = { ...prev };
      const playerName = players[idx];
      delete newResults[playerName];
      
      Object.keys(newResults).forEach(player => {
        if (newResults[player][playerName]) {
          delete newResults[player][playerName];
        }
      });
      
      return newResults;
    });
  };

  const handleResultChange = (playerA: string, playerB: string, result: string) => {
    if (result.trim() === '') {
      // 対戦結果を削除
      setResults((prev) => {
        const newResults = { ...prev };
        delete newResults[playerA][playerB];
        delete newResults[playerB][playerA];
        return newResults;
      });
      return;
    }

    // 文字列をMatchResult型に変換
    const parts = result.split('-').map((s) => s.trim());
    const matchResult: [number, number] = [
      parseInt(parts[0], 10) || 0,
      parseInt(parts[1], 10) || 0
    ];

    // 逆の結果（B vs A）も作成
    const reverseResult: [number, number] = [matchResult[1], matchResult[0]];

    setResults((prev) => ({
      ...prev,
      [playerA]: {
        ...prev[playerA],
        [playerB]: matchResult,
      },
      [playerB]: {
        ...prev[playerB],
        [playerA]: reverseResult,
      },
    }));
  };

  const handleAddPlayer = (name?: string) => {
    const playerName = name || `Player${String.fromCharCode(65 + players.length)}`;
    setPlayers((prev) => [...prev, playerName]);
  };

  return (
    <>
      <h1 className="text-2xl mb-4">リーグ表</h1>
      <MatchTable
        players={players}
        results={results}
        onPlayerNameChange={handleNameChange}
        onPlayerRemove={handleRemove}
        onResultChange={handleResultChange}
      />
      
      {/* プレイヤー追加ボタン */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="参加者名"
          className="border rounded px-3 py-2"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (newPlayerName.trim()) {
                handleAddPlayer(newPlayerName.trim());
                setNewPlayerName('');
              }
            }
          }}
        />
        <button
          onClick={() => {
            if (newPlayerName.trim()) {
              handleAddPlayer(newPlayerName.trim());
              setNewPlayerName('');
            } else {
              handleAddPlayer();
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
        >
          + 追加
        </button>
      </div>
    </>
  );
};

export default App;