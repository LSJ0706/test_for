$(document).ready(() => {
      let isEmailChecked = false;

      // 비밀번호 입력창들에 키보드 이벤트 연결
      $('#sign-up-pass, #sign-up-pass-confirm').on('keyup', function () {
            checkPassMatch('#sign-up-pass', '#sign-up-pass-confirm', '#pass-err');
      });

      // 이메일 중복확인
      $('#btn-check-duplicate-email').on('click', function () {
            const email = $('#sign-up-email').val(); // email input의 value 정의

            // 이메일 유효성 검사
            if (!isValidEmail(email)) {
                  alert('이메일 형식이 올바르지 않습니다.');
                  return;
            }

            $.ajax({
                  url: '/api/user/check-email',
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
      $('#sign-up-form').on('submit', function (e) {
            e.preventDefault(); // 폼 제출 후 새로고침 방치

            // 이메일 유효성 검사
            if (!isEmailChecked) {
                  alert('이메일 중복 확인을 먼저 완료해주세요.');
                  return;
            }

            // 비밀번호 유효성 검사
            if ($('#sign-up-pass').val() !== $('#sign-up-pass-confirm').val()) {
                  alert('비밀번호를 다시 확인해주세요');
                  return;
            }

            // 회원가입 필요 데이터
            const signUpUserData = {
                  email: $('#sign-up-email').val(),
                  password: $('#sign-up-pass').val(),
                  name: $('#sign-up-name').val(),
            };

            $.ajax({
                  url: '/api/user/signUp',
                  method: 'post',
                  contentType: 'application/json',
                  data: JSON.stringify(signUpUserData),
                  success: function () {
                        alert('회원가입이 완료되었습니다!');
                        location.href = '/index';
                  },
            });
      });

      // 로그인
      $('#sign-in-form').on('submit', function (e) {
            e.preventDefault(); // 폼 제출 후 새로고침 방치

            // 로그인에 필요한 email, password
            const signInUserData = {
                  email: $('#sign-in-email').val(),
                  password: $('#sign-in-pass').val(),
            };

            // 이메일 유효성 검사
            if (!isValidEmail(signInUserData.email)) {
                  alert('이메일 형식에 맞지 않습니다.');
                  return;
            }

            $.ajax({
                  url: '/api/user/signIn',
                  method: 'post',
                  contentType: 'application/json',
                  data: JSON.stringify(signInUserData),
                  success: function () {
                        location.href = '/myPage';
                  },
                  error: function () {
                        $('.auth-validation').show();
                  },
            });
      });
});
