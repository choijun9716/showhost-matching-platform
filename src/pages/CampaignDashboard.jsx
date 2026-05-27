import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../supabaseClient';
import { Megaphone, Calendar, MapPin, Tag, ChevronDown, ChevronUp, CheckCircle, Clock, XCircle, Award, Plus, Zap } from 'lucide-react';

const STATUS_LABEL = {
  open: { text: '모집중', color: '#818cf8', bg: 'rgba(99,102,241,0.12)' },
  confirmed: { text: '확정완료', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  closed: { text: '종료', color: 'hsl(var(--foreground-muted))', bg: 'rgba(255,255,255,0.06)' },
};

const MATCH_STATUS = {
  pending: { icon: <Clock size={13} />, text: '검토중', color: '#f59e0b' },
  accepted: { icon: <CheckCircle size={13} />, text: '수락', color: '#22c55e' },
  rejected: { icon: <XCircle size={13} />, text: '거절', color: '#ef4444' },
  confirmed: { icon: <Award size={13} />, text: '최종확정', color: '#818cf8' },
  closed: { icon: <XCircle size={13} />, text: '마감', color: 'hsl(var(--foreground-muted))' },
};

const CampaignDashboard = ({ onCreateCampaign }) => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [proposals, setProposals] = useState({}); // { campaignId: [matches] }
  const [expanded, setExpanded] = useState(null);
  const [hostsMap, setHostsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.campaigns.listForClient(user.id);
      setCampaigns(data);
      
      const profiles = await api.profiles.list();
      const hMap = {};
      profiles.forEach(p => hMap[p.id] = p);
      setHostsMap(hMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (campaignId) => {
    if (expanded === campaignId) {
      setExpanded(null);
      return;
    }
    setExpanded(campaignId);
    if (!proposals[campaignId]) {
      const data = await api.campaigns.getProposals(campaignId);
      setProposals(prev => ({ ...prev, [campaignId]: data }));
    }
  };

  const handleConfirm = async (campaign, hostId, hostName) => {
    if (!window.confirm(`"${hostName}" 쇼호스트를 최종 확정하시겠습니까?\n확정 후 다른 수락자들은 자동으로 마감됩니다.`)) return;
    setConfirming(campaign.id + hostId);
    try {
      await api.campaigns.confirm(campaign.id, hostId, hostName);
      // 로컬 상태 업데이트
      setCampaigns(prev => prev.map(c => c.id === campaign.id
        ? { ...c, status: 'confirmed', confirmedHostId: hostId, confirmedHostName: hostName }
        : c
      ));
      const updated = await api.campaigns.getProposals(campaign.id);
      setProposals(prev => ({ ...prev, [campaign.id]: updated }));
    } catch (err) {
      alert('확정 중 오류: ' + err.message);
    } finally {
      setConfirming(null);
    }
  };

  const handleCloseCampaign = async (campaign) => {
    if (!window.confirm(`"${campaign.brandName}" 캠페인을 조기 마감하시겠습니까?`)) return;
    try {
      await api.campaigns.close(campaign.id);
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, status: 'closed' } : c));
    } catch (err) {
      alert('마감 중 오류: ' + err.message);
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return '-';
    try {
      return new Date(schedule).toLocaleString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return schedule; }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="loading-spinner" />
        <p style={{ marginTop: '16px', color: 'hsl(var(--foreground-muted))' }}>캠페인을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>내 캠페인</h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>
            총 {campaigns.length}개의 캠페인
          </p>
        </div>
        <button
          onClick={onCreateCampaign}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
        >
          <Plus size={16} />
          새 캠페인
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <Megaphone size={48} color="hsl(var(--foreground-muted))" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>아직 캠페인이 없습니다</h3>
          <p style={{ color: 'hsl(var(--foreground-muted))', fontSize: '0.9rem', marginBottom: '24px' }}>
            캠페인을 만들고 원하는 쇼호스트에게 제안을 보내보세요!
          </p>
          <button onClick={onCreateCampaign} className="btn btn-primary" style={{ display: 'inline-flex', gap: '6px' }}>
            <Plus size={16} /> 첫 캠페인 만들기
          </button>
        </div>
      ) : (
        campaigns.map(campaign => {
          const statusInfo = STATUS_LABEL[campaign.status] || STATUS_LABEL.open;
          const isExpanded = expanded === campaign.id;
          const campProposals = proposals[campaign.id] || [];
          const acceptedProposals = campProposals.filter(p => p.status === 'accepted');

          return (
            <div key={campaign.id} className="glass-panel" style={{ overflow: 'hidden' }}>
              {/* 캠페인 헤더 */}
              <div
                style={{ padding: '20px 24px', cursor: 'pointer' }}
                onClick={() => handleExpand(campaign.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {statusInfo.text}
                        {campaign.status === 'open' && typeof campaign.confirmedHostId === 'string' && campaign.confirmedHostId.length > 0 && ` (${campaign.confirmedHostId.split(',').length}/${campaign.recruitCount || 1}명 확정)`}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{campaign.brandName}</h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'hsl(var(--foreground-muted))' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={13} color="#818cf8" />
                        {formatSchedule(campaign.schedule)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={13} color="#818cf8" />
                        {campaign.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Tag size={13} color="#818cf8" />
                        {campaign.category}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Users size={13} color="#818cf8" />
                        모집: {campaign.recruitCount || 1}명
                      </span>
                      {campaign.endDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444' }}>
                          <Clock size={13} color="#ef4444" />
                          마감: {formatSchedule(campaign.endDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <div style={{ color: 'hsl(var(--foreground-muted))' }}>제안 발송</div>
                      <div style={{ fontWeight: 700, color: '#818cf8' }}>{campaign.proposalCount || 0}명</div>
                    </div>
                    {campaign.status === 'open' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCloseCampaign(campaign); }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        마감하기
                      </button>
                    )}
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* 확정된 호스트 목록 */}
                {(typeof campaign.confirmedHostId === 'string' && campaign.confirmedHostId.length > 0) && (
                  <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {campaign.confirmedHostId.split(',').map((hId, index) => {
                      const hName = campaign.confirmedHostName ? campaign.confirmedHostName.split(',')[index] : '알 수 없음';
                      return (
                        <div key={hId} style={{
                          padding: '10px 14px',
                          background: 'rgba(34,197,94,0.08)',
                          border: '1px solid rgba(34,197,94,0.2)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '0.88rem'
                        }}>
                          {hostsMap[hId]?.profileImage ? (
                            <img 
                              src={hostsMap[hId].profileImage} 
                              alt={hName} 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(34,197,94,0.3)' }}
                            />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Award size={16} color="#22c55e" />
                            </div>
                          )}
                          <div>
                            <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>최종 확정 쇼호스트 {index + 1}</div>
                            <div style={{ fontWeight: 600 }}>{hName}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 펼쳐진 제안 목록 */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}>
                  {campaign.description && (
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem', color: 'hsl(var(--foreground-muted))' }}>
                      {campaign.description}
                    </div>
                  )}

                  <div style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', color: 'hsl(var(--foreground-muted))' }}>
                      제안 현황 ({campProposals.length}건)
                    </div>

                    {campProposals.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'hsl(var(--foreground-muted))', fontSize: '0.88rem' }}>
                        아직 제안을 보낸 쇼호스트가 없습니다.<br/>
                        쇼호스트 목록에서 제안을 보내보세요!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {campProposals.map(proposal => {
                          const matchStatus = MATCH_STATUS[proposal.status] || MATCH_STATUS.pending;
                          const canConfirm = campaign.status === 'open' && proposal.status === 'accepted';
                          return (
                            <div key={proposal.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '10px',
                              gap: '12px',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {hostsMap[proposal.hostId]?.profileImage ? (
                                  <img 
                                    src={hostsMap[proposal.hostId].profileImage} 
                                    alt={proposal.hostName} 
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                                  />
                                ) : (
                                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={18} color="rgba(255,255,255,0.3)" />
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{proposal.hostName}</div>
                                  {proposal.message && (
                                    <div style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground-muted))', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
                                      {proposal.message}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                  display: 'flex', alignItems: 'center', gap: '4px',
                                  fontSize: '0.82rem', fontWeight: 600, color: matchStatus.color
                                }}>
                                  {matchStatus.icon} {matchStatus.text}
                                </span>
                                {canConfirm && (
                                  <button
                                    onClick={() => handleConfirm(campaign, proposal.hostId, proposal.hostName)}
                                    disabled={confirming === campaign.id + proposal.hostId}
                                    className="btn btn-primary"
                                    style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Award size={13} />
                                    {confirming === campaign.id + proposal.hostId ? '처리중...' : '최종 확정'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CampaignDashboard;
