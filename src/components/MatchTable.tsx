import React, { useState } from 'react';

type MatchResult = [number, number];

export type ResultsMap = Record<string, Record<string, MatchResult>>;

export interface MatchTableProps {
  /** プレイヤー名の配列（行・列見出しに使用） */
  players: string[];
  /** results[A][B] = '3 - 2' のような対戦結果 */
  results: ResultsMap;
  /** 行見出しで名前を編集したときのコールバック */
  onPlayerNameChange?: (index: number, newName: string) => void;
  /** 行を削除するときのコールバック */
  onPlayerRemove?: (index: number) => void;
  /** 対戦結果を更新するコールバック */
  onResultChange?: (playerA: string, playerB: string, result: string) => void;
}

function ResultToString(result: MatchResult): string {
  return `${result[0]} - ${result[1]}`;
}

function StringToResult(result: string): MatchResult {
  const parts = result.split('-').map((s) => s.trim());
  return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
}

const MatchTable: React.FC<MatchTableProps> = ({
  players,
  results,
  onPlayerNameChange,
  onPlayerRemove,
  onResultChange,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    playerA: string;
    playerB: string;
    currentResult: string;
  }>({
    isOpen: false,
    playerA: '',
    playerB: '',
    currentResult: '',
  });

  const openModal = (playerA: string, playerB: string) => {
    const result = results[playerA]?.[playerB];
    const resultString = result ? ResultToString(result) : '';
    setModalState({
      isOpen: true,
      playerA,
      playerB,
      currentResult: resultString,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      playerA: '',
      playerB: '',
      currentResult: '',
    });
  };

  const handleResultSubmit = (result: string) => {
    if (onResultChange) {
      onResultChange(modalState.playerA, modalState.playerB, result);
    }
    closeModal();
  };
  return (
    <>
      <table className="w-full max-w-4xl border-collapse ">
      <thead>
        <tr>
          {/* 左上は空セル */}
          <th className="w-32 border px-4 py-2 bg-gray-100"></th>
          {players.map((p, j) => (
            <th
              key={j}
              className="border px-4 py-2 bg-gray-100 text-center font-medium w-32"
            >
              {p}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {players.map((rowP, i) => (
          <tr key={i}>
            {/* 行見出し */}
            <td className="border px-2 py-1 flex items-center bg-gray-100 hover:bg-gray-200">
              <input
                type="text"
                value={rowP}
                onChange={(e) =>
                  onPlayerNameChange?.(i, e.currentTarget.value)
                }
                className="flex-1 border rounded px-1 py-0.5 text-sm bg-white"
              />
              {onPlayerRemove && (
                <button
                  onClick={() => onPlayerRemove(i)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </td>

            {/* 対戦結果セル */}
            {players.map((colP, j) => {
              // 自分同士のマスは斜線 or 空白
              if (i === j) {
                return (
                  <td
                    key={j}
                    className="border px-4 py-2 relative hover:bg-gray-50"
                  >
                    <svg 
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <line 
                        x1="0" 
                        y1="0" 
                        x2="100" 
                        y2="100" 
                        stroke="#d1d5db" 
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </td>
                );
              }
              const resultData = results[rowP]?.[colP];
              const score = resultData ? ResultToString(resultData) : '-';
              return (
                <td 
                  key={j} 
                  className="border px-4 py-2 text-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => openModal(rowP, colP)}
                >
                  {score}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>

    {/* モーダル */}
    {modalState.isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* 背景オーバーレイ */}
        <div className="absolute inset-0 bg-black opacity-40" onClick={closeModal}></div>
        {/* モーダルコンテンツ */}
        <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 z-10">
          <h3 className="text-lg font-semibold mb-4">
            対戦結果を入力
          </h3>
          <p className="mb-4 text-gray-600">
            {modalState.playerA} vs {modalState.playerB}
          </p>
          
          <input
            type="text"
            placeholder="例: 3 - 2"
            className="w-full border rounded px-3 py-2 mb-4"
            defaultValue={modalState.currentResult}
            id="result-input"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget;
                handleResultSubmit(input.value);
              }
            }}
          />
          
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                const input = document.getElementById('result-input') as HTMLInputElement;
                handleResultSubmit(input?.value || '');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default MatchTable;