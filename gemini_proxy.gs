/**
 * Gemini 프록시 (Google Apps Script)
 * ------------------------------------------------------------------
 * index.html 에서 호출하는 서버 측 프록시입니다.
 * API 키는 이 파일(서버) 안에만 두고, HTML에는 절대 넣지 않습니다.
 * 클라이언트는 PROXY_URL(/exec)로 { parts, generationConfig } 를 보내고,
 * 이 스크립트가 키를 붙여 Gemini로 전달한 뒤 응답을 그대로 돌려줍니다.
 *
 * ── 배포 방법 ──
 * 1. https://script.google.com 에서 새 프로젝트 생성 (또는 기존 프로젝트 열기)
 * 2. 이 파일 내용을 Code.gs 에 붙여넣기
 * 3. 아래 GEMINI_API_KEY 값을 본인 키로 확인/교체
 * 4. [배포] → [새 배포] → 유형: '웹 앱'
 *      - 실행 계정: 나
 *      - 액세스 권한: '모든 사용자'
 * 5. 발급된 웹 앱 URL(.../exec)을 index.html 의 PROXY_URL 에 붙여넣기
 *    (기존 배포를 '배포 관리'에서 수정하면 URL이 그대로 유지됩니다)
 *
 * ⚠️ 보안: 실제 API 키는 이 저장소(Git)에 커밋하지 마세요. 공개 저장소에 올라가면 노출됩니다.
 *    아래 placeholder는 그대로 두고, script.google.com 에 붙여넣은 '배포본'에서만
 *    본인 키로 교체하세요. 키 발급/재발급: https://aistudio.google.com/apikey
 */

// 키는 배포된 Apps Script(서버)에서만 채워 넣습니다. (저장소에는 placeholder 유지)
const GEMINI_API_KEY = '여기에_본인_GEMINI_API_KEY_입력';
const GEMINI_MODEL   = 'gemini-2.5-flash';

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents);

    const payload = {
      contents: [{ role: 'user', parts: req.parts || [] }],
      // 클라이언트가 보낸 generationConfig를 그대로 사용(없으면 기본값).
      // maxOutputTokens/responseMimeType 가 그대로 전달돼야 품목 누락(응답 잘림)을 막을 수 있음.
      generationConfig: req.generationConfig || { temperature: 0, maxOutputTokens: 8192 }
    };

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/'
              + GEMINI_MODEL + ':generateContent?key=' + GEMINI_API_KEY;

    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    return ContentService
      .createTextOutput(res.getContentText())
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: { message: '프록시 오류: ' + err } }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 배포 확인용 (브라우저로 /exec 열었을 때 표시)
function doGet() {
  return ContentService
    .createTextOutput('Gemini proxy is running.')
    .setMimeType(ContentService.MimeType.TEXT);
}
