const fs = require('fs');
let c = fs.readFileSync('src/pages/SamplePreview.jsx', 'utf8');

c = c.replace(
  '우측의 스마트폰 화면 안에서 스크롤을 내리거나 버튼을 눌러보세요. 실제 명함과 똑같이 동작합니다.',
  '관심있는 상품을 체크하고 우측의 스마트폰 화면 안에서 스크롤을 내리거나 버튼을 눌러보세요. 실제 명함과 똑같이 동작합니다. 모바일은 가장 하단에 미리보기 스마트폰 화면이 있습니다.'
);

fs.writeFileSync('src/pages/SamplePreview.jsx', c, 'utf8');
console.log('patched text');
