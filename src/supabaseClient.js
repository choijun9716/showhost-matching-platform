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
  const response = await fetch(`${sheetdbApiUrl}/${idColumn}/${idValue}?sheet=${sheetName}`, {
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
      { id: 'client-1', email: 'client@test.com', password: 'password123', name: '테스트 브랜드', role: 'client' },
      ...INITIAL_MOCK_PROFILES.map(host => ({
        id: host.id,
        email: host.email,
        password: 'password123',
        name: host.name,
        role: 'showhost'
      }))
    ]));
  }
  if (!localStorage.getItem('profiles')) {
    localStorage.setItem('profiles', JSON.stringify(INITIAL_MOCK_PROFILES));
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
    const newUser = { id: 'user-' + Date.now(), email, password, name, role };
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
        reviews: 0
      };
      profiles.push(newProfile);
      localStorage.setItem('profiles', JSON.stringify(profiles));
    }
    
    return { user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } };
  },

  signIn: async (email, password) => {
    initMockDatabase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
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

  // 매칭 기능
  requestMatch: async (clientId, clientName, hostId, hostName, message) => {
    initMockDatabase();
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    const newMatch = {
      id: 'match-' + Date.now(),
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
    return newMatch;
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
        await sheetdbPost("users", [{ id: newUserId, email, password, name, role }]);
        
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
        return { user: { id: newUserId, email, name, role } };
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
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
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
    }
  },
  profiles: {
    list: async () => {
      if (isSheetdbActive) {
        const list = await sheetdbGet("profiles");
        return list.map(p => ({
          ...p,
          rating: parseFloat(p.rating || 5.0),
          reviews: parseInt(p.reviews || 0)
        }));
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
        const res = await sheetdbSearch("profiles", { id });
        if (!res || res.length === 0) return null;
        const p = res[0];
        return {
          ...p,
          rating: parseFloat(p.rating || 5.0),
          reviews: parseInt(p.reviews || 0)
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
        await sheetdbPatch("profiles", "id", id, data);
        
        // 이름 변경 시 users 테이블과 동기화
        if (data.name) {
          await sheetdbPatch("users", "id", id, { name: data.name });
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
    }
  },
  matches: {
    request: async (clientId, clientName, hostId, hostName, message) => {
      if (isSheetdbActive) {
        const newMatchId = "match-" + Date.now();
        const createdAt = new Date().toISOString();
        const newMatch = {
          id: newMatchId,
          clientId,
          clientName,
          hostId,
          hostName,
          message,
          status: "pending",
          createdAt
        };
        await sheetdbPost("matches", [newMatch]);
        return newMatch;
      } else if (isRealSupabase) {
        const { data, error } = await supabase.from('matches').insert([{
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
        return mockDb.requestMatch(clientId, clientName, hostId, hostName, message);
      }
    },
    listForClient: async (clientId) => {
      if (isSheetdbActive) {
        const list = await sheetdbGet("matches");
        return list
          .filter(m => m.clientId === clientId)
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
          .filter(m => m.hostId === hostId)
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
        const { data, error } = await supabase.from('matches').update({ status }).eq('id', matchId).select().single();
        if (error) throw error;
        return data;
      } else {
        return mockDb.respondMatch(matchId, status);
      }
    }
  }
};
