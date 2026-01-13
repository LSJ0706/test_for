$(document).ready(() => {
      // 카드 정보 저장
      $('#createBtn').on('click', () => {
            // 카드
            const cardData = {
                  content: $('#weddingContent').val(),
                  wedding_date: $('#weddingDate').val(),
                  location_name: $('#weddingContent').val(),
                  wedding_hole: $('#weddingHole').val(),
            };

            // 사람
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
                        is_alive: $card.find('.p-alive:checked').val(), // 라디오 버튼 값
                  });
            });

            // 사진
            const formData = new FormData();
            formData.append('cardData', JSON.stringify(cardData));
            formData.append('persons', JSON.stringify(persons));

            const thumbnail = $('#inputThumbnail')[0].files[0];
            if (thumbnail) formData.append('thumbnail', thumbnail);

            const gallery = $('#inputGallery')[0].files;
            for (let i = 0; i < gallery.length; i++) {
                  formData.append('gallery', gallery[i]);
            }

            $.ajax({
                  url: '/api/createCard',
                  type: 'POST',
                  data: formData,
                  processData: false, // FormData 사용 시 필수
                  contentType: false, // FormData 사용 시 필수
                  success: function () {
                        alert('청첩장이 성공적으로 저장되었습니다!');
                  },
                  error: function (xhr) {
                        console.log(xhr.status); // 여기서 404가 계속 뜨는지 확인
                  },
            });
      });
});
