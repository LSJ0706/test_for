const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;

// server.js에서 db를 인자로 받아 모듈을 내보냅니다.
module.exports = (db) => {
      // 이메일 중복 체크
      router.post('/check-email', (req, res) => {
            const { email } = req.body;
            const sql = 'SELECT COUNT(*) AS emailCount FROM users WHERE email = ?';
            db.query(sql, [email], (error, results) => {
                  if (error) {
                        return res.status(500).send('DB 오류');
                  }
                  const isAvailable = results[0].emailCount === 0;
                  return res.json({ isAvailable: isAvailable });
            });
      });

      // 회원가입
      router.post('/signUp', async (req, res) => {
            try {
                  const { email, password, name } = req.body;
                  const hash = await bcrypt.hash(password, saltRounds);

                  const sql = 'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)';
                  const values = [email, hash, name];

                  db.query(sql, values, (err, _) => {
                        if (err) {
                              return res.status(500).json({ success: false, message: '회원가입 실패' });
                        }
                        res.status(200).json({ success: true, message: '회원가입 성공' });
                  });
            } catch (error) {
                  res.status(500).json({ success: false, message: '서버 내부 오류' });
            }
      });

      // 로그인
      router.post('/signIn', (req, res) => {
            try {
                  const { email, password } = req.body;
                  const sql = 'SELECT * FROM users WHERE email = ?';

                  db.query(sql, [email], async (err, results) => {
                        if (err) {
                              return res.status(500).json({ success: false, message: '로그인 실패' });
                        }

                        if (results.length > 0) {
                              const user = results[0];
                              const match = await bcrypt.compare(password, user.password_hash);

                              if (match) {
                                    // 세션 저장
                                    req.session.user = { email: user.email, name: user.name };
                                    return req.session.save((err) => {
                                          if (err) return res.status(500).json({ success: false });
                                          return res.json({ success: true, message: '로그인 성공' });
                                    });
                              } else {
                                    return res.status(401).json({ success: false, message: '비밀번호가 틀렸습니다.' });
                              }
                        } else {
                              return res.status(404).json({ success: false, message: '가입되지 않은 이메일입니다.' });
                        }
                  });
            } catch (error) {
                  res.status(500).json({ success: false, message: '서버 내부 오류' });
            }
      });

      return router;
};
