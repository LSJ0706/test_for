// 비밀번호 유효성 검사
function checkPassMatch(passId, passConfirmId, passErrId) {
      const pass = $(passId).val();
      const passConfirm = $(passConfirmId).val();
      const passErr = $(passErrId);

      if (pass === passConfirm) {
            passErr.hide();
      } else {
            passErr.show();
      }
}

// 이메일 유효성 검사
function isValidEmail(email) {
      // 정규식 사용 '아이디' @ '이메일 도메인' . (co, com ... ,etc)
      const regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regExp.test(email); // 정규식에 맞는지 테스트 후 T / F 발송
}

// 숫자만 입력가능
function sanitizeNumber(value) {
      return value.replace(/[^0-9]/g, '');
}

// 날짜 포맷팅
function formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}. ${month}. ${day}`;
}

// 시간 포맷팅
function formatTime(dateStr) {
      const date = new Date(dateStr);

      const hour = date.getHours();
      const min = String(date.getMinutes()).padStart(2, '0');
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;

      // 요일 꼐산
      const week = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayOfWeek = week[date.getDay()];

      return `${dayOfWeek} / ${displayHour}:${min} ${ampm}`;
}

// 계좌번호 토글
function toggleAccount(id) {
      const content = $(`#${id}`);
      const btn = content.prev('.toggle-btn');
      const arrow = btn.find('.arrow');

      // toggle 될 때 마다 숨기고 나오게 하기
      content.toggleClass('hidden');
      // arrow 누를 때마다 돌리기
      arrow.toggleClass('rotate');
}

// 텍스쳐 복사
function copyToClipboard(text) {
      ㄴ;
      if (!text) return;
      navigator.clipboard
            .writeText(text)
            .then(() => {
                  alert('계좌번호가 복사되었습니다.');
            })
            .catch(() => {
                  // 구형 브라우저 대응
                  const textArea = document.createElement('textarea');
                  textArea.value = text;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('계좌번호가 복사되었습니다.');
            });
}
