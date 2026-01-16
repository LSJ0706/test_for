$(document).ready(function () {
      // 연락처 및 계좌번호 숫자만 허용
      $(document).on('input', '.p-phone, .p-account', function () {
            $(this).val(sanitizeNumber($(this).val()));
      });

      // 에러 메시지 표시 로직
      function showValidation(message) {
            $('.auth-validation p').text(message);
            $('.auth-validation').fadeIn();
            setTimeout(() => {
                  $('.auth-validation').fadeOut();
            }, 5000);
            $('html, body').animate({ scrollTop: 0 }, 400);
      }

      // 카드 정보 저장
      $('#btn-create').on('click', function () {
            // 예식장 정보 검사
            const weddingAddress = $('#wedding-address');
            if (!$('#wedding-date').val()) return showValidation('예식 일시를 선택해주세요.');
            if (!weddingAddress.val()) return showValidation('예식장 주소를 검색해주세요.');
            if (!$('#wedding-hole').val().trim()) return showValidation('상세 장소(홀 정보)를 입력해주세요.');
            if (!$('#wedding-content').val().trim()) return showValidation('초대의 글을 입력해주세요.');

            // 신랑/신부 정보 필수 검사 (부모님 제외, 본인들 정보만 필수일 경우)
            let isValid = true;
            $('.person-card').each(function () {
                  const $card = $(this);
                  const role = $card.data('role');
                  const roleKr = role === 'groom' ? '신랑' : role === 'bride' ? '신부' : null;

                  // 신랑, 신부 본인 카드는 모든 정보가 필수
                  if (roleKr) {
                        if (!$card.find('.p-name').val().trim()) {
                              showValidation(`${roleKr} 성함을 입력해주세요.`);
                              isValid = false;
                              return false;
                        }
                        if (!$card.find('.p-phone').val().trim()) {
                              showValidation(`${roleKr} 연락처를 입력해주세요.`);
                              isValid = false;
                              return false;
                        }
                        if (!$card.find('.p-bank').val().trim()) {
                              showValidation(`${roleKr} 은행명을 입력해주세요.`);
                              isValid = false;
                              return false;
                        }
                        if (!$card.find('.p-account').val().trim()) {
                              showValidation(`${roleKr} 계좌번호를 입력해주세요.`);
                              isValid = false;
                              return false;
                        }
                  }
            });
            if (!isValid) return;

            // 이미지 검사
            const thumbnail = $('#input-thumbnail')[0].files[0];
            const gallery = $('#input-gallery')[0].files;

            if (!thumbnail) return showValidation('대표 이미지(썸네일)를 등록해주세요.');
            if (gallery.length < 12) return showValidation(`갤러리 이미지는 최소 12장 이상 필요합니다. (현재: ${gallery.length}장)`);

            const cardData = {
                  content: $('#wedding-content').val(),
                  wedding_date: $('#wedding-date').val(),
                  location_address: weddingAddress.val(),
                  wedding_hole: $('#wedding-hole').val(),
                  latitude: weddingAddress.data('lat'),
                  longitude: weddingAddress.data('lng'),
            };

            const persons = [];
            $('.person-card').each(function () {
                  const $card = $(this);
                  const side = $card.closest('.side-group').data('side');
                  const role = $card.data('role');

                  persons.push({
                        side: side,
                        role: role,
                        name: $card.find('.p-name').val(),
                        phone: $card.find('.p-phone').val() || null,
                        account_bank: $card.find('.p-bank').val() || null,
                        account_number: $card.find('.p-account').val() || null,
                        is_alive: $card.find('input[type="radio"]:checked').val() || null,
                  });
            });

            const formData = new FormData();
            formData.append('cardData', JSON.stringify(cardData));
            formData.append('persons', JSON.stringify(persons));

            if (thumbnail) formData.append('thumbnail', thumbnail);
            for (let i = 0; i < gallery.length; i++) {
                  formData.append('gallery', gallery[i]);
            }

            // AJAX 전송
            $.ajax({
                  url: '/api/card/createCard',
                  type: 'POST',
                  data: formData,
                  processData: false,
                  contentType: false,
                  success: function () {
                        alert('청첩장이 성공적으로 저장되었습니다!');
                        location.href = 'myPage';
                  },
                  error: function (err) {
                        showValidation('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
                  },
            });
      });
});

// 다음 주소 API 함수 (변경 없음)
function execDaumPostcode() {
      new daum.Postcode({
            oncomplete: function (data) {
                  var addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                  const weddingAddress = $('#wedding-address');
                  weddingAddress.val(addr);

                  $.ajax({
                        url: `/api/card/getCoords?address=${encodeURIComponent(addr)}`,
                        type: 'GET',
                        success: function (res) {
                              if (res.success) {
                                    weddingAddress.data('lat', res.lat);
                                    weddingAddress.data('lng', res.lng);
                              }
                        },
                        error: function (err) {
                              console.error('좌표 변환 실패');
                        },
                  });
            },
      }).open();
}
