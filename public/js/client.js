$(document).ready(function () {
      const cardId = window.location.pathname.split('/').pop();

      $.ajax({
            url: `/api/card/getCard/${cardId}`,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                  if (data.success) {
                        renderCardData(data.card, data.persons, data.images);
                        mapLoad(data.card.latitude, data.card.longitude);
                  } else {
                        alert('데이터를 불러올 수 없습니다.');
                  }
            },
            error: function () {},
      });
});

$('.kakao-link').on('click', function () {
      shareKakao();
});

$(document).on('click', '.account-number', function () {
      copyToClipboard($(this).text().trim());
});

// 카드 정보 입력
function renderCardData(card, persons, images) {
      const groom = persons.find((p) => p.role === 'groom') || {};
      const bride = persons.find((p) => p.role === 'bride') || {};

      $('#groom-name').text(groom.name || '신랑');
      $('#bride-name').text(bride.name || '신부');

      // 날짜 및 장소
      $('#wedding-date').text(formatDate(card.wedding_date));
      $('#wedding-time').text(formatTime(card.wedding_date));
      $('#location-name').text(card.wedding_hole);
      $('#wedding-address').text(card.location_address);
      $('#intro-text').html(card.content ? card.content.replace(/\n/g, '<br>') : '');

      const galleryContainer = $('#image-gallery');
      galleryContainer.empty(); // 중복 방지
      currentGalleryImages = []; // 배열 초기화

      const imageList = Object.values(images); // object의 value만 가져온 배열

      imageList.forEach((img) => {
            const safePath = img.file_path.replace(/\\/g, '/'); // '\'를 /로 변경 path를 맞추기 위함
            const fullPath = '/' + safePath;

            if (img.image_type === 'thumbnail') {
                  $('#thumbnail').attr('src', fullPath);
            } else if (img.image_type === 'gallery') {
                  currentGalleryImages.push(fullPath);
                  const imgIdx = currentGalleryImages.length - 1;

                  const imgTag = `<img src="${fullPath}" class="gallery-item" onclick="openModal(${imgIdx})">`;
                  galleryContainer.append(imgTag);
            }
      });

      // 인물 정보 & 연락처 & 계좌
      let groomAccHtml = '';
      let brideAccHtml = '';

      persons.forEach((p) => {
            const phone = p.phone || '';
            let prefix = '';

            if (p.role === 'groom' || p.role === 'bride') {
                  prefix = `.${p.role}`;
            } else {
                  prefix = `#${p.side}-${p.role}`;
            }

            if (prefix) {
                  $(`${prefix}-name`).text(p.name);
                  if (phone) {
                        $(`${prefix}-tel`).attr('href', `tel:${phone}`);
                        $(`${prefix}-sms`).attr('href', `sms:${phone}`);
                  }
            }

            if (p.account_number) {
                  const accInfo = `
                              <div>
                                    <p>${p.name}</p> 
                                    <div class="account-details">
                                          <p>${p.account_bank || ''} 
                                                <span class='account-number'> ${p.account_number} </span>
                                          </p> 
                                    </div>
                              </div>
                              `;
                  if (p.side === 'groom') groomAccHtml += accInfo;
                  else if (p.side === 'bride') brideAccHtml += accInfo;
            }
      });

      $('#groom-acc').html(groomAccHtml || '정보가 없습니다.');
      $('#bride-acc').html(brideAccHtml || '정보가 없습니다.');
}

function mapLoad(lat, lng) {
      const position = new naver.maps.LatLng(lat, lng);
      const map = new naver.maps.Map('naver-map', {
            center: position,
            zoom: 18,
      });

      // 마커 생성
      const marker = new naver.maps.Marker({
            position: position,
            map: map,
      });

      // 앱 연결 링크 업데이트
      const mapUrl = `https://map.naver.com/v5/entry/address/${lat},${lng}`;
      $('#naver-link').attr('href', mapUrl);
}

// 모달 열기
function openModal(index) {
      // 클릭한 사진의 따라서 index 변화
      currentIndex = index;
      $('#modal-img').attr('src', currentGalleryImages[currentIndex]);
      $('#image-modal').css('display', 'flex');
      $('body').css('overflow', 'hidden');
}

// 모달 닫기
function closeModal() {
      $('#image-modal').hide();
      $('body').css('overflow', 'auto');
}

// 이미지 전환 (좌우 화살표)
function changeImage(step, event) {
      // 클릭시 부모로 이벤트 전파 막기
      event.stopPropagation();

      // 현재 인덱스에 따라서 사진 index 변화
      currentIndex += step;

      if (currentIndex >= currentGalleryImages.length) currentIndex = 0;
      if (currentIndex < 0) currentIndex = currentGalleryImages.length - 1;

      $('#modal-img').attr('src', currentGalleryImages[currentIndex]);
}

// 카카오 공유
function shareKakao() {
      // 현재 페이지 정보 가져오기
      const groom = $('.groom-name').first().text();
      const bride = $('.bride-name').first().text();
      const weddingDate = $('#wedding-date').text();
      const locationName = $('#location-name').text();
      const thumbnailImg = $('#thumbnail').attr('src');

      Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                  title: `${groom} ❤ ${bride} 결혼합니다`,
                  description: `${weddingDate}\n${locationName}`,
                  imageUrl: thumbnailImg,
                  link: {
                        mobileWebUrl: window.location.href,
                        webUrl: window.location.href,
                  },
            },
            buttons: [
                  {
                        title: '청첩장 보기',
                        link: {
                              mobileWebUrl: window.location.href,
                              webUrl: window.location.href,
                        },
                  },
            ],
      });
}
