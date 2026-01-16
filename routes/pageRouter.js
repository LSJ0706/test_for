const express = require('express');
// router 모듈화, next.js의 폴더 라우팅의 pages와 비슷함
const router = express.Router();
// 파일 경로를 다루는 node.js 내장 도구
const path = require('path');

// 로그인 체크 미들웨어
const isAuth = (req, res, next) => {
      // 세션 정보 확인 및 사용자 정보 확인
      if (req.session) next(); //만약 있다면 다음 페이지 혹은 함수 실행
      else res.redirect('/index'); // 없다면 index 페이지로 이동
};

// Public 페이지
router.get('/index', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
router.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '../public/signup.html')));
router.get('/card/:id', (req, res) => res.sendFile(path.join(__dirname, '../public/card.html')));

// Private 페이지
router.get('/mypage', isAuth, (req, res) => res.sendFile(path.join(__dirname, '../public/mypage.html')));
router.get('/create', isAuth, (req, res) => res.sendFile(path.join(__dirname, '../public/create.html')));

module.exports = router;
