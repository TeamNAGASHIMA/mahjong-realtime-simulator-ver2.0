import { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export default function MahjongUI() {
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const [stream1, setStream1] = useState(null);
  const [stream2, setStream2] = useState(null);

  useEffect(() => {
    // 仮想的にカメラストリームをセット（本番ではMediaDevices.getUserMediaで複数デバイス対応）
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      setStream1(stream);
      if (videoRef1.current) videoRef1.current.srcObject = stream;
    });
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      setStream2(stream);
      if (videoRef2.current) videoRef2.current.srcObject = stream;
    });
  }, []);

  return (
    <div className="w-full h-screen bg-gray-100 font-sans text-sm">
      {/* メニューバー */}
      <div className="flex bg-gray-300 p-1 text-xs space-x-4">
        <span>設定</span>
        <span>カメラ</span>
        <span>表示</span>
        <span>その他</span>
      </div>

      {/* メイン画面 */}
      <div className="flex flex-row w-full h-[calc(100%-1.5rem)]">
        {/* 左側 */}
        <div className="flex-1 flex flex-col p-2 space-y-2">
          {/* 状況（牌エリア） */}
          <div className="bg-blue-800 p-2 rounded shadow text-white">
            {/* React + Three.jsで牌をCanvas描画 */}
            <Canvas camera={{ position: [0, 0, 10] }} style={{ height: 200 }}>
              <ambientLight />
              <directionalLight position={[5, 5, 5]} />
              <mesh position={[-3, 0, 0]}>
                <boxGeometry args={[1, 1.5, 0.2]} />
                <meshStandardMaterial color="orange" />
              </mesh>
              <OrbitControls enableZoom={false} />
            </Canvas>
            <div className="text-center text-sm mt-2">状況</div>
          </div>

          {/* 手牌 */}
          <div className="flex justify-center bg-white py-2 border">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="w-8 h-12 border mx-0.5 bg-white"></div>
            ))}
          </div>

          {/* 開始ボタン */}
          <div className="flex justify-center mt-2">
            <button className="bg-green-200 px-10 py-2 rounded-full shadow hover:bg-green-300">
              計算開始
            </button>
          </div>

          {/* 表 */}
          <div className="bg-white border mt-2 overflow-y-auto h-40">
            <table className="w-full text-center text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th>有効牌</th>
                  <th>期待値</th>
                  <th>和了確率</th>
                  <th>聴牌確率</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🀄🀄</td>
                  <td>9999点</td>
                  <td>99.99%</td>
                  <td>99.99%</td>
                </tr>
                {/* 追加行はここに */}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右側 */}
        <div className="w-80 p-2 space-y-4">
          {/* カメラプレビュー */}
          <div className="space-y-2">
            <div className="text-xs">カメラプレビュー</div>
            <video ref={videoRef1} autoPlay muted className="w-full h-24 bg-black" />
            <video ref={videoRef2} autoPlay muted className="w-full h-24 bg-black" />
          </div>

          {/* 設定 */}
          <div className="border p-2 bg-white">
            <div className="text-sm mb-1">設定</div>
            <div className="mb-2">
              <div className="flex space-x-2">
                <label><input type="radio" name="mode" defaultChecked /> 一般手</label>
                <label><input type="radio" name="mode" /> 七対子</label>
                <label><input type="radio" name="mode" /> 国士無双手</label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <label><input type="checkbox" /> 向聴落とし考慮</label>
              <label><input type="checkbox" /> 手変わり考慮</label>
              <label><input type="checkbox" /> ダブル立直考慮</label>
              <label><input type="checkbox" /> 一発考慮</label>
              <label><input type="checkbox" /> 海底/嶺上考慮</label>
              <label><input type="checkbox" /> 裏ドラ考慮</label>
              <label><input type="checkbox" /> 和了確率最大化</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
