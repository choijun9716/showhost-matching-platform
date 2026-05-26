// Node 18+ 글로벌 fetch 활용
const sheetdbApiUrl = 'https://sheetdb.io/api/v1/22he1efg8ts7r';

const INITIAL_MOCK_USERS = [
  { id: 'client-1', email: 'client@test.com', password: 'password123', name: '테스트 브랜드', role: 'client' },
  { id: 'host-1', email: 'seohyun@showhost.com', password: 'password123', name: '김서현', role: 'showhost' },
  { id: 'host-2', email: 'jinwoo@showhost.com', password: 'password123', name: '이진우', role: 'showhost' },
  { id: 'host-3', email: 'minji@showhost.com', password: 'password123', name: '박민지', role: 'showhost' },
  { id: 'host-4', email: 'taesung@showhost.com', password: 'password123', name: '최태성', role: 'showhost' }
];

const INITIAL_MOCK_PROFILES = [
  {
    id: 'host-1',
    name: '김서현',
    email: 'seohyun@showhost.com',
    role: 'showhost',
    gender: '여성',
    height: '168cm',
    weight: '50kg',
    category: '패션',
    pay: '시간당 20만 - 40만원',
    broadcastLink: 'https://shoppinglive.naver.com',
    portfolio: 'https://youtube.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    bio: '트렌디한 감성으로 트렌드를 리드하고 매출을 이끄는 완판 쇼호스트',
    detail: '안녕하세요! 패션 카테고리 전문 쇼호스트 김서현입니다. 대기업 홈쇼핑부터 라이브 커머스까지 다양한 플랫폼에서 패션 및 의류 완판 기록을 보유하고 있습니다. 브랜드의 아이덴티티를 살려 고객들에게 진정성 있게 다가갑니다.',
    time: '상시 협의 가능',
    rating: 4.9,
    reviews: 28
  },
  {
    id: 'host-2',
    name: '이진우',
    email: 'jinwoo@showhost.com',
    role: 'showhost',
    gender: '남성',
    height: '180cm',
    weight: '75kg',
    category: 'IT/가전',
    pay: '시간당 30만 - 50만원',
    broadcastLink: 'https://shoppinglive.naver.com',
    portfolio: 'https://youtube.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop',
    bio: '복잡한 스펙도 쉽고 명쾌하게! 테크 전문 신뢰감 100% 쇼호스트',
    detail: '스마트 기기부터 가전제품까지 어려운 기술 용어를 소비자의 시선에서 쉽게 풀어 설명합니다. 신뢰성 있는 보이스와 철저한 제품 분석을 바탕으로 높은 전환율을 이끌어 냅니다. 삼성, LG 라이브 쇼 다수 진행.',
    time: '주말 선호 / 주중 야간 가능',
    rating: 4.8,
    reviews: 42
  },
  {
    id: 'host-3',
    name: '박민지',
    email: 'minji@showhost.com',
    role: 'showhost',
    gender: '여성',
    height: '162cm',
    weight: '46kg',
    category: '뷰티',
    pay: '시간당 15만 - 30만원',
    broadcastLink: 'https://shoppinglive.naver.com',
    portfolio: 'https://youtube.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
    bio: '고객의 피부 고민에 깊이 공감하고 소통하는 뷰티 카운셀러 쇼호스트',
    detail: '코스메틱 덕후이자 메이크업 아티스트 자격증을 보유한 뷰티 특화 쇼호스트입니다. 기초 스킨케어부터 색조 화장품까지 직접 꼼꼼히 사용해본 진솔한 후기와 꿀팁을 전수하여 시청자와의 끈끈한 유대감을 만듭니다.',
    time: '평일 오전/오후 가능',
    rating: 5.0,
    reviews: 19
  },
  {
    id: 'host-4',
    name: '최태성',
    email: 'taesung@showhost.com',
    role: 'showhost',
    gender: '남성',
    height: '177cm',
    weight: '72kg',
    category: '푸드',
    pay: '시간당 20만 - 35만원',
    broadcastLink: 'https://shoppinglive.naver.com',
    portfolio: 'https://youtube.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop',
    bio: '맛있는 방송! 시청자의 침샘을 자극하는 홈쇼핑계의 먹방 대가',
    detail: '보는 것만으로도 배부르고 먹고 싶어지게 만드는 리얼 푸드 쇼호스트입니다. 밀키트, 농수산물, 건강기능식품 등 다양한 맛을 극대화하여 표현합니다. 재치 있는 입담과 리액션으로 방송 내내 지루할 틈이 없습니다.',
    time: '상시 협의 가능',
    rating: 4.7,
    reviews: 31
  }
];

const INITIAL_MOCK_MATCHES = [
  {
    id: 'match-1',
    clientId: 'client-1',
    clientName: '테스트 브랜드',
    hostId: 'host-1',
    hostName: '김서현',
    message: '안녕하세요! 다가오는 6월 패션 신상 런칭 방송 진행을 부탁드리고 싶어 매칭 신청합니다.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const seedSheet = async (sheetName, data) => {
  console.log(`[Seed] Sending data to ${sheetName}...`);
  try {
    const res = await fetch(`${sheetdbApiUrl}?sheet=${sheetName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    const result = await res.json();
    console.log(`[Seed] ${sheetName} result:`, result);
  } catch (err) {
    console.error(`[Seed] Failed for ${sheetName}:`, err);
  }
};

const run = async () => {
  await seedSheet('users', INITIAL_MOCK_USERS);
  await seedSheet('profiles', INITIAL_MOCK_PROFILES);
  await seedSheet('matches', INITIAL_MOCK_MATCHES);
  console.log('[Seed] Data seeding completed.');
};

run();
