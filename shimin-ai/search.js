// Vercel Serverless Function 예시
export default async function handler(req, res) {
  const { keyword } = req.query;
  const API_KEY = process.env.GOOGLE_API_KEY; // 서버 설정에 숨겨진 키
  const CX_ID = process.env.GOOGLE_CX_ID;     // 서버 설정에 숨겨진 ID

  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(keyword)}&dateRestrict=w1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      return res.status(200).json({ error: "확인할 수 없습니다." });
    }

    // 검증된 데이터만 필터링하여 반환
    const results = data.items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: "서버 통신 오류" });
  }
}