export default async function handler(req, res) {
  // 1. 요청 키워드 추출
  const { keyword } = req.query;
  
  // 2. 환경 변수 로드 (Vercel Settings에 저장한 값)
  const API_KEY = process.env.GOOGLE_API_KEY;
  const CX_ID = process.env.GOOGLE_CX_ID;

  // 3. API Key나 CX ID가 없을 경우 대비
  if (!API_KEY || !CX_ID) {
    return res.status(500).json({ error: "시스템 설정(API Key/CX ID)이 완료되지 않았습니다." });
  }

  // 4. Google Custom Search API 호출 URL
  // num=5: 결과 5개 요청
  // dateRestrict=w1: 최근 1주일 데이터로 제한 (실시간성 확보)
  // safe=off: 검색 필터링 최소화 (전체 웹 검색 유도)
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(keyword)}&num=5&dateRestrict=w1&safe=off`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // 5. 검색 결과가 없는 경우 (할루시네이션 방지 원칙)
    if (!data.items || data.items.length === 0) {
      return res.status(200).json({ 
        error: "현재 해당 키워드에 대한 최근 1주일 내의 정보를 확인할 수 없습니다." 
      });
    }

    // 6. 필요한 데이터만 정제하여 반환 (출처 URL 포함)
    const results = data.items.map(item => ({
      title: item.title,      // 뉴스 제목
      link: item.link,        // 원문 링크 (검증 가능)
      snippet: item.snippet   // 요약 내용
    }));

    return res.status(200).json(results);

  } catch (error) {
    // 7. 네트워크 오류 등 예외 상황 처리
    return res.status(500).json({ error: "데이터 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
  }
}