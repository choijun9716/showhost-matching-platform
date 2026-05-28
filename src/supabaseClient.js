import { createClient } from '@supabase/supabase-js';

// Supabase 및 SheetDB.io 환경변수 로드
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const sheetdbApiUrl = import.meta.env.VITE_SHEETDB_API_URL || '';

const isRealSupabase = supabaseUrl && supabaseAnonKey;
const isSheetdbActive = sheetdbApiUrl && sheetdbApiUrl.startsWith('http');

export const supabase = isRealSupabase 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// SheetDB API 헬퍼 함수
const sheetdbGet = async (sheetName) => {
  const response = await fetch(`${sheetdbApiUrl}?sheet=${sheetName}`);
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

const sheetdbSearch = async (sheetName, params) => {
  const queryString = Object.keys(params)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
  const response = await fetch(`${sheetdbApiUrl}/search?sheet=${sheetName}&${queryString}`);
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

const sheetdbPost = async (sheetName, dataArray) => {
  const response = await fetch(`${sheetdbApiUrl}?sheet=${sheetName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: dataArray })
  });
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

const sheetdbPatch = async (sheetName, idColumn, idValue, updateData) => {
  const safeIdValue = encodeURIComponent(String(idValue).trim());
  const response = await fetch(`${sheetdbApiUrl}/${idColumn}/${safeIdValue}?sheet=${sheetName}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: updateData })
  });
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

const sheetdbDelete = async (sheetName, idColumn, idValue) => {
  const safeIdValue = encodeURIComponent(String(idValue).trim());
  const response = await fetch(`${sheetdbApiUrl}/${idColumn}/${safeIdValue}?sheet=${sheetName}`, {
    method: 'DELETE'
  });
  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
};

// ==========================================
// Mock Database Implementation (Fallback)
// ==========================================

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
    career: '5년',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
    bio: '트렌디한 감성으로 트렌드를 리드하고 매출을 이끄는 완판 쇼호스트',
    detail: '안녕하세요! 패션 카테고리 전문 쇼호스트 김서현입니다. 대기업 홈쇼핑부터 라이브 커머스까지 다양한 플랫폼에서 패션 및 의류 완판 기록을 보유하고 있습니다. 브랜드의 아이덴티티를 살려 고객들에게 진정성 있게 다가갑니다.',
    pay: '시간당 20만 - 40만원',
    time: '상시 협의 가능',
    broadcastLink: 'https://shoppinglive.naver.com',
    portfolio: 'https://youtube.com',
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
    career: '7년',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop',
    bio: '복잡한 스펙도 쉽고 명쾌하게! 테크 전문 신뢰감 100% 쇼호스트',
    detail: '스마트 기기부터 가전제품까지 어려운 기술 용어를 소비자의 시선에서 쉽게 풀어 설명합니다. 신뢰성 있는 보이스와 철저한 제품 분석을 바탕으로 높은 전환율을 이끌어 냅니다. 삼성, LG 라이브 쇼 다수 진행.',
    pay: '시간당 30만 - 50만원',
    time: '주말 선호 / 주중 야간 가능',
    broadcastLink: 'https://shoppinglive.naver.com',
    portfolio: 'https://youtube.com',
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
    career: '3년',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop',
    bio: '고객의 피부 고민에 깊이 공감하고 소통하는 뷰티 카운셀러 쇼호스트',
    detail: '코스메틱 덕후이자 메이크업 아티스트 자격증을 보유한 뷰티 특화 쇼호스트입니다. 기초 스킨케어부터 색조 화장품까지 직접 꼼꼼히 사용해본 진솔한 후기와 꿀팁을 전수하여 시청자와의 끈끈한 유대감을 만듭니다.',
    time: '평일 오전/오후 가능',
    broadcastLink: 'https://shoppinglive.naver.com',
    portfolio: 'https://youtube.com',
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
    career: '4년',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop',
    bio: '맛있는 방송! 시청자의 침샘을 자극하는 홈쇼핑계의 먹방 대가',
    detail: '보는 것만으로도 배부르고 먹고 싶어지게 만드는 리얼 푸드 쇼호스트입니다. 밀키트, 농수산물, 건강기능식품 등 다양한 맛을 극대화하여 표현합니다. 재치 있는 입담과 리액션으로 방송 내내 지루할 틈이 없습니다.',
    time: '상시 협의 가능',
    broadcastLink: 'https://shoppinglive.naver.com',
    portfolio: 'https://youtube.com',
    rating: 4.7,
    reviews: 31
  }
];

