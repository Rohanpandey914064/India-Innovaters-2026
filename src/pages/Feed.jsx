import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThumbsUp, ThumbsDown, MapPin, Tag, Clock, ArrowUpDown, Search, MessageSquare, MoreHorizontal, Plus, ChevronDown, Send, Zap, Activity, Sparkles, Gauge, Users, Image as ImageIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { SmartInput } from '@/components/ui/SmartInput';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const { t } = useLanguage();
  const label = t(status);
  
  switch(status) {
    case 'Reported':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-destructive/10 text-destructive border border-destructive/20"><span className="w-1.5 h-1.5 rounded-full bg-destructive mr-1.5"></span>{label}</span>;
    case 'In Progress':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>{label}</span>;
    case 'Resolved':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>{label}</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-secondary text-secondary-foreground"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-1.5"></span>{label}</span>;
  }
}

const PriorityBadge = ({ score, label }) => {
  const { t } = useLanguage();
  if (!score) return null;
  
  const colors = {
    'Critical': 'bg-red-600 text-white border-red-700',
    'High': 'bg-orange-500 text-white border-orange-600',
    'Medium': 'bg-amber-400 text-black border-amber-500',
    'Low': 'bg-slate-200 text-slate-700 border-slate-300'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border shadow-sm text-[11px] font-bold uppercase tracking-tight ${colors[label] || colors['Low']}`}>
      <Zap className="w-3 h-3 fill-current" />
      {t('Priority')}: {score}% ({t(label)})
    </div>
  );
};

const IssueCard = ({ issue, onVote, userVote, issueComments, onAddComment, currentUser, viewMode = 'horizontal' }) => {
  const { t } = useLanguage();
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');

  const getDisplayTime = (value) => {
    if (!value) return t('Recently');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('Recently');
    return date.toLocaleDateString();
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    onAddComment(issue.id, {
      text: newComment.trim(),
      authorId: currentUser.id,
      authorName: currentUser.name || 'Citizen'
    });
    setNewComment('');
  };

  const isVertical = viewMode === 'vertical';

  return (
    <Card className={`${isVertical ? 'mb-0 h-full' : 'mb-4'} overflow-hidden rounded-2xl border border-border/60 bg-card/95 hover:border-primary/35 hover:shadow-[0_10px_28px_hsl(var(--primary)/0.14)] transition-all duration-300 group`}>
      <CardContent className={`p-0 flex h-full ${isVertical ? 'flex-col' : 'flex-col md:flex-row'}`}>
        <div className={`${isVertical ? 'w-full h-44' : 'md:w-[230px] h-44 md:h-auto md:min-h-[228px]'} overflow-hidden relative shrink-0 bg-muted`}>
          {issue.img ? (
            <img src={issue.img} alt={t(issue.title)} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/15 via-card to-secondary/20 flex items-center justify-center">
              <div className="h-14 w-14 rounded-2xl bg-background/90 border border-border/70 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden"></div>
        </div>
        <div className={`p-4 sm:p-5 flex-1 flex flex-col relative bg-gradient-to-br from-card to-card/70 ${isVertical ? 'min-h-[250px]' : 'min-h-[228px]'}`}>
          <div className="flex justify-between items-start mb-3 gap-4">
            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <StatusBadge status={issue.progress} />
                <span className="flex items-center text-xs font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
                  <Tag className="h-3 w-3 mr-1"/>
                  {t(issue.category)}
                </span>
                <PriorityBadge score={issue.priorityScore} label={issue.priorityLabel} />
                <span className="text-xs text-muted-foreground flex items-center ml-auto sm:ml-0"><Clock className="h-3 w-3 mr-1"/> {getDisplayTime(issue.createdAt || issue.timestamp)}</span>
              </div>
              <h3 className="text-xl font-extrabold leading-tight group-hover:text-primary transition-colors whitespace-normal line-clamp-2 tracking-tight">
                {t(issue.title)}
              </h3>
              <div className="flex flex-col text-sm text-muted-foreground mt-1 w-full">
                <div className="flex items-center truncate">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0 text-primary/70" /> {t(issue.location)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 items-end shrink-0" onClick={e => e.stopPropagation()}>
                <div className="flex items-center bg-background/90 border border-border/70 rounded-2xl shadow-sm p-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-xl transition-all ${userVote === 1 ? 'text-emerald-700 bg-emerald-500/15 hover:bg-emerald-500/25' : 'hover:bg-emerald-500/10 hover:text-emerald-700 text-muted-foreground'}`}
                    onClick={(e) => { e.preventDefault(); onVote(1); }}
                  >
                    <ThumbsUp className={`h-4 w-4 ${userVote === 1 ? 'fill-current' : ''}`} />
                  </Button>
                  <span className={`font-bold px-2.5 min-w-[2rem] text-center text-sm ${userVote === 1 ? 'text-emerald-700' : 'text-foreground'}`}>
                    {issue.upvotes !== undefined ? issue.upvotes : (issue.votes || 0)}
                  </span>
                </div>
                <div className="flex items-center bg-background/90 border border-border/70 rounded-xl px-1.5 py-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 rounded-lg transition-all ${userVote === -1 ? 'text-destructive bg-destructive/15 hover:bg-destructive/25' : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'}`}
                    onClick={(e) => { e.preventDefault(); onVote(-1); }}
                  >
                    <ThumbsDown className={`h-4 w-4 ${userVote === -1 ? 'fill-current' : ''}`} />
                  </Button>
                  <span className={`font-semibold text-[11px] pr-1 ${userVote === -1 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {issue.downvotes || 0}
                  </span>
                </div>
            </div>
          </div>
          <p className="text-muted-foreground/90 line-clamp-3 text-sm leading-relaxed mb-4 mt-1">
            {t(issue.description || "No description provided for this issue.")}
          </p>

          <div className="mt-auto pt-4 border-t border-border/50 flex flex-wrap items-center justify-between text-sm">
             <div className="flex items-center gap-5 text-muted-foreground font-medium">
                <button 
                onClick={(e) => { e.stopPropagation(); setIsCommentsExpanded(!isCommentsExpanded); }}
                className={`flex items-center transition-colors ${isCommentsExpanded ? 'text-primary' : 'hover:text-primary'}`}
               >
                 <MessageSquare className={`w-4 h-4 mr-1.5 ${isCommentsExpanded ? 'fill-primary/20' : ''}`} /> 
                 {issueComments.length} {issueComments.length === 1 ? t('comment') : t('comments')}
               </button>
             </div>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
               <MoreHorizontal className="w-4 h-4" />
             </Button>
          </div>
          
          <AnimatePresence>
            {isCommentsExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-2 border-t border-border/30 space-y-4" onClick={e => e.stopPropagation()}>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                    {issueComments.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-2 font-medium">📭 {t('No comments yet. Be the first!')}</p>
                    ) : (
                      issueComments.map(comment => (
                        <div key={comment.id} className="bg-background/50 rounded-xl p-3 text-sm border border-border/40 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] uppercase">
                                {comment.authorName.charAt(0)}
                              </div>
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{new Date(comment.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-muted-foreground leading-relaxed pl-5.5">{t(comment.text)}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <form onSubmit={handleCommentSubmit} className="flex gap-2 relative">
                    <SmartInput 
                      placeholder={currentUser ? t('Add a comment...') : t('Log in to comment')}
                      className="bg-background shadow-sm pr-10 rounded-full h-9 text-sm"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onVoiceUpdate={(text) => setNewComment(newComment ? newComment + ' ' + text : text)}
                      disabled={!currentUser}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!newComment.trim() || !currentUser}
                      className="h-7 w-7 rounded-full absolute right-1 top-1 transition-transform active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5 ml-[-1px]" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

const Feed = () => {
  const { issues, voteIssue, votes, comments, addComment, addNotification } = useApp();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isWithinRadius } = useApp();
  const NEARBY_RADIUS_KM = 5;
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [userCoords, setUserCoords] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState('horizontal');
  const [showResolved, setShowResolved] = useState(false);

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err)
      );
    }
  }, []);

  const effectiveCoords = userCoords || ((user?.lat && user?.lng) ? { lat: user.lat, lng: user.lng } : null);
  
  const sortOptions = [
    { value: 'latest', label: t('Latest') },
    { value: 'most_upvoted', label: t('Most Upvoted') },
    { value: 'nearest', label: t('Nearest') }
  ];

  const processedIssues = useMemo(() => {
    // First deduplicate by ID to ensure no duplicate issues are displayed
    const seen = new Set();
    const deduped = [...issues].filter(i => {
      const id = String(i?.id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    
    return deduped
      .filter(i => {
        if (nearbyOnly && effectiveCoords) {
          return isWithinRadius({ lat: i.lat, lng: i.lng }, effectiveCoords, NEARBY_RADIUS_KM);
        }
        return true;
      })
      .filter(i => filter === 'All' ? true : i.category === filter)
      .filter(i => showResolved ? i.progress === 'Resolved' : i.progress !== 'Resolved')
      .filter(i => {
        if (!searchText.trim()) return true;
        const q = searchText.toLowerCase();
        return (
          (i.title || '').toLowerCase().includes(q) ||
          (i.description || '').toLowerCase().includes(q) ||
          (i.location || '').toLowerCase().includes(q) ||
          (i.address || '').toLowerCase().includes(q)
        );
      })
      .filter(i => {
        if (authorFilter === 'mine') return i.authorId === user?.id;
        if (authorFilter === 'others') return i.authorId !== user?.id;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'most_upvoted') {
          const aVotes = a.upvotes !== undefined ? a.upvotes : (a.votes || 0);
          const bVotes = b.upvotes !== undefined ? b.upvotes : (b.votes || 0);
          return bVotes - aVotes;
        }
        return (b.id - a.id);
      });
  }, [issues, nearbyOnly, effectiveCoords, isWithinRadius, filter, searchText, authorFilter, user?.id, sortBy, showResolved]);

  const myReportsCount = issues.filter((i) => i.authorId === user?.id).length;
  const nearbyCount = effectiveCoords
    ? issues.filter((i) => i.progress !== 'Resolved' && isWithinRadius({ lat: i.lat, lng: i.lng }, effectiveCoords, NEARBY_RADIUS_KM)).length
    : issues.filter((i) => i.progress !== 'Resolved').length;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-card/50 to-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply opacity-35"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl mix-blend-multiply opacity-25"></div>
      </div>
      <div className="container mx-auto px-4 py-8 lg:py-10 max-w-7xl relative z-10">
        <section className="rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_10%_20%,hsl(var(--primary)/0.17),transparent_36%),hsl(var(--card))] p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {t('Community Pulse')}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{t('Civic Issue Feed')}</h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl">{t('Real-time reports from your community. Vote on issues to increase their priority.')}</p>
            </div>
            <Button asChild className="rounded-full shadow-sm font-semibold pl-3 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link to="/report">
                <Plus className="w-5 h-5 mr-1.5" /> {t('Report Issue')}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" /> {t('Visible Issues')}</div>
              <p className="text-2xl font-black tracking-tight">{processedIssues.length}</p>
            </div>
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {t('My Reports')}</div>
              <p className="text-2xl font-black tracking-tight">{myReportsCount}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t(`Nearby (${NEARBY_RADIUS_KM}km)`)}</div>
              <p className="text-2xl font-black tracking-tight">{nearbyCount}</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_45%),hsl(var(--card)/0.85)] backdrop-blur-md p-4 shadow-sm space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px_220px] gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <SmartInput
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onVoiceUpdate={(text) => setSearchText(prev => (prev ? `${prev} ${text}` : text))}
                  placeholder={t('Search by issue, location, or address...')}
                  className="pl-9 rounded-xl"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between rounded-xl border-border/60 shadow-sm font-medium bg-background">
                    <span className="inline-flex items-center"><ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />{sortOptions.find(o => o.value === sortBy)?.label}</span>
                    <ChevronDown className="w-4 h-4 ml-2 text-muted-foreground opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px] rounded-xl">
                  {sortOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`cursor-pointer rounded-lg ${sortBy === option.value ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl border border-primary/20">
                <button onClick={() => setNearbyOnly(true)} className={`flex-1 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${nearbyOnly ? 'bg-primary text-white shadow' : 'text-muted-foreground'}`}>
                  📍 {t('NEARBY')}
                </button>
                <button onClick={() => setNearbyOnly(false)} className={`flex-1 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${!nearbyOnly ? 'bg-primary text-white shadow' : 'text-muted-foreground'}`}>
                  🌐 {t('GLOBAL')}
                </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
              <div className="flex gap-2 xl:items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-xl border-primary/20 shadow-sm font-medium bg-secondary/50 min-w-[180px] justify-between">
                      <span>{t(filter)}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[220px] rounded-xl">
                    {[
                      { key: 'All', label: t('All') },
                      { key: 'Infrastructure', label: t('Infrastructure') },
                      { key: 'Electricity', label: t('Electricity') },
                      { key: 'Water', label: t('Water') },
                      { key: 'Sanitation', label: t('Sanitation') },
                    ].map(({ key, label }) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`cursor-pointer rounded-lg ${filter === key ? 'bg-primary/10 text-primary font-medium' : ''}`}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'active', label: t('ACTIVE') },
                    { value: 'resolved', label: t('RESOLVED') },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setShowResolved(opt.value === 'resolved')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium text-left transition-all ${(opt.value === 'resolved' ? showResolved : !showResolved) ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: t('All Reports') },
                    { value: 'mine', label: t('My Reports') },
                    { value: 'others', label: t('Others') },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setAuthorFilter(opt.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium text-left transition-all ${authorFilter === opt.value ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('horizontal')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'horizontal' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                  >
                    {t('Horizontal')}
                  </button>
                  <button
                    onClick={() => setViewMode('vertical')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${viewMode === 'vertical' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                  >
                    {t('Vertical')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={viewMode === 'vertical' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : ''}>
            <AnimatePresence mode="popLayout">
              {processedIssues.map((issue, idx) => (
                <motion.div
                  key={issue.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.35, delay: idx * 0.03, ease: [0.23, 1, 0.32, 1] }}
                >
                  <IssueCard
                    issue={issue}
                    viewMode={viewMode}
                    userVote={(votes || {})[issue.id]?.[user?.id] || 0}
                    onVote={(val) => {
                      if (user?.id) {
                        voteIssue(issue.id, user.id, val, effectiveCoords);
                      } else {
                        addNotification(t('logInToPulse'), 'info');
                      }
                    }}
                    issueComments={comments[issue.id] || []}
                    onAddComment={addComment}
                    currentUser={user}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {processedIssues.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-card rounded-2xl border border-dashed border-border/60 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 rounded-2xl"></div>
                <div className="h-16 w-16 bg-muted rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-sm">
                  <Search className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">{t('No issues reported yet')}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6 relative z-10">
                  {t('It looks quiet here! Be the first to report an issue in the')} <span className="text-foreground font-medium">{t(filter)}</span> {t('category.')}
                </p>
                <Button asChild className="relative z-10 shadow-antigravity rounded-full px-6">
                  <Link to="/report">{t('Report an Issue')} <Plus className="w-4 h-4 ml-2" /></Link>
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Feed;
