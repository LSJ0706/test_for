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
      const regExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regExp.test(email);
}

function execDaumPostcode() {
      new daum.Postcode({
            oncomplete: function (data) {
                  // 도로명 주소 또는 지번 주소를 가져옵니다.
                  var addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                  document.getElementById('weddingAddress').value = addr;
            },
      }).open();
}
