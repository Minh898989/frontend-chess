import React from 'react';
import '../styles/ChessGuide.css';

const ChessGuide = () => {
  return (
    <div className="chess-guide">
      <button className="back-button" onClick={() => window.history.back()}>
          ⬅ Back
      </button>
      <h1>Hướng Dẫn Chơi Cờ Vua</h1>
      <section>
        <h2>1. Giới thiệu</h2>
        <p>Cờ vua là trò chơi trí tuệ dành cho hai người chơi. Mỗi người có 16 quân cờ gồm: Vua, Hậu, Xe, Tượng, Mã và Tốt.</p>
      </section>

      <section>
        <h2>2. Mục tiêu trò chơi</h2>
        <p>Mục tiêu là chiếu bí đối phương - tức là khiến Vua của đối phương không thể tránh khỏi bị ăn trong nước đi tiếp theo.</p>
      </section>

      <section>
        <h2>3. Cách đi các quân cờ</h2>
        <ul>
          <li><strong>Vua</strong>: đi 1 ô theo mọi hướng.</li>
          <li><strong>Hậu</strong>: đi nhiều ô theo hàng, cột hoặc đường chéo.</li>
          <li><strong>Xe</strong>: đi ngang hoặc dọc không giới hạn ô.</li>
          <li><strong>Tượng</strong>: đi chéo không giới hạn ô.</li>
          <li><strong>Mã</strong>: đi theo hình chữ "L" (2 ô một hướng + 1 ô vuông góc).</li>
          <li><strong>Tốt</strong>: đi thẳng 1 ô, nhưng ăn chéo 1 ô. Nước đầu tiên có thể đi 2 ô.</li>
        </ul>
      </section>

      <section>
        <h2>4. Một số quy tắc đặc biệt</h2>
        <ul>
          <li><strong>Nhập thành</strong>: đổi vị trí giữa Vua và Xe trong một số điều kiện.</li>
          <li><strong>Phong cấp</strong>: khi Tốt đến hàng cuối, có thể đổi thành Hậu, Xe, Tượng hoặc Mã.</li>
          <li><strong>Bắt tốt qua đường (en passant)</strong>: chỉ xảy ra khi Tốt đi 2 ô và đứng cạnh Tốt đối phương.</li>
        </ul>
      </section>

      <section>
        <h2>5. Kết thúc ván cờ</h2>
        <p>Ván cờ kết thúc khi:</p>
        <ul>
          <li>Chiếu bí Vua đối phương.</li>
          <li>Hòa cờ (vị trí lặp lại, hết nước đi, đồng ý hòa,...).</li>
        </ul>
      </section>
    </div>
  );
};

export default ChessGuide;