// 로컬 스토리지 초기화 함수
export const initMockDatabase = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
      { id: 'admin-1', email: 'admin@test.com', password: 'password123', name: '관리자', role: 'admin', isPaid: 'true', points: 9999 },
      { id: 'client-1', email: 'client@test.com', password: 'password123', name: '테스트 브랜드', role: 'client', isPaid: 'false', points: 30 },
      ...INITIAL_MOCK_PROFILES.map(host => ({
        id: host.id,
        email: host.email,
        password: 'password123',
        name: host.name,
        role: 'showhost',
        isPaid: 'false',
        points: 0
      }))
    ]));
  } else {
    // ✅ 마이그레이션: 기존 users에 points 필드가 없으면 자동 추가
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let migrated = false;
    const updatedUsers = users.map(u => {
      if (u.points === undefined || u.points === null || u.points === '') {
        migrated = true;
        // client-1 테스트 계정은 기본 30크레딧 지급
        const defaultPoints = (u.id === 'client-1' || u.role === 'client') ? 30 : 0;
        return { ...u, points: defaultPoints };
      }
      return u;
    });
    if (migrated) {
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      // currentUser도 재동기화
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const fresh = updatedUsers.find(u => u.id === parsed.id);
        if (fresh && (parsed.points === undefined || parsed.points === null)) {
          localStorage.setItem('currentUser', JSON.stringify({ ...parsed, points: parseInt(fresh.points) || 0 }));
        }
      }
    }
  }
  if (!localStorage.getItem('pointHistory')) {
    localStorage.setItem('pointHistory', JSON.stringify([]));
  }
  if (!localStorage.getItem('campaigns')) {
    localStorage.setItem('campaigns', JSON.stringify([]));
  }
  if (!localStorage.getItem('profiles')) {
    const initializedProfiles = INITIAL_MOCK_PROFILES.map(p => ({
      ...p,
      isHidden: false,
      displayOrder: 0,
      isRecommended: false
    }));
    localStorage.setItem('profiles', JSON.stringify(initializedProfiles));
  }
  if (!localStorage.getItem('matches')) {
    localStorage.setItem('matches', JSON.stringify([
      {
        id: 'match-1',
        clientId: 'client-1',
        clientName: '테스트 브랜드',
        hostId: 'host-1',
        hostName: '김서현',
        message: '안녕하세요! 다가오는 6월 패션 신상 런칭 방송 진행을 부탁드리고 싶어 매칭 신청합니다.',
        status: 'pending', // pending, accepted, rejected
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]));
  }
};


