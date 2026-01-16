$(document).ready(function () {
      // 마이페이지 접속 시 사용자의 카드 목록 호출
      $.ajax({
            url: '/api/card/getMyCards',
            method: 'GET',
            success: function (data) {
                  const $list = $('#card-list');
                  // list 비우기
                  $list.empty();

                  // 작성된 카드가 없을 시
                  if (data.cards.length === 0) {
                        $list.append('<p>생성된 카드가 없습니다.</p>');
                        return;
                  }

                  // 카드 data를 반복하면서 리스트 생성
                  $.each(data.cards, function (_, card) {
                        const cardHtml = `
                                    <a href="/card/${card.id}" class="card-item">
                                          <img src="/${card.thumbnail_path || 'default-thumb.jpg'}" class="card-thumb" alt="썸네일">
                                          <div class="card-info">
                                                <span class="names">${card.groom_name} ♥ ${card.bride_name}</span>
                                          </div>
                                    </a>
                `;
                        $list.append(cardHtml);
                  });
            },
            error: function () {
                  alert('목록을 불러오는 데 실패했습니다.');
            },
      });
});
