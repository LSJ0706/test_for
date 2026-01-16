const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const https = require('https');

// db 객체를 함수 형태로 받거나, 별도 db.js에서 불러와야 함
module.exports = (db) => {
      const promiseDB = db.promise();

      // 주소를 위도/경도로 변환해주는 API
      router.get('/getCoords', async (req, res) => {
            const address = req.query.address;
            if (!address) return res.status(400).json({ success: false, message: '주소가 없습니다.' });

            const options = {
                  hostname: 'maps.apigw.ntruss.com',
                  path: `/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`,
                  method: 'GET',
                  headers: {
                        'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_MAP_API_KEY_ID,
                        'X-NCP-APIGW-API-KEY': process.env.NAVER_MAP_API_KEY,
                        Accept: 'application/json',
                  },
            };

            const naverReq = https.request(options, (naverRes) => {
                  let data = '';
                  naverRes.on('data', (chunk) => {
                        data += chunk;
                  });
                  naverRes.on('end', () => {
                        try {
                              const result = JSON.parse(data);
                              if (result.addresses && result.addresses.length > 0) {
                                    const { x, y } = result.addresses[0]; // x: 경도, y: 위도

                                    res.json({ success: true, lat: y, lng: x });
                              } else {
                                    res.json({ success: false, message: '결과 없음' });
                              }
                        } catch (e) {
                              res.status(500).json({ success: false, message: '파싱 에러' });
                        }
                  });
            });

            naverReq.on('error', (err) => {
                  res.status(500).json({ success: false, message: err.message });
            });
            naverReq.end();
      });

      // 카드 작성
      router.post(
            '/createCard',
            upload.fields([
                  { name: 'thumbnail', maxCount: 1 },
                  { name: 'gallery', maxCount: 15 },
            ]),
            async (req, res) => {
                  const cardData = JSON.parse(req.body.cardData);
                  const persons = JSON.parse(req.body.persons);
                  const email = req.session.user.email;
                  try {
                        await promiseDB.beginTransaction();

                        const [cardResult] = await promiseDB.execute(
                              'INSERT INTO cards (email, content, wedding_date, location_address, latitude, longitude, wedding_hole) VALUES (?, ?, ?, ?, ?, ?, ?)',
                              [
                                    email,
                                    cardData.content,
                                    cardData.wedding_date,
                                    cardData.location_address,
                                    cardData.latitude,
                                    cardData.longitude,
                                    cardData.wedding_hole,
                              ]
                        );

                        const cardId = cardResult.insertId;
                        const personQuery =
                              'INSERT INTO persons (card_id, side, role, name, phone, account_bank, account_number, is_alive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                        for (const person of persons) {
                              await promiseDB.execute(personQuery, [
                                    cardId,
                                    person.side,
                                    person.role,
                                    person.name,
                                    person.phone,
                                    person.account_bank,
                                    person.account_number,
                                    person.is_alive !== undefined ? person.is_alive : null,
                              ]);
                        }
                        if (req.files['thumbnail']) {
                              const thumb = req.files['thumbnail'][0];
                              await promiseDB.execute(
                                    `INSERT INTO card_images (card_id, image_type, file_path) VALUES (?, 'thumbnail', ?)`,
                                    [cardId, thumb.path]
                              );
                        }

                        if (req.files['gallery']) {
                              for (const photo of req.files['gallery']) {
                                    await promiseDB.execute(
                                          `INSERT INTO card_images (card_id, image_type, file_path) VALUES (?, 'gallery', ?)`,
                                          [cardId, photo.path]
                                    );
                              }
                        }

                        await promiseDB.commit();
                        res.status(200).json({ success: true, message: '저장완료', cardId });
                  } catch (error) {
                        await promiseDB.rollback();
                        res.status(500).json({
                              success: false,
                              message: error.message,
                        });
                  }
            }
      );

      // 카드 리스트 조회
      router.get('/getMyCards', async (req, res) => {
            const email = req.session.user.email; // 세션에서 사용자 확인

            try {
                  const query = `
            SELECT 
                c.id, c.wedding_date,
                (SELECT file_path FROM card_images WHERE card_id = c.id AND image_type = 'thumbnail' LIMIT 1) as thumbnail_path,
                (SELECT name FROM persons WHERE card_id = c.id AND role = 'groom' LIMIT 1) as groom_name,
                (SELECT name FROM persons WHERE card_id = c.id AND role = 'bride' LIMIT 1) as bride_name
            FROM cards c
            WHERE c.email = ?
            ORDER BY c.id DESC
        `;

                  const [rows] = await promiseDB.execute(query, [email]);
                  res.json({ success: true, cards: rows });
            } catch (error) {
                  console.error(error);
                  res.status(500).json({ success: false, message: '서버 오류' });
            }
      });

      // 카드 조회
      router.get('/getCard/:id', async (req, res) => {
            const cardId = req.params.id;

            try {
                  const [cards] = await promiseDB.execute('SELECT * FROM cards WHERE id = ?', [cardId]);
                  const [persons] = await promiseDB.execute('SELECT * FROM persons WHERE card_id = ?', [cardId]);
                  const [images] = await promiseDB.execute('SELECT image_type, file_path FROM card_images WHERE card_id = ?', [cardId]);

                  if (cards.length === 0) {
                        return res.status(404).json({ success: false, message: '카드를 찾을 수 없습니다.' });
                  }

                  res.json({
                        success: true,
                        card: cards[0],
                        persons: persons,
                        images: images,
                  });
            } catch (error) {
                  res.status(500).json({ success: false, message: '서버 오류' });
            }
      });

      return router;
};