// Mock DB 헬퍼 메서드
export const mockDb = {
  // 인증
  signUp: async (email, password, name, role) => {
    initMockDatabase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      throw new Error('이미 존재하는 이메일입니다.');
    }
    const newUser = { id: 'user-' + Date.now(), email, password, name, role, isPaid: 'false', points: 0 };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    if (role === 'showhost') {
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
      const newProfile = {
        id: newUser.id,
        name,
        email,
        role,
        gender: '여성',
        height: '',
        weight: '',
        category: '기타',
        career: '신입',
        pay: '상시 협의',
        broadcastLink: '',
        portfolio: '',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop',
        bio: '안녕하세요! 새로 등록한 쇼호스트입니다.',
        detail: '',
        time: '상시 협의',
        rating: 5.0,
        reviews: 0,
        isHidden: false,
        displayOrder: 0,
        isRecommended: false
      };
      profiles.push(newProfile);
      localStorage.setItem('profiles', JSON.stringify(profiles));
    }
    
    return { user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, points: newUser.points } };
  },

  signIn: async (email, password) => {
    initMockDatabase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role, isPaid: user.isPaid || 'false', points: parseInt(user.points) || 0 } };
  },

  // 프로필 조회 및 수정
  getProfiles: async () => {
    initMockDatabase();
    return JSON.parse(localStorage.getItem('profiles') || '[]');
  },

  getProfile: async (id) => {
    initMockDatabase();
    const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
    return profiles.find(p => p.id === id) || null;
  },

  updateProfile: async (id, updatedData) => {
    initMockDatabase();
    const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('프로필을 찾을 수 없습니다.');
    }
    profiles[index] = { ...profiles[index], ...updatedData };
    localStorage.setItem('profiles', JSON.stringify(profiles));
    
    // 유저 네임도 동기화
    if (updatedData.name) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        users[userIndex].name = updatedData.name;
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    return profiles[index];
  },

  deleteProfile: async (id) => {
    initMockDatabase();
    const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
    const filtered = profiles.filter(p => p.id !== id);
    localStorage.setItem('profiles', JSON.stringify(filtered));
    return { success: true };
  },

  // 포인트 기능
  getPoints: async (userId) => {
    initMockDatabase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    return parseInt(user?.points) || 0;
  },

  chargePoints: async (userId, amount, memo = '관리자 충전') => {
    initMockDatabase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('사용자를 찾을 수 없습니다.');
    const before = parseInt(users[index].points) || 0;
    users[index].points = before + parseInt(amount);
    localStorage.setItem('users', JSON.stringify(users));

    // 히스토리 기록
    const history = JSON.parse(localStorage.getItem('pointHistory') || '[]');
    history.push({
      id: 'ph-' + Date.now(),
      userId,
      type: 'charge',
      amount: parseInt(amount),
      before,
      after: users[index].points,
      memo,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('pointHistory', JSON.stringify(history));
    return users[index].points;
  },

  deductPoints: async (userId, amount = 10, memo = '매칭 신청') => {
    initMockDatabase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('사용자를 찾을 수 없습니다.');
    const before = parseInt(users[index].points) || 0;
    if (before < amount) throw new Error(`크레딧이 부족합니다. (보유: ${before}크레딧, 필요: ${amount}크레딧)`);
    users[index].points = before - parseInt(amount);
    localStorage.setItem('users', JSON.stringify(users));

    // 히스토리 기록
    const history = JSON.parse(localStorage.getItem('pointHistory') || '[]');
    history.push({
      id: 'ph-' + Date.now(),
      userId,
      type: 'deduct',
      amount: -parseInt(amount),
      before,
      after: users[index].points,
      memo,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('pointHistory', JSON.stringify(history));
    return users[index].points;
  },

  getPointHistory: async (userId) => {
    initMockDatabase();
    const history = JSON.parse(localStorage.getItem('pointHistory') || '[]');
    return history.filter(h => h.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAllUsers: async () => {
    initMockDatabase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // 브랜드(client) 계정만 반환
    return users
      .filter(u => u.role === 'client')
      .map(u => ({ ...u, points: parseInt(u.points) || 0 }));
  },

  // 캠페인 기능
  createCampaign: async (clientId, clientName, campaignData) => {
    initMockDatabase();
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    const newCampaign = {
      id: 'camp-' + Date.now(),
      clientId,
      clientName,
      brandName: campaignData.brandName,
      schedule: campaignData.schedule,
      location: campaignData.location,
      category: campaignData.category,
      recruitCount: parseInt(campaignData.recruitCount) || 1,
      description: campaignData.description || '',
      endDate: campaignData.endDate || '',
      status: 'open',
      confirmedHostId: '',
      confirmedHostName: '',
      proposalCount: 0,
      createdAt: new Date().toISOString()
    };
    campaigns.push(newCampaign);
    localStorage.setItem('campaigns', JSON.stringify(campaigns));
    return newCampaign;
  },


  getCampaignsForClient: async (clientId) => {
    initMockDatabase();
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    return campaigns
      .filter(c => c.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getCampaign: async (campaignId) => {
    initMockDatabase();
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    return campaigns.find(c => c.id === campaignId) || null;
  },

  confirmCampaignHost: async (campaignId, hostId, hostName) => {
    initMockDatabase();
    const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    const campIdx = campaigns.findIndex(c => c.id === campaignId);
    if (campIdx === -1) throw new Error('캠페인을 찾을 수 없습니다.');
    const campaign = campaigns[campIdx];

    let confirmedIds = campaign.confirmedHostId ? campaign.confirmedHostId.split(',') : [];
    let confirmedNames = campaign.confirmedHostName ? campaign.confirmedHostName.split(',') : [];

    const maxRecruits = parseInt(campaign.recruitCount) || 1;

    if (confirmedIds.includes(hostId)) throw new Error("이미 확정된 쇼호스트입니다.");
    if (confirmedIds.length >= maxRecruits) throw new Error(`최대 ${maxRecruits}명까지만 확정할 수 있습니다.`);

    confirmedIds.push(hostId);
    confirmedNames.push(hostName);

    const newStatus = confirmedIds.length >= maxRecruits ? 'confirmed' : 'open';

    campaigns[campIdx].status = newStatus;
    campaigns[campIdx].confirmedHostId = confirmedIds.join(',');
    campaigns[campIdx].confirmedHostName = confirmedNames.join(',');
    localStorage.setItem('campaigns', JSON.stringify(campaigns));

    // 다른 accepted 상태의 매칭을 closed로
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    const updated = matches.map(m => {
      if (m.campaignId !== campaignId) return m;
      if (m.hostId === hostId) return { ...m, status: 'confirmed' };
      if (newStatus === 'confirmed' && m.status === 'accepted') return { ...m, status: 'closed' };
      return m;
    });
    localStorage.setItem('matches', JSON.stringify(updated));
    return campaigns[campIdx];
  },

  // 매칭 기능 (campaignId 포함)
  requestMatch: async (clientId, clientName, hostId, hostName, message, campaignId = null) => {
    initMockDatabase();
    // 크레딧 차감 (부족 시 에러) - 캔페인 생성 시에는 이미 차감했으리기에 campaignId가 있으면 skip
    if (!campaignId) {
      await mockDb.deductPoints(clientId, 10, `${hostName}에게 매칭 신청`);
    } else {
      await mockDb.deductPoints(clientId, 10, `${hostName}에게 캠페인 제안`);
    }

    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    const newMatch = {
      id: 'match-' + Date.now(),
      campaignId,
      clientId,
      clientName,
      hostId,
      hostName,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    matches.push(newMatch);
    localStorage.setItem('matches', JSON.stringify(matches));

    // 칄페인 proposalCount 증가
    if (campaignId) {
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const idx = campaigns.findIndex(c => c.id === campaignId);
      if (idx !== -1) {
        campaigns[idx].proposalCount = (parseInt(campaigns[idx].proposalCount) || 0) + 1;
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
      }
    }

    return { ...newMatch, remainingPoints: (parseInt((JSON.parse(localStorage.getItem('users')||'[]').find(u=>u.id===clientId)||{}).points)||0) };
  },

  getMatchesForClient: async (clientId) => {
    initMockDatabase();
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    return matches.filter(m => m.clientId === clientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getMatchesForHost: async (hostId) => {
    initMockDatabase();
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    return matches.filter(m => m.hostId === hostId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  respondMatch: async (matchId, status) => {
    initMockDatabase();
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    const index = matches.findIndex(m => m.id === matchId);
    if (index === -1) {
      throw new Error('매칭 요청을 찾을 수 없습니다.');
    }
    matches[index].status = status; // 'accepted' or 'rejected'
    localStorage.setItem('matches', JSON.stringify(matches));
    return matches[index];
  }
};

// 통합 API
// (SheetDB/Supabase 환경에서의 포인트 API는 mockDb와 동일 인터페이스로 추가 예정)
export const api = {
  auth: {
    signUp: async (email, password, name, role) => {
      if (isSheetdbActive) {
        // 이메일 중복 검증
        const existingUsers = await sheetdbSearch("users", { email });
        if (existingUsers && existingUsers.length > 0) {
          throw new Error("이미 존재하는 이메일입니다.");
        }
        
        const newUserId = "user-" + Date.now();
        // users 테이블에 추가
        await sheetdbPost("users", [{ id: newUserId, email, password, name, role, isPaid: "false", points: 0 }]);
        
        // 쇼호스트일 경우 profiles 테이블에도 초기 데이터 생성
        if (role === "showhost") {
          await sheetdbPost("profiles", [{
            id: newUserId,
            name,
            email,
            role,
            gender: "여성",
            height: "",
            weight: "",
            category: "기타",
            career: "신입",
            pay: "상시 협의",
            broadcastLink: "",
            portfolio: "",
            profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300&auto=format&fit=crop",
            bio: "안녕하세요! 새로 등록한 쇼호스트입니다.",
            detail: "",
            time: "상시 협의",
            rating: 5.0,
            reviews: 0
          }]);
        }
        return { user: { id: newUserId, email, name, role, isPaid: "false", points: 0 } };
      } else if (isRealSupabase) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, role } } });
        if (error) throw error;
        return { user: { id: data.user.id, email: data.user.email, name, role } };
      } else {
        return mockDb.signUp(email, password, name, role);
      }
    },
    signIn: async (email, password) => {
      if (isSheetdbActive) {
        const res = await sheetdbSearch("users", { email, password });
        if (!res || res.length === 0) {
          throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        const user = res[0];
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role, isPaid: user.isPaid || 'false', points: parseInt(user.points) || 0 } };
      } else if (isRealSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const name = data.user.user_metadata?.name || '';
        const role = data.user.user_metadata?.role || 'client';
        return { user: { id: data.user.id, email: data.user.email, name, role } };
      } else {
        return mockDb.signIn(email, password);
      }
    },
    signOut: async () => {
      if (isRealSupabase) {
        await supabase.auth.signOut();
      }
    },
    updatePaidStatus: async (userId, isPaidStatus = "true") => {
      if (isSheetdbActive) {
        await sheetdbPatch("users", "id", userId, { isPaid: isPaidStatus });
        const res = await sheetdbSearch("users", { id: userId });
        if (!res || res.length === 0) throw new Error("사용자를 찾을 수 없습니다.");
        const user = res[0];
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role, isPaid: user.isPaid || 'false' } };
      } else if (isRealSupabase) {
        return { user: { id: userId, isPaid: isPaidStatus } };
      } else {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) throw new Error("사용자를 찾을 수 없습니다.");
        users[index].isPaid = isPaidStatus;
        localStorage.setItem('users', JSON.stringify(users));
        const user = users[index];
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role, isPaid: user.isPaid || 'false' } };
      }
    }
  },
  profiles: {
    list: async () => {
      if (isSheetdbActive) {
        const list = await sheetdbGet("profiles");
        return list.map(p => {
          let keywords = [];
          let references = [];
          try { if (p.keywords) keywords = JSON.parse(p.keywords); } catch(e) {}
          try { if (p.references) references = JSON.parse(p.references); } catch(e) {}
          return {
            ...p,
            rating: parseFloat(p.rating || 5.0),
            reviews: parseInt(p.reviews || 0),
            keywords,
            references
          };
        });
      } else if (isRealSupabase) {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return data;
      } else {
        return mockDb.getProfiles();
      }
    },
    get: async (id) => {
      if (isSheetdbActive) {
        const isEmail = id && id.includes('@');
        let params = { id };
        if (isEmail) {
          params = { email: id };
        } else if (id && id.trim() !== '') {
          if (id.startsWith('host-') || id.startsWith('user-')) {
            params = { id };
          } else {
            params = { name: id };
          }
        }
        const res = await sheetdbSearch("profiles", params);
        if (!res || res.length === 0) return null;
        const p = res[0];
        let keywords = [];
        let references = [];
        try { if (p.keywords) keywords = JSON.parse(p.keywords); } catch(e) {}
        try { if (p.references) references = JSON.parse(p.references); } catch(e) {}
        return {
          ...p,
          rating: parseFloat(p.rating || 5.0),
          reviews: parseInt(p.reviews || 0),
          keywords,
          references
        };
      } else if (isRealSupabase) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
      } else {
        return mockDb.getProfile(id);
      }
    },
    update: async (id, data) => {
      if (isSheetdbActive) {
        // 프로필 정보 업데이트
        const isEmail = id && id.includes('@');
        let idColumn = "id";
        if (isEmail) {
          idColumn = "email";
        } else if (!id || id.trim() === "") {
          throw new Error("유효한 식별자가 없습니다.");
        } else if (id.startsWith('host-') || id.startsWith('user-')) {
          idColumn = "id";
        } else {
          idColumn = "name";
        }
        
        const updateData = { ...data };
        if (updateData.keywords && Array.isArray(updateData.keywords)) {
          updateData.keywords = JSON.stringify(updateData.keywords);
        }
        if (updateData.references && Array.isArray(updateData.references)) {
          updateData.references = JSON.stringify(updateData.references);
        }
        
        await sheetdbPatch("profiles", idColumn, id, updateData);
        
        // 이름 변경 시 users 테이블과 동기화
        if (data.name) {
          await sheetdbPatch("users", idColumn, id, { name: data.name });
        }
        
        // 최종 데이터 반환
        return api.profiles.get(id);
      } else if (isRealSupabase) {
        const { data: updated, error } = await supabase.from('profiles').update(data).eq('id', id).select().single();
        if (error) throw error;
        return updated;
      } else {
        return mockDb.updateProfile(id, data);
      }
    },
    delete: async (id) => {
      if (isSheetdbActive) {
        const isEmail = id && id.includes('@');
        let idColumn = "id";
        if (isEmail) {
          idColumn = "email";
        } else if (!id || id.trim() === "") {
          throw new Error("유효한 식별자가 없습니다.");
        } else if (id.startsWith('host-') || id.startsWith('user-')) {
          idColumn = "id";
        } else {
          idColumn = "name";
        }
        await sheetdbDelete("profiles", idColumn, id);
        return { success: true };
      } else if (isRealSupabase) {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
      } else {
        return mockDb.deleteProfile(id);
      }
    }
  },
  points: {
    get: async (userId) => {
      if (isSheetdbActive) {
        const res = await sheetdbSearch("users", { id: userId });
        if (!res || res.length === 0) return 0;
        return parseInt(res[0].points) || 0;
      }
      return mockDb.getPoints(userId);
    },
    charge: async (userId, amount, memo) => {
      if (isSheetdbActive) {
        // SheetDB에서 현재 크레딧 조회 후 충전
        const res = await sheetdbSearch("users", { id: userId });
        if (!res || res.length === 0) throw new Error("사용자를 찾을 수 없습니다.");
        const before = parseInt(res[0].points) || 0;
        const newTotal = before + parseInt(amount);
        await sheetdbPatch("users", "id", userId, { points: newTotal });
        return newTotal;
      }
      return mockDb.chargePoints(userId, amount, memo);
    },
    deduct: async (userId, amount = 10, memo) => {
      if (isSheetdbActive) {
        const res = await sheetdbSearch("users", { id: userId });
        if (!res || res.length === 0) throw new Error("사용자를 찾을 수 없습니다.");
        const before = parseInt(res[0].points) || 0;
        if (before < amount) throw new Error(`크레딧이 부족합니다. (보유: ${before}C, 필요: ${amount}C)`);
        const newTotal = before - parseInt(amount);
        await sheetdbPatch("users", "id", userId, { points: newTotal });
        return newTotal;
      }
      return mockDb.deductPoints(userId, amount, memo);
    },
    history: async (userId) => {
      return mockDb.getPointHistory(userId);
    }
  },
  users: {
    // 브랜드(client) 계정만 반환
    list: async () => {
      if (isSheetdbActive) {
        const allUsers = await sheetdbGet("users");
        return allUsers
          .filter(u => u.role === 'client')
          .map(u => ({ ...u, points: parseInt(u.points) || 0 }));
      }
      return mockDb.getAllUsers();
    },
    chargePoints: async (userId, amount, memo) => {
      if (isSheetdbActive) {
        // SheetDB 크레딧 충전
        const res = await sheetdbSearch("users", { id: userId });
        if (!res || res.length === 0) throw new Error("사용자를 찾을 수 없습니다.");
        const before = parseInt(res[0].points) || 0;
        const newTotal = before + parseInt(amount);
        await sheetdbPatch("users", "id", userId, { points: newTotal });
        return newTotal;
      }
      return mockDb.chargePoints(userId, amount, memo);
    }
  },
  campaigns: {
    create: async (clientId, clientName, campaignData) => {
      if (isSheetdbActive) {
        const newCampaign = {
          id: 'camp-' + Date.now(),
          clientId,
          clientName,
          brandName: campaignData.brandName,
          schedule: campaignData.schedule,
          location: campaignData.location,
          category: campaignData.category,
          recruitCount: parseInt(campaignData.recruitCount) || 1,
          description: campaignData.description || '',
          endDate: campaignData.endDate || '',
          status: 'open',
          confirmedHostId: '', // null 대신 빈 문자열로 구글시트 오류 방지
          confirmedHostName: '',
          proposalCount: 0,
          createdAt: new Date().toISOString()
        };
        await sheetdbPost("campaigns", [newCampaign]);
        return newCampaign;
      }
      return mockDb.createCampaign(clientId, clientName, campaignData);
    },
    listForClient: async (clientId) => {
      if (isSheetdbActive) {
        const campaigns = await sheetdbGet("campaigns");
        return campaigns
          .filter(c => c.clientId === clientId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return mockDb.getCampaignsForClient(clientId);
    },
    listAll: async () => {
      if (isSheetdbActive) {
        const campaigns = await sheetdbGet("campaigns");
        return campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      return campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    get: async (campaignId) => {
      if (isSheetdbActive) {
        const res = await sheetdbSearch("campaigns", { id: campaignId });
        return res && res.length > 0 ? res[0] : null;
      }
      return mockDb.getCampaign(campaignId);
    },
    confirm: async (campaignId, hostId, hostName) => {
      if (isSheetdbActive) {
        const campaignArr = await sheetdbSearch("campaigns", { id: campaignId });
        if (!campaignArr || campaignArr.length === 0) throw new Error("캠페인을 찾을 수 없습니다.");
        const campaign = campaignArr[0];

        let confirmedIds = campaign.confirmedHostId ? campaign.confirmedHostId.split(',') : [];
        let confirmedNames = campaign.confirmedHostName ? campaign.confirmedHostName.split(',') : [];

        const maxRecruits = parseInt(campaign.recruitCount) || 1;

        if (confirmedIds.includes(hostId)) throw new Error("이미 확정된 쇼호스트입니다.");
        if (confirmedIds.length >= maxRecruits) throw new Error(`최대 ${maxRecruits}명까지만 확정할 수 있습니다.`);

        confirmedIds.push(hostId);
        confirmedNames.push(hostName);

        const newStatus = confirmedIds.length >= maxRecruits ? 'confirmed' : 'open';

        // 캠페인 상태 업데이트
        await sheetdbPatch("campaigns", "id", campaignId, { 
          status: newStatus, 
          confirmedHostId: confirmedIds.join(','), 
          confirmedHostName: confirmedNames.join(',') 
        });

        // 매칭 상태 업데이트
        const allMatches = await sheetdbGet("matches");
        const campMatches = allMatches.filter(m => m.campaignId === campaignId);
        
        for (const m of campMatches) {
          if (m.hostId === hostId) {
            await sheetdbPatch("matches", "id", m.id, { status: 'confirmed' });
          } else if (newStatus === 'confirmed' && m.status === 'accepted') {
            // 2명이 다 차서 마감된 경우에만 다른 수락건을 closed로 변경
            await sheetdbPatch("matches", "id", m.id, { status: 'closed' });
          }
        }
        
        // 업데이트된 캠페인 정보 반환
        const res = await sheetdbSearch("campaigns", { id: campaignId });
        return res[0];
      }
      return mockDb.confirmCampaignHost(campaignId, hostId, hostName);
    },
    close: async (campaignId) => {
      if (isSheetdbActive) {
        await sheetdbPatch("campaigns", "id", campaignId, { status: 'closed' });
        
        // 매칭 상태도 모두 마감 처리
        const allMatches = await sheetdbGet("matches");
        const campMatches = allMatches.filter(m => m.campaignId === campaignId && m.status !== 'confirmed');
        for (const m of campMatches) {
          await sheetdbPatch("matches", "id", m.id, { status: 'closed' });
        }
        return true;
      }
      // MockDB 구현 생략 (로컬 테스트용)
      return true;
    },
    getProposals: async (campaignId) => {
      if (isSheetdbActive) {
        const matches = await sheetdbGet("matches");
        return matches
          .map(m => ({
            ...m,
            campaignId: m.campaignId || m.campaignid || m.campaign_id,
            hostId: m.hostId || m.hostid || m.host_id,
            clientId: m.clientId || m.clientid || m.client_id
          }))
          .filter(m => String(m.campaignId) === String(campaignId))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      initMockDatabase();
      const matches = JSON.parse(localStorage.getItem('matches') || '[]');
      return matches
        .filter(m => m.campaignId === campaignId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },
  matches: {

    request: async (clientId, clientName, hostId, hostName, message, campaignId = null) => {
      if (isSheetdbActive) {
        // SheetDB 크레딧 차감 (10크레딧) - SheetDB에 직접 반영
        if (campaignId) {
           await api.points.deduct(clientId, 10, `${hostName}에게 캠페인 제안`);
        } else {
           await api.points.deduct(clientId, 10, `${hostName}에게 매칭 신청`);
        }
        
        const newMatchId = "match-" + Date.now();
        const createdAt = new Date().toISOString();
        const newMatch = {
          id: newMatchId,
          campaignId: campaignId || '', // null 대신 빈 문자열
          clientId,
          clientName,
          hostId,
          hostName,
          message,
          status: "pending",
          createdAt
        };
        await sheetdbPost("matches", [newMatch]);

        // 캠페인의 proposalCount 증가
        if (campaignId) {
          const campRes = await sheetdbSearch("campaigns", { id: campaignId });
          if (campRes && campRes.length > 0) {
            const currentCount = parseInt(campRes[0].proposalCount) || 0;
            await sheetdbPatch("campaigns", "id", campaignId, { proposalCount: currentCount + 1 });
          }
        }
        return newMatch;
      } else if (isRealSupabase) {
        // 크레딧 차감 먼저 (10크레딧)
        await api.points.deduct(clientId, 10, `${hostName}에게 매칭 신청`);
        const { data, error } = await supabase.from('matches').insert([{
          campaign_id: campaignId,
          client_id: clientId,
          client_name: clientName,
          host_id: hostId,
          host_name: hostName,
          message,
          status: 'pending'
        }]).select().single();
        if (error) throw error;
        return data;
      } else {
        return mockDb.requestMatch(clientId, clientName, hostId, hostName, message, campaignId);
      }
    },
    listAll: async () => {
      if (isSheetdbActive) {
        const list = await sheetdbGet("matches");
        return list
          .map(m => ({
            ...m,
            campaignId: m.campaignId || m.campaignid || m.campaign_id,
            hostId: m.hostId || m.hostid || m.host_id,
            clientId: m.clientId || m.clientid || m.client_id
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (isRealSupabase) {
        const { data, error } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(d => ({
          id: d.id,
          campaignId: d.campaign_id,
          clientId: d.client_id,
          clientName: d.client_name,
          hostId: d.host_id,
          hostName: d.host_name,
          message: d.message,
          status: d.status,
          createdAt: d.created_at
        }));
      } else {
        const matches = JSON.parse(localStorage.getItem('matches') || '[]');
        return matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    },
    listForClient: async (clientId) => {
      if (isSheetdbActive) {
        const list = await sheetdbGet("matches");
        return list
          .map(m => ({
            ...m,
            campaignId: m.campaignId || m.campaignid || m.campaign_id,
            hostId: m.hostId || m.hostid || m.host_id,
            clientId: m.clientId || m.clientid || m.client_id
          }))
          .filter(m => String(m.clientId) === String(clientId))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (isRealSupabase) {
        const { data, error } = await supabase.from('matches').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(d => ({
          id: d.id,
          clientId: d.client_id,
          clientName: d.client_name,
          hostId: d.host_id,
          hostName: d.host_name,
          message: d.message,
          status: d.status,
          createdAt: d.created_at
        }));
      } else {
        return mockDb.getMatchesForClient(clientId);
      }
    },
    listForHost: async (hostId) => {
      if (isSheetdbActive) {
        const list = await sheetdbGet("matches");
        return list
          .map(m => ({
            ...m,
            campaignId: m.campaignId || m.campaignid || m.campaign_id,
            hostId: m.hostId || m.hostid || m.host_id,
            clientId: m.clientId || m.clientid || m.client_id
          }))
          .filter(m => String(m.hostId) === String(hostId))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (isRealSupabase) {
        const { data, error } = await supabase.from('matches').select('*').eq('host_id', hostId).order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(d => ({
          id: d.id,
          clientId: d.client_id,
          clientName: d.client_name,
          hostId: d.host_id,
          hostName: d.host_name,
          message: d.message,
          status: d.status,
          createdAt: d.created_at
        }));
      } else {
        return mockDb.getMatchesForHost(hostId);
      }
    },
    respond: async (matchId, status) => {
      if (isSheetdbActive) {
        await sheetdbPatch("matches", "id", matchId, { status });
        return { success: true, matchId, status };
      } else if (isRealSupabase) {
        const { error } = await supabase.from('matches').update({ status }).eq('id', matchId);
        if (error) throw error;
        return { success: true, matchId, status };
      } else {
        return mockDb.respondMatch(matchId, status);
      }
    },
    update: async (matchId, updates) => {
      if (isSheetdbActive) {
        await sheetdbPatch("matches", "id", matchId, updates);
        return { success: true, matchId, ...updates };
      } else if (isRealSupabase) {
        const { error } = await supabase.from('matches').update(updates).eq('id', matchId);
        if (error) throw error;
        return { success: true, matchId, ...updates };
      } else {
        const matches = JSON.parse(localStorage.getItem('matches') || '[]');
        const updated = matches.map(m => m.id === matchId ? { ...m, ...updates } : m);
        localStorage.setItem('matches', JSON.stringify(updated));
        return { success: true, matchId, ...updates };
      }
    }

  }
};
