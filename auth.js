$(document).ready(() => {
      let isEmailChecked = false;

      // 비밀번호 입력창들에 키보드 이벤트 연결
      $('#signUpPass, #signUpPassConfirm').on('keyup', () => {
            checkPassMatch('#signUpPass', '#signUpPassConfirm', '#passErr');
      });

      // 이메일 중복확인
      $('#checkDuplicateEmailBtn').on('click', () => {
            const email = $('#signUpEmail').val();

            // 이메일 유효성 검사
            if (!isValidEmail(email)) {
                  alert('이메일 형식이 올바르지 않습니다.');
                  return;
            }

            $.ajax({
                  url: '/api/check-email',
                  method: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify({ email: email }),
                  success: function (res) {
                        if (res.isAvailable) {
                              isEmailChecked = true;
                              alert('사용 가능한 이메일입니다.');
                        } else {
                              isEmailChecked = false;
                              alert('이미 사용 중인 이메일입니다.');
                        }
                  },
            });
      });

      // 회원가입
      $('#signUpForm').on('submit', (e) => {
            e.preventDefault();
            // 이메일 유효성 검사
            if (!isEmailChecked) {
                  alert('이메일 중복 확인을 먼저 완료해주세요.');
                  return;
            }
            const signUpUserData = {
                  email: $('#signUpEmail').val(),
                  password: $('#signUpPass').val(),
                  name: $('#signUpName').val(),
            };
            $.ajax({
                  url: 'api/signUp',
                  method: 'post',
                  contentType: 'application/json',
                  data: JSON.stringify(signUpUserData),
                  success: function () {
                        alert('회원가입이 완료되었습니다!');
                        location.href = 'index.html';
                  },
            });
      });

      // 로그인
      $('#signInForm').on('submit', (e) => {
            e.preventDefault();
            const signInUserData = {
                  email: $('#signInEmail').val(),
                  password: $('#signInPass').val(),
            };

            if (!isValidEmail(signInUserData.email)) {
                  alert('이메일 형식에 맞지 않습니다.');
                  return;
            }
            $.ajax({
                  url: 'api/signIn',
                  method: 'post',
                  contentType: 'application/json',
                  data: JSON.stringify(signInUserData),
                  success: function () {
                        location.href = 'myPage.html';
                  },
            });
      });
});
