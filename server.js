// env 파일 가져오기
require('dotenv').config();

// express 프레임워크
const express = require('express');
const app = express(); // express 객체
const session = require('express-session'); // 쿠키에 저장되는 session기능
const cors = require('cors'); // cors설정을 위한 모듈
const mysql = require('mysql2'); // mysql db와 통신

// DB 연결
const db = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
});

// 설정
// 서버가 proxy(지금은 nginx)뒤에 있을 때 IP주소를 올바르게 인식하기 위한 설정
app.set('trust proxy', 1);
app.use(cors()); // 모든 도메인 요청 허용
app.use(express.json()); // 클라이언트가 JSON형식으로 보낼 때 js 객체로 읽기위한 설정
app.use(express.urlencoded({ extended: true })); // html의 form데이터를 서버에서 읽기 가능
// 세션 사용을 위한 설정
app.use(
      session({
            secret: process.env.SESSION_SECRET_KEY, // 세션 쿠키 암호
            resave: false, // 세션 데이터 변경시 저장 여부 설정
            saveUninitialized: false, // 로그인하지 않은 빈 세션 미리 저장
            cookie: {
                  secure: false,
                  httpOnly: true, // XSS 공격 방지를 위해 js가 쿠키에 접근 x
                  sameSite: 'lax',
                  maxAge: 1000 * 60 * 60,
            },
      })
);

// 정적 파일
// public 폴더의 파일을 주소창에서 바로 열게 해주는 설정
app.use(express.static('public'));
// 사용자가 업로드한 이미지가 저장되는 uploads폴더의 가상 경로 매핑
app.use('/uploads', express.static('uploads'));

// 라우터 연결
// html 응답을 담당하는 코드
const pageRouter = require('./routes/pageRouter');
const cardApi = require('./api/cardApi')(db); // card data 처리 코드 및 db 객체 연결
const userApi = require('./api/userApi')(db); // user data 처리 코드 및 db 객체 연결

app.use('/api/card', cardApi); // api/card 로 시작하는 모든 요청을 cardApi파일로 처리
app.use('/api/user', userApi); // api/user 로 시작하는 모든 요청을 userApi파일로 처리
app.use('/', pageRouter);

// 3000번 포트를 열고 대기 및 실행중 표시
app.listen(3000, () => console.log('http://localhost:3000 실행 중'));
