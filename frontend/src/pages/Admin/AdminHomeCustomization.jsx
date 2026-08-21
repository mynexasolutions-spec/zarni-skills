import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  GalleryHorizontal, Briefcase, Plus, Pencil, Trash2, X, ImagePlus, CheckCircle2, Check, LayoutTemplate, Sparkles,
  HelpCircle, PlayCircle, Quote, Save, Star, Trophy, LayoutGrid, User, Activity, Shield, Award, TrendingUp, Zap, Target, Gift, Medal, ChevronDown, ExternalLink
} from 'lucide-react';
import api from '../../utils/api';

const EMPTY_BANNER_FORM = { display_order: '0', is_active: true };
const EMPTY_TEAM_FORM = { name: '', designation: '', badge: '', bio: '', about: '', achievements: '', color: '#3b82f6', display_order: '0', is_active: true };
const EMPTY_HERO_FORM = { heading_line1: '', heading_line2: '', paragraph: '', display_order: '0', is_active: true };
const EMPTY_FAQ_FORM = { question: '', answer: '', display_order: '0', is_active: true };
const EMPTY_STORY_FORM = { name: '', role: '', headline: '', duration: '', display_order: '0', is_active: true };
const EMPTY_TESTIMONIAL_FORM = { name: '', role: '', text: '', display_order: '0', is_active: true };
const EMPTY_PLATFORM_FORM = { title: '', description: '', icon: 'Star', gradient: 'from-blue-600 to-indigo-600', display_order: '0', is_active: true };
const EMPTY_REWARDS_CONTENT = {
  badge_text: '', heading_line1: '', heading_line2: '', ribbon_text: '',
  description: '', description_highlight: '',
  intro_features: [], perks: [],
  cta_title: '', cta_subtitle: '', cta_button_text: '', cta_button_link: '',
  is_active: true,
};
const HERO_SLIDES_LIMIT = 5;

// Small local editors for the Achievement Rewards content form.
function RewardField({ label, value, onChange, placeholder, textarea }) {
  const cls = 'w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow';
  return (
    <div>
      <label className="block text-[11px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{label}</label>
      {textarea ? (
        <textarea rows={2} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-none`} />
      ) : (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function RewardListEditor({ items, onChange, titlePlaceholder, descPlaceholder }) {
  const list = items || [];
  const update = (i, key, val) => onChange(list.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400';
  return (
    <div className="space-y-3">
      {list.map((item, i) => (
        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex justify-end -mt-1 -mr-1">
            <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input value={item.title || ''} onChange={(e) => update(i, 'title', e.target.value)} placeholder={titlePlaceholder} className={inputCls} />
          <input value={item.desc || ''} onChange={(e) => update(i, 'desc', e.target.value)} placeholder={descPlaceholder} className={inputCls} />
        </div>
      ))}
      {list.length === 0 && <p className="text-xs text-slate-400">No items — this block will be hidden on the site.</p>}
      <button
        type="button"
        onClick={() => onChange([...list, { title: '', desc: '' }])}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wide hover:bg-red-100 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  );
}

const GRADIENT_OPTIONS = [
  'from-blue-600 to-indigo-600',
  'from-indigo-600 to-purple-600',
  'from-purple-600 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-blue-600',
];

const ICON_OPTIONS = ['CheckCircle2', 'User', 'Star', 'Activity', 'Shield', 'Award', 'TrendingUp', 'Zap', 'Sparkles', 'Trophy', 'Target', 'Gift', 'Medal'];
const PLATFORM_ICON_MAP = { CheckCircle2, User, Star, Activity, Shield, Award, TrendingUp, Zap, Sparkles, Trophy, Target, Gift, Medal };

const TABS = [
  { key: 'hero', label: 'Hero Section', icon: Sparkles },
  { key: 'banners', label: 'Homepage Banners', icon: GalleryHorizontal },
  { key: 'team', label: 'Homepage Team', icon: Briefcase },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'stories', label: 'Success Stories', icon: PlayCircle },
  { key: 'testimonials', label: 'Testimonials', icon: Quote },
  { key: 'rewards', label: 'Achievement Rewards', icon: Trophy },
  { key: 'platform', label: 'About Platform', icon: LayoutGrid },
];

export default function AdminHomeCustomization() {
  const [tab, setTab] = useState('hero');

  // ── Hero Slides state ──────────────────────────────────────
  const [heroSlides, setHeroSlides] = useState([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [showHeroForm, setShowHeroForm] = useState(false);
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [heroForm, setHeroForm] = useState(EMPTY_HERO_FORM);
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroError, setHeroError] = useState('');

  // ── Banners state ──────────────────────────────────────────
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState(EMPTY_BANNER_FORM);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerError, setBannerError] = useState('');

  // ── Team state ──────────────────────────────────────────────
  const [members, setMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM_FORM);
  const [memberImageFile, setMemberImageFile] = useState(null);
  const [memberImagePreview, setMemberImagePreview] = useState(null);
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamError, setTeamError] = useState('');

  // ── FAQ state ──────────────────────────────────────────────
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [faqForm, setFaqForm] = useState(EMPTY_FAQ_FORM);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqError, setFaqError] = useState('');

  // ── Success Stories state ────────────────────────────────────
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState(null);
  const [storyForm, setStoryForm] = useState(EMPTY_STORY_FORM);
  const [storyImageFile, setStoryImageFile] = useState(null);
  const [storyImagePreview, setStoryImagePreview] = useState(null);
  const [storyVideoFile, setStoryVideoFile] = useState(null);
  const [storyVideoPreview, setStoryVideoPreview] = useState(null);
  const [storySaving, setStorySaving] = useState(false);
  const [storyError, setStoryError] = useState('');

  // ── Testimonials state ───────────────────────────────────────
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState(EMPTY_TESTIMONIAL_FORM);
  const [testimonialImageFile, setTestimonialImageFile] = useState(null);
  const [testimonialImagePreview, setTestimonialImagePreview] = useState(null);
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [testimonialError, setTestimonialError] = useState('');

  // ── Testimonial aggregate stat state ─────────────────────────
  const [statsForm, setStatsForm] = useState({ rating: '4.9', student_count: '2500' });
  const [statsSaving, setStatsSaving] = useState(false);
  const [statsMsg, setStatsMsg] = useState('');

  // ── Achievement Rewards section content (text-only, no imagery) ──
  const [rewardsContent, setRewardsContent] = useState(EMPTY_REWARDS_CONTENT);
  const [rewardsSaving, setRewardsSaving] = useState(false);
  const [rewardsSaved, setRewardsSaved] = useState(false);
  const [rewardsError, setRewardsError] = useState('');

  // ── Platform Features state ──────────────────────────────────
  const [platformFeatures, setPlatformFeatures] = useState([]);
  const [platformLoading, setPlatformLoading] = useState(true);
  const [showPlatformForm, setShowPlatformForm] = useState(false);
  const [editingPlatformId, setEditingPlatformId] = useState(null);
  const [platformForm, setPlatformForm] = useState(EMPTY_PLATFORM_FORM);
  const [platformSaving, setPlatformSaving] = useState(false);
  const [platformError, setPlatformError] = useState('');

  const fetchHeroSlides = async () => {
    try {
      const res = await api.get('/admin/hero-slides');
      setHeroSlides(res.data.slides || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHeroLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await api.get('/admin/banners');
      setBanners(res.data.banners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await api.get('/admin/home-team');
      setMembers(res.data.team_members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      const res = await api.get('/admin/faqs');
      setFaqs(res.data.faqs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFaqLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await api.get('/admin/success-stories');
      setStories(res.data.stories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setStoriesLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/admin/testimonials');
      setTestimonials(res.data.testimonials || []);
      setStatsForm({
        rating: String(res.data.rating ?? '4.9'),
        student_count: String(res.data.student_count ?? '2500'),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const fetchRewardsContent = async () => {
    try {
      const res = await api.get('/admin/achievement-rewards');
      setRewardsContent({ ...EMPTY_REWARDS_CONTENT, ...(res.data.content || {}) });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlatformFeatures = async () => {
    try {
      const res = await api.get('/admin/platform-features');
      setPlatformFeatures(res.data.platform_features || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPlatformLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSlides(); fetchBanners(); fetchTeam();
    fetchFaqs(); fetchStories(); fetchTestimonials();
    fetchRewardsContent(); fetchPlatformFeatures();
  }, []);

  // ── Hero Slide handlers ───────────────────────────────────────
  const openCreateHero = () => {
    setEditingHeroId(null);
    setHeroForm(EMPTY_HERO_FORM);
    setHeroImageFile(null);
    setHeroImagePreview(null);
    setHeroError('');
    setShowHeroForm(true);
  };

  const openEditHero = (slide) => {
    setEditingHeroId(slide.id);
    setHeroForm({
      heading_line1: slide.heading_line1 || '',
      heading_line2: slide.heading_line2 || '',
      paragraph: slide.paragraph || '',
      display_order: String(slide.display_order ?? 0),
      is_active: slide.is_active !== false,
    });
    setHeroImageFile(null);
    setHeroImagePreview(slide.image_display_url || null);
    setHeroError('');
    setShowHeroForm(true);
  };

  const handleHeroImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImageFile(file);
    setHeroImagePreview(URL.createObjectURL(file));
  };

  const handleHeroSubmit = async (e) => {
    e.preventDefault();
    if (!editingHeroId && !heroImageFile) {
      setHeroError('Please upload a hero slide image.');
      return;
    }
    setHeroSaving(true);
    setHeroError('');
    try {
      const fd = new FormData();
      fd.append('heading_line1', heroForm.heading_line1);
      fd.append('heading_line2', heroForm.heading_line2);
      fd.append('paragraph', heroForm.paragraph);
      fd.append('display_order', heroForm.display_order || '0');
      fd.append('is_active', heroForm.is_active ? 'true' : 'false');
      if (heroImageFile) fd.append('image_file', heroImageFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingHeroId
        ? await api.put(`/admin/hero-slides/${editingHeroId}`, fd, headers)
        : await api.post('/admin/hero-slides', fd, headers);

      if (response.data.success) {
        setShowHeroForm(false);
        fetchHeroSlides();
      } else {
        setHeroError(response.data.message || 'Failed to save hero slide.');
      }
    } catch (err) {
      setHeroError(err.response?.data?.message || 'Failed to save hero slide.');
    } finally {
      setHeroSaving(false);
    }
  };

  const handleHeroDelete = async (id) => {
    if (!window.confirm('Permanently delete this hero slide? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/hero-slides/${id}`);
      fetchHeroSlides();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Banner handlers ────────────────────────────────────────
  const openCreateBanner = () => {
    setEditingBannerId(null);
    setBannerForm(EMPTY_BANNER_FORM);
    setBannerImageFile(null);
    setBannerImagePreview(null);
    setBannerError('');
    setShowBannerForm(true);
  };

  const openEditBanner = (banner) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      display_order: String(banner.display_order ?? 0),
      is_active: banner.is_active !== false,
    });
    setBannerImageFile(null);
    setBannerImagePreview(banner.image_display_url || null);
    setBannerError('');
    setShowBannerForm(true);
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerImageFile(file);
    setBannerImagePreview(URL.createObjectURL(file));
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!editingBannerId && !bannerImageFile) {
      setBannerError('Please upload a banner image.');
      return;
    }
    setBannerSaving(true);
    setBannerError('');
    try {
      const fd = new FormData();
      fd.append('display_order', bannerForm.display_order || '0');
      fd.append('is_active', bannerForm.is_active ? 'true' : 'false');
      if (bannerImageFile) fd.append('image_file', bannerImageFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingBannerId
        ? await api.put(`/admin/banners/${editingBannerId}`, fd, headers)
        : await api.post('/admin/banners', fd, headers);

      if (response.data.success) {
        setShowBannerForm(false);
        fetchBanners();
      } else {
        setBannerError(response.data.message || 'Failed to save banner.');
      }
    } catch (err) {
      setBannerError(err.response?.data?.message || 'Failed to save banner.');
    } finally {
      setBannerSaving(false);
    }
  };

  const handleBannerDelete = async (id) => {
    if (!window.confirm('Permanently delete this banner? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Team handlers ──────────────────────────────────────────
  const openCreateMember = () => {
    setEditingMemberId(null);
    setTeamForm(EMPTY_TEAM_FORM);
    setMemberImageFile(null);
    setMemberImagePreview(null);
    setTeamError('');
    setShowTeamForm(true);
  };

  const openEditMember = (member) => {
    setEditingMemberId(member.id);
    setTeamForm({
      name: member.name || '',
      designation: member.designation || '',
      badge: member.badge || '',
      bio: member.bio || '',
      about: member.about || '',
      achievements: member.achievements || '',
      color: member.color || '#3b82f6',
      display_order: String(member.display_order ?? 0),
      is_active: member.is_active !== false,
    });
    setMemberImageFile(null);
    setMemberImagePreview(member.image_display_url || null);
    setTeamError('');
    setShowTeamForm(true);
  };

  const handleMemberImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMemberImageFile(file);
    setMemberImagePreview(URL.createObjectURL(file));
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamForm.name.trim() || !teamForm.designation.trim()) {
      setTeamError('Name and designation are required.');
      return;
    }
    setTeamSaving(true);
    setTeamError('');
    try {
      const fd = new FormData();
      fd.append('name', teamForm.name);
      fd.append('designation', teamForm.designation);
      fd.append('badge', teamForm.badge);
      fd.append('bio', teamForm.bio);
      fd.append('about', teamForm.about);
      fd.append('achievements', teamForm.achievements);
      fd.append('color', teamForm.color);
      fd.append('display_order', teamForm.display_order || '0');
      fd.append('is_active', teamForm.is_active ? 'true' : 'false');
      if (memberImageFile) fd.append('image_file', memberImageFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingMemberId
        ? await api.put(`/admin/home-team/${editingMemberId}`, fd, headers)
        : await api.post('/admin/home-team', fd, headers);

      if (response.data.success) {
        setShowTeamForm(false);
        fetchTeam();
      } else {
        setTeamError(response.data.message || 'Failed to save team member.');
      }
    } catch (err) {
      setTeamError(err.response?.data?.message || 'Failed to save team member.');
    } finally {
      setTeamSaving(false);
    }
  };

  const handleMemberDelete = async (id) => {
    if (!window.confirm('Permanently delete this team member? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/home-team/${id}`);
      fetchTeam();
    } catch (err) {
      console.error(err);
    }
  };

  // ── FAQ handlers ───────────────────────────────────────────
  const openCreateFaq = () => {
    setEditingFaqId(null);
    setFaqForm(EMPTY_FAQ_FORM);
    setFaqError('');
    setShowFaqForm(true);
  };

  const openEditFaq = (item) => {
    setEditingFaqId(item.id);
    setFaqForm({
      question: item.question || '',
      answer: item.answer || '',
      display_order: String(item.display_order ?? 0),
      is_active: item.is_active !== false,
    });
    setFaqError('');
    setShowFaqForm(true);
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      setFaqError('Both a question and an answer are required.');
      return;
    }
    setFaqSaving(true);
    setFaqError('');
    try {
      const payload = { ...faqForm, display_order: faqForm.display_order || '0' };
      const response = editingFaqId
        ? await api.put(`/admin/faqs/${editingFaqId}`, payload)
        : await api.post('/admin/faqs', payload);

      if (response.data.success) {
        setShowFaqForm(false);
        fetchFaqs();
      } else {
        setFaqError(response.data.message || 'Failed to save FAQ.');
      }
    } catch (err) {
      setFaqError(err.response?.data?.message || 'Failed to save FAQ.');
    } finally {
      setFaqSaving(false);
    }
  };

  const handleFaqDelete = async (id) => {
    if (!window.confirm('Permanently delete this FAQ? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/faqs/${id}`);
      fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Success Story handlers ────────────────────────────────────
  const openCreateStory = () => {
    setEditingStoryId(null);
    setStoryForm(EMPTY_STORY_FORM);
    setStoryImageFile(null);
    setStoryImagePreview(null);
    setStoryVideoFile(null);
    setStoryVideoPreview(null);
    setStoryError('');
    setShowStoryForm(true);
  };

  const openEditStory = (story) => {
    setEditingStoryId(story.id);
    setStoryForm({
      name: story.name || '',
      role: story.role || '',
      headline: story.headline || '',
      duration: story.duration || '',
      display_order: String(story.display_order ?? 0),
      is_active: story.is_active !== false,
    });
    setStoryImageFile(null);
    setStoryImagePreview(story.image_display_url || null);
    setStoryVideoFile(null);
    setStoryVideoPreview(story.video_display_url || null);
    setStoryError('');
    setShowStoryForm(true);
  };

  const handleStoryImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoryImageFile(file);
    setStoryImagePreview(URL.createObjectURL(file));
  };

  const handleStoryVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoryVideoFile(file);
    setStoryVideoPreview(URL.createObjectURL(file));
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    if (!storyForm.name.trim()) {
      setStoryError('A name is required.');
      return;
    }
    setStorySaving(true);
    setStoryError('');
    try {
      const fd = new FormData();
      fd.append('name', storyForm.name);
      fd.append('role', storyForm.role);
      fd.append('headline', storyForm.headline);
      fd.append('duration', storyForm.duration);
      fd.append('display_order', storyForm.display_order || '0');
      fd.append('is_active', storyForm.is_active ? 'true' : 'false');
      if (storyImageFile) fd.append('image_file', storyImageFile);
      if (storyVideoFile) fd.append('video_file', storyVideoFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingStoryId
        ? await api.put(`/admin/success-stories/${editingStoryId}`, fd, headers)
        : await api.post('/admin/success-stories', fd, headers);

      if (response.data.success) {
        setShowStoryForm(false);
        fetchStories();
      } else {
        setStoryError(response.data.message || 'Failed to save success story.');
      }
    } catch (err) {
      setStoryError(err.response?.data?.message || 'Failed to save success story.');
    } finally {
      setStorySaving(false);
    }
  };

  const handleStoryDelete = async (id) => {
    if (!window.confirm('Permanently delete this success story? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/success-stories/${id}`);
      fetchStories();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Testimonial handlers ──────────────────────────────────────
  const openCreateTestimonial = () => {
    setEditingTestimonialId(null);
    setTestimonialForm(EMPTY_TESTIMONIAL_FORM);
    setTestimonialImageFile(null);
    setTestimonialImagePreview(null);
    setTestimonialError('');
    setShowTestimonialForm(true);
  };

  const openEditTestimonial = (item) => {
    setEditingTestimonialId(item.id);
    setTestimonialForm({
      name: item.name || '',
      role: item.role || '',
      text: item.text || '',
      display_order: String(item.display_order ?? 0),
      is_active: item.is_active !== false,
    });
    setTestimonialImageFile(null);
    setTestimonialImagePreview(item.image_display_url || null);
    setTestimonialError('');
    setShowTestimonialForm(true);
  };

  const handleTestimonialImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestimonialImageFile(file);
    setTestimonialImagePreview(URL.createObjectURL(file));
  };

  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    if (!testimonialForm.name.trim() || !testimonialForm.text.trim()) {
      setTestimonialError('A name and testimonial text are required.');
      return;
    }
    setTestimonialSaving(true);
    setTestimonialError('');
    try {
      const fd = new FormData();
      fd.append('name', testimonialForm.name);
      fd.append('role', testimonialForm.role);
      fd.append('text', testimonialForm.text);
      fd.append('display_order', testimonialForm.display_order || '0');
      fd.append('is_active', testimonialForm.is_active ? 'true' : 'false');
      if (testimonialImageFile) fd.append('image_file', testimonialImageFile);

      const headers = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = editingTestimonialId
        ? await api.put(`/admin/testimonials/${editingTestimonialId}`, fd, headers)
        : await api.post('/admin/testimonials', fd, headers);

      if (response.data.success) {
        setShowTestimonialForm(false);
        fetchTestimonials();
      } else {
        setTestimonialError(response.data.message || 'Failed to save testimonial.');
      }
    } catch (err) {
      setTestimonialError(err.response?.data?.message || 'Failed to save testimonial.');
    } finally {
      setTestimonialSaving(false);
    }
  };

  const handleTestimonialDelete = async (id) => {
    if (!window.confirm('Permanently delete this testimonial? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    setStatsSaving(true);
    setStatsMsg('');
    try {
      const response = await api.post('/admin/testimonials/stats', {
        rating: statsForm.rating,
        student_count: statsForm.student_count,
      });
      if (response.data.success) {
        setStatsMsg('Saved.');
        setTimeout(() => setStatsMsg(''), 2000);
      }
    } catch (err) {
      setStatsMsg(err.response?.data?.message || 'Failed to save.');
    } finally {
      setStatsSaving(false);
    }
  };

  // ── Achievement Rewards content handlers ──────────────────────
  const setRewardsField = (key, value) => setRewardsContent(prev => ({ ...prev, [key]: value }));

  const handleRewardsSubmit = async (e) => {
    e.preventDefault();
    setRewardsSaving(true);
    setRewardsError('');
    setRewardsSaved(false);
    try {
      const response = await api.post('/admin/achievement-rewards', rewardsContent);
      if (response.data.success) {
        setRewardsSaved(true);
        setTimeout(() => setRewardsSaved(false), 3000);
      } else {
        setRewardsError(response.data.message || 'Failed to save section.');
      }
    } catch (err) {
      setRewardsError(err.response?.data?.message || 'Failed to save section.');
    } finally {
      setRewardsSaving(false);
    }
  };

  // ── Platform Feature handlers ─────────────────────────────────
  const openCreatePlatform = () => {
    setEditingPlatformId(null);
    setPlatformForm(EMPTY_PLATFORM_FORM);
    setPlatformError('');
    setShowPlatformForm(true);
  };

  const openEditPlatform = (item) => {
    setEditingPlatformId(item.id);
    setPlatformForm({
      title: item.title || '',
      description: item.description || '',
      icon: item.icon || 'Star',
      gradient: item.gradient || 'from-blue-600 to-indigo-600',
      display_order: String(item.display_order ?? 0),
      is_active: item.is_active !== false,
    });
    setPlatformError('');
    setShowPlatformForm(true);
  };

  const handlePlatformSubmit = async (e) => {
    e.preventDefault();
    if (!platformForm.title.trim()) {
      setPlatformError('Title is required.');
      return;
    }
    setPlatformSaving(true);
    setPlatformError('');
    try {
      const payload = { ...platformForm, display_order: platformForm.display_order || '0' };
      const response = editingPlatformId
        ? await api.put(`/admin/platform-features/${editingPlatformId}`, payload)
        : await api.post('/admin/platform-features', payload);

      if (response.data.success) {
        setShowPlatformForm(false);
        fetchPlatformFeatures();
      } else {
        setPlatformError(response.data.message || 'Failed to save feature.');
      }
    } catch (err) {
      setPlatformError(err.response?.data?.message || 'Failed to save feature.');
    } finally {
      setPlatformSaving(false);
    }
  };

  const handlePlatformDelete = async (id) => {
    if (!window.confirm('Permanently delete this feature card? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/platform-features/${id}`);
      fetchPlatformFeatures();
    } catch (err) {
      console.error(err);
    }
  };

  const loading = heroLoading || bannersLoading || teamLoading || faqLoading || storiesLoading || testimonialsLoading || platformLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="text-slate-800 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-500/25 shrink-0">
          <LayoutTemplate className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black">Home Customization</h2>
          <p className="text-xs text-slate-400">Manage the hero section, homepage banner slider, and the "Meet Our Expert Team" section.</p>
        </div>
      </div>

      {/* Mobile Select Dropdown (sm:hidden) */}
      <div className="sm:hidden mb-6">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Select Section</label>
        <div className="relative">
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200/90 rounded-2xl px-4 py-3 text-xs font-black uppercase text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 shadow-sm pr-10"
          >
            {TABS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Desktop / Tablet Tabs (hidden sm:flex) */}
      <div className="hidden sm:flex flex-wrap gap-2 mb-6 p-2 bg-slate-100/70 border border-slate-200/60 rounded-2xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
              tab === t.key 
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20 translate-y-0' 
                : 'bg-white border border-slate-200/80 text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50/20'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Hero Slides tab ────────────────────────────────── */}
      {tab === 'hero' && (
        <>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
              heroSlides.length >= HERO_SLIDES_LIMIT ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
            }`}>
              {heroSlides.length} / {HERO_SLIDES_LIMIT} slides used
            </span>
            <button
              onClick={openCreateHero}
              disabled={heroSlides.length >= HERO_SLIDES_LIMIT}
              title={heroSlides.length >= HERO_SLIDES_LIMIT ? `Limit of ${HERO_SLIDES_LIMIT} hero slides reached — delete one to add another` : undefined}
              className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <Plus className="w-4 h-4 relative" /> <span className="relative">Add Hero Slide</span>
            </button>
          </div>
          {heroSlides.length >= HERO_SLIDES_LIMIT && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-xs font-bold">
              You've reached the {HERO_SLIDES_LIMIT}-slide limit. Delete a slide below before adding a new one.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {heroSlides.map((slide, idx) => (
              <div key={slide.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 70}ms` }}>
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {slide.image_display_url ? (
                    <img src={slide.image_display_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-200">
                      <Sparkles className="w-10 h-10" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    slide.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                  }`}>{slide.is_active !== false ? 'Active' : 'Inactive'}</span>
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-900/70 text-white">
                    Order {slide.display_order}
                  </span>
                </div>
                <div className="p-5">
                  {(slide.heading_line1 || slide.heading_line2) && (
                    <h3 className="font-black text-slate-900 text-sm leading-snug break-words">
                      {slide.heading_line1} <span className="text-primary">{slide.heading_line2}</span>
                    </h3>
                  )}
                  {slide.paragraph && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{slide.paragraph}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEditHero(slide)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleHeroDelete(slide.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {heroSlides.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
                No hero slides uploaded yet. The homepage will show its default slides until you add one here.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Banners tab ────────────────────────────────────── */}
      {tab === 'banners' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openCreateBanner} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <Plus className="w-4 h-4 relative" /> <span className="relative">Add Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {banners.map((banner, idx) => (
              <div key={banner.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 70}ms` }}>
                {/* No fixed aspect ratio / object-cover here — a homepage banner is
                    a full designed graphic, so it must be previewed uncropped at its
                    own proportions, exactly as it renders on the site. */}
                <div className="bg-slate-100 relative overflow-hidden">
                  {banner.image_display_url ? (
                    <img src={banner.image_display_url} alt="" className="block w-full h-auto" />
                  ) : (
                    <div className="w-full aspect-video flex items-center justify-center text-red-200">
                      <GalleryHorizontal className="w-10 h-10" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    banner.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                  }`}>{banner.is_active !== false ? 'Active' : 'Inactive'}</span>
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-900/70 text-white">
                    Order {banner.display_order}
                  </span>
                </div>
                <div className="p-5 flex gap-2">
                  <button onClick={() => openEditBanner(banner)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleBannerDelete(banner.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
            {banners.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
                No banners uploaded yet. They'll appear on the homepage right after the hero section.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Team tab ───────────────────────────────────────── */}
      {tab === 'team' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openCreateMember} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <Plus className="w-4 h-4 relative" /> <span className="relative">Add Team Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {members.map((member, idx) => (
              <div key={member.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 70}ms` }}>
                <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                  {member.image_display_url ? (
                    <img src={member.image_display_url} alt={member.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-200">
                      <Briefcase className="w-10 h-10" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    member.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                  }`}>{member.is_active !== false ? 'Active' : 'Inactive'}</span>
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-900/70 text-white">
                    Order {member.display_order}
                  </span>
                  {member.badge && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider shadow-md" style={{ backgroundColor: member.color || '#3b82f6' }}>
                      {member.badge}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-black text-slate-900 leading-snug break-words">{member.name}</h3>
                  <p className="text-xs font-bold leading-snug break-words" style={{ color: member.color || '#3b82f6' }}>{member.designation}</p>
                  {member.bio && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{member.bio}</p>}
                  <div className="flex gap-2 mt-4">
                    <Link to={`/team/${member.slug || member.id}`} target="_blank" rel="noreferrer" className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" /> View Profile
                    </Link>
                    <button onClick={() => openEditMember(member)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleMemberDelete(member.id)} className="py-2 px-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
                No team members yet. They'll appear in the "Meet Our Expert Team" section on the homepage.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── FAQ tab ────────────────────────────────────────── */}
      {tab === 'faq' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openCreateFaq} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <Plus className="w-4 h-4 relative" /> <span className="relative">Add FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div key={item.id} className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up flex items-start gap-4" style={{ animationDelay: `${idx * 50}ms` }}>
                <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs font-black shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      item.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>{item.is_active !== false ? 'Active' : 'Inactive'}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Order {item.display_order}</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-sm leading-snug break-words">{item.question}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{item.answer}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEditFaq(item)} className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleFaqDelete(item.id)} className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
                No FAQs yet. They'll appear in the "Frequently Asked Questions" section on the homepage.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Success Stories tab ───────────────────────────────── */}
      {tab === 'stories' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openCreateStory} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <Plus className="w-4 h-4 relative" /> <span className="relative">Add Success Story</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stories.map((story, idx) => (
              <div key={story.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 70}ms` }}>
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {story.image_display_url ? (
                    <img src={story.image_display_url} alt={story.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-red-200">
                      <PlayCircle className="w-10 h-10" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    story.is_active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                  }`}>{story.is_active !== false ? 'Active' : 'Inactive'}</span>
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-900/70 text-white">
                    Order {story.display_order}
                  </span>
                  {story.duration && (
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">{story.duration}</span>
                  )}
                </div>
                <div className="p-5">
                  {story.headline && <h3 className="font-black text-slate-900 text-sm leading-snug break-words">{story.headline}</h3>}
                  <p className="text-xs text-slate-800 font-bold mt-1">{story.name}</p>
                  {story.role && <p className="text-xs text-red-600 font-bold">{story.role}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEditStory(story)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleStoryDelete(story.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {stories.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
                No success stories yet. They'll appear in the "Success Stories From Our Learners" section on the homepage.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Testimonials tab ──────────────────────────────────── */}
      {tab === 'testimonials' && (
        <>
          <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4" fill="currentColor" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Aggregate Rating Stat</h3>
                <p className="text-xs text-slate-400">The "X/5 from Y+ students" line shown above the testimonials on the homepage</p>
              </div>
            </div>
            <form onSubmit={handleStatsSubmit} className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Rating (out of 5)</label>
                <input type="number" step="0.1" min="0" max="5" value={statsForm.rating} onChange={(e) => setStatsForm({ ...statsForm, rating: e.target.value })} className="w-28 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Student Count</label>
                <input type="number" min="0" value={statsForm.student_count} onChange={(e) => setStatsForm({ ...statsForm, student_count: e.target.value })} className="w-36 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <button type="submit" disabled={statsSaving} className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-lg transition-all">
                <Save className="w-3.5 h-3.5" /> {statsSaving ? 'Saving...' : 'Save'}
              </button>
              {statsMsg && <span className="text-xs font-bold text-emerald-600">{statsMsg}</span>}
            </form>
          </div>

          <div className="flex justify-end mb-4">
            <button onClick={openCreateTestimonial} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <Plus className="w-4 h-4 relative" /> <span className="relative">Add Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div key={item.id} className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-fade-in-up p-5" style={{ animationDelay: `${idx * 70}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    item.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>{item.is_active !== false ? 'Active' : 'Inactive'}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Order {item.display_order}</span>
                </div>
                <p className="text-xs text-slate-500 italic leading-relaxed line-clamp-3">"{item.text}"</p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-red-50 text-red-400 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image_display_url ? <img src={item.image_display_url} alt={item.name} className="w-full h-full object-cover" /> : <Quote className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 text-xs truncate">{item.name}</p>
                    {item.role && <p className="text-red-600 text-[10px] font-bold truncate">{item.role}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEditTestimonial(item)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleTestimonialDelete(item.id)} className="flex-1 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 flex items-center justify-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
                No testimonials yet. They'll appear in the "What Our Students Say" section on the homepage.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Achievement Rewards tab ───────────────────────────── */}
      {/* Text-only section now — no reward imagery. Every string the public
          "Achievement Rewards" block renders is edited from this one form. */}
      {tab === 'rewards' && (
        <div className="max-w-3xl">
          {rewardsSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 animate-scale-in">
              <Check className="w-4 h-4" /> Achievement Rewards section saved.
            </div>
          )}

          <form onSubmit={handleRewardsSubmit} className="space-y-6">

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-900">Section Header</h3>
                  <p className="text-xs text-slate-400">Badge, the two-line heading, ribbon and intro paragraph.</p>
                </div>
                <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rewardsContent.is_active !== false}
                    onChange={(e) => setRewardsField('is_active', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-400"
                  />
                  <span className="text-xs font-bold text-slate-600">Show section</span>
                </label>
              </div>

              <RewardField label="Badge Text" value={rewardsContent.badge_text} onChange={(v) => setRewardsField('badge_text', v)} placeholder="Level Up & Cash In" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RewardField label="Heading Line 1 (coloured)" value={rewardsContent.heading_line1} onChange={(v) => setRewardsField('heading_line1', v)} placeholder="Achievement" />
                <RewardField label="Heading Line 2 (dark)" value={rewardsContent.heading_line2} onChange={(v) => setRewardsField('heading_line2', v)} placeholder="Rewards" />
              </div>
              <RewardField label="Ribbon Text" value={rewardsContent.ribbon_text} onChange={(v) => setRewardsField('ribbon_text', v)} placeholder="Earn More, Achieve More!" />
              <RewardField label="Description" value={rewardsContent.description} onChange={(v) => setRewardsField('description', v)} placeholder="Your hard work deserves the best rewards..." textarea />
              <RewardField label="Description Highlight (shown in blue)" value={rewardsContent.description_highlight} onChange={(v) => setRewardsField('description_highlight', v)} placeholder="unlock exciting gifts along the way!" />
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-slate-900">Intro Features</h3>
                <p className="text-xs text-slate-400">The small icon cards under the heading. Remove all to hide them.</p>
              </div>
              <RewardListEditor
                items={rewardsContent.intro_features}
                onChange={(v) => setRewardsField('intro_features', v)}
                titlePlaceholder="Achieve"
                descPlaceholder="Set your income goals and keep growing."
              />
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-slate-900">Perks Strip</h3>
                <p className="text-xs text-slate-400">The white bar of benefits. Remove all to hide the strip.</p>
              </div>
              <RewardListEditor
                items={rewardsContent.perks}
                onChange={(v) => setRewardsField('perks', v)}
                titlePlaceholder="No Time Limit"
                descPlaceholder="Achieve at your own pace."
              />
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-slate-900">Bottom CTA Bar</h3>
                <p className="text-xs text-slate-400">The dark call-to-action band at the end of the section.</p>
              </div>
              <RewardField label="CTA Title" value={rewardsContent.cta_title} onChange={(v) => setRewardsField('cta_title', v)} placeholder="Your Success, Your Reward!" />
              <RewardField label="CTA Subtitle" value={rewardsContent.cta_subtitle} onChange={(v) => setRewardsField('cta_subtitle', v)} placeholder="The more you achieve, the more you earn." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RewardField label="Button Text" value={rewardsContent.cta_button_text} onChange={(v) => setRewardsField('cta_button_text', v)} placeholder="Start Your Journey" />
                <RewardField label="Button Link" value={rewardsContent.cta_button_link} onChange={(v) => setRewardsField('cta_button_link', v)} placeholder="/register" />
              </div>
            </div>

            {rewardsError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{rewardsError}</div>
            )}

            <button
              type="submit"
              disabled={rewardsSaving}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-red-600/25 hover:shadow-xl transition-all disabled:opacity-60"
            >
              {rewardsSaving ? 'Saving...' : 'Save Section'}
            </button>
          </form>
        </div>
      )}

      {/* ── About Platform tab ────────────────────────────────── */}
      {tab === 'platform' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openCreatePlatform} className="group relative overflow-hidden px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>
              <Plus className="w-4 h-4 relative" /> <span className="relative">Add Feature Card</span>
            </button>
          </div>

          <div className="space-y-3">
            {platformFeatures.map((item, idx) => {
              const IconComp = PLATFORM_ICON_MAP[item.icon] || Star;
              return (
                <div key={item.id} className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up flex items-start gap-4" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient || 'from-blue-600 to-indigo-600'} text-white flex items-center justify-center shrink-0 shadow-md`}>
                    <IconComp className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        item.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>{item.is_active !== false ? 'Active' : 'Inactive'}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Order {item.display_order}</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-sm leading-snug break-words">{item.title}</h3>
                    {item.description && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{item.description}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEditPlatform(item)} className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handlePlatformDelete(item.id)} className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:border-red-300 hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {platformFeatures.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 font-medium">
                No feature cards yet. They'll appear in the "About Platform" section on the homepage.
              </div>
            )}
          </div>
        </>
      )}

      {/* Hero Slide Create/Edit Modal */}
      {showHeroForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingHeroId ? 'Edit Hero Slide' : 'Add Hero Slide'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown in the rotating hero banner at the top of the homepage</p>
                </div>
              </div>
              <button onClick={() => setShowHeroForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="hero-form" onSubmit={handleHeroSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-6">
              {heroError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{heroError}</div>}

              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Background Image *</p>
                <div className="flex items-center gap-4">
                  <div className="w-40 aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {heroImagePreview ? <img src={heroImagePreview} className="w-full h-full object-cover" alt="" /> : <ImagePlus className="w-7 h-7 text-red-200" />}
                  </div>
                  <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                    {heroImagePreview ? 'Replace Image' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleHeroImageChange} />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Use a wide banner (~16:9) with a blank zone on the left for the text to sit in — matching the site's default hero slides works best.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Heading — Line 1</label>
                <input type="text" value={heroForm.heading_line1} onChange={(e) => setHeroForm({ ...heroForm, heading_line1: e.target.value })} placeholder="Welcome to the Platform Where" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Heading — Line 2 (highlighted in blue)</label>
                <input type="text" value={heroForm.heading_line2} onChange={(e) => setHeroForm({ ...heroForm, heading_line2: e.target.value })} placeholder="Skills Transform Into Success." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Paragraph</label>
                <textarea value={heroForm.paragraph} onChange={(e) => setHeroForm({ ...heroForm, paragraph: e.target.value })} rows={3} placeholder="At Zarni Skills, we empower you with high-demand skills, smart strategies, and real opportunities..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                <input type="number" value={heroForm.display_order} onChange={(e) => setHeroForm({ ...heroForm, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first in the rotation.</p>
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible on homepage)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={heroForm.is_active} onChange={(e) => setHeroForm({ ...heroForm, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowHeroForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="hero-form" disabled={heroSaving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!heroSaving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{heroSaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingHeroId ? 'Save Changes' : 'Add Hero Slide'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Banner Create/Edit Modal */}
      {showBannerForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <GalleryHorizontal className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingBannerId ? 'Edit Banner' : 'Add New Banner'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown in the homepage slider, right after the hero</p>
                </div>
              </div>
              <button onClick={() => setShowBannerForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="banner-form" onSubmit={handleBannerSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-7">
              {bannerError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{bannerError}</div>}

              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Banner Image *</p>
                <div className="flex items-center gap-4">
                  <div className="w-56 aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {bannerImagePreview ? <img src={bannerImagePreview} className="max-w-full max-h-full object-contain" alt="" /> : <ImagePlus className="w-7 h-7 text-red-200" />}
                  </div>
                  <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                    {bannerImagePreview ? 'Replace Image' : 'Upload Image'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBannerImageChange} />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Wide banner images work best (recommended ~21:9 aspect ratio).</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                <input type="number" value={bannerForm.display_order} onChange={(e) => setBannerForm({ ...bannerForm, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first in the slider.</p>
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible on homepage)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={bannerForm.is_active} onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowBannerForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="banner-form" disabled={bannerSaving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!bannerSaving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{bannerSaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingBannerId ? 'Save Changes' : 'Add Banner'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Team Member Create/Edit Modal */}
      {showTeamForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingMemberId ? 'Edit Team Member' : 'Add Team Member'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown in the "Meet Our Expert Team" homepage section</p>
                </div>
              </div>
              <button onClick={() => setShowTeamForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="home-team-form" onSubmit={handleTeamSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-6">
              {teamError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{teamError}</div>}

              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Photo</p>
                <div className="flex items-center gap-4">
                  <div className="w-24 aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {memberImagePreview ? <img src={memberImagePreview} className="w-full h-full object-cover object-top" alt="" /> : <ImagePlus className="w-7 h-7 text-red-200" />}
                  </div>
                  <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                    {memberImagePreview ? 'Replace Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleMemberImageChange} />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Portrait photos work best (recommended ~3:4 aspect ratio).</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Name *</label>
                  <input type="text" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Suriya Yadav" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Designation *</label>
                  <input type="text" value={teamForm.designation} onChange={(e) => setTeamForm({ ...teamForm, designation: e.target.value })} placeholder="CEO & Founder" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Badge Label</label>
                  <input type="text" value={teamForm.badge} onChange={(e) => setTeamForm({ ...teamForm, badge: e.target.value })} placeholder="Founder" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={teamForm.color} onChange={(e) => setTeamForm({ ...teamForm, color: e.target.value })} className="w-11 h-11 rounded-xl border border-slate-200 cursor-pointer shrink-0" />
                    <input type="text" value={teamForm.color} onChange={(e) => setTeamForm({ ...teamForm, color: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Short Bio</label>
                <textarea value={teamForm.bio} onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })} rows={3} placeholder="Visionary leader with a passion for empowering learners worldwide." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow resize-none" />
                <p className="text-[11px] text-slate-400 mt-1">Short line shown on the homepage team card.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">About</label>
                <textarea value={teamForm.about} onChange={(e) => setTeamForm({ ...teamForm, about: e.target.value })} rows={4} placeholder="A fuller bio describing who they are and their background." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">Shown on the member's full profile page.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Achievements</label>
                <textarea value={teamForm.achievements} onChange={(e) => setTeamForm({ ...teamForm, achievements: e.target.value })} rows={4} placeholder={'One achievement per line, e.g.\n5+ Years in EdTech\nLed 200+ successful launches'} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">One per line. Shown as milestones on the profile page.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                <input type="number" value={teamForm.display_order} onChange={(e) => setTeamForm({ ...teamForm, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first in the slider.</p>
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible on homepage)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={teamForm.is_active} onChange={(e) => setTeamForm({ ...teamForm, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowTeamForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="home-team-form" disabled={teamSaving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!teamSaving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{teamSaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingMemberId ? 'Save Changes' : 'Add Team Member'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FAQ Create/Edit Modal */}
      {showFaqForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingFaqId ? 'Edit FAQ' : 'Add FAQ'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown in the "Frequently Asked Questions" homepage section</p>
                </div>
              </div>
              <button onClick={() => setShowFaqForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="faq-form" onSubmit={handleFaqSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-5">
              {faqError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{faqError}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Question *</label>
                <input type="text" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} placeholder="Can I access the course materials after I complete the course?" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Answer *</label>
                <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} rows={4} placeholder="Yes, you have lifetime access to all course materials..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                <input type="number" value={faqForm.display_order} onChange={(e) => setFaqForm({ ...faqForm, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first.</p>
              </div>
              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible on homepage)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={faqForm.is_active} onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowFaqForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="faq-form" disabled={faqSaving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!faqSaving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{faqSaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingFaqId ? 'Save Changes' : 'Add FAQ'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Success Story Create/Edit Modal */}
      {showStoryForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingStoryId ? 'Edit Success Story' : 'Add Success Story'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown in the "Success Stories From Our Learners" homepage section</p>
                </div>
              </div>
              <button onClick={() => setShowStoryForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="story-form" onSubmit={handleStorySubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-5">
              {storyError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{storyError}</div>}

              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Photo</p>
                <div className="flex items-center gap-4">
                  <div className="w-24 aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {storyImagePreview ? <img src={storyImagePreview} className="w-full h-full object-cover" alt="" /> : <ImagePlus className="w-7 h-7 text-red-200" />}
                  </div>
                  <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                    {storyImagePreview ? 'Replace Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleStoryImageChange} />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Square photos work best (recommended 1:1 aspect ratio).</p>
              </div>

              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Video</p>
                {storyVideoPreview && (
                  <video src={storyVideoPreview} controls className="w-full max-h-48 rounded-2xl bg-black mb-3" />
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                  <ImagePlus className="w-4 h-4 shrink-0" />
                  {storyVideoPreview ? 'Replace Video' : 'Upload Video'}
                  <input type="file" accept="video/*" className="hidden" onChange={handleStoryVideoChange} />
                </label>
                <p className="text-[11px] text-slate-400 mt-2">Optional — plays when a visitor clicks the story on the homepage. MP4 works best.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Name *</label>
                  <input type="text" value={storyForm.name} onChange={(e) => setStoryForm({ ...storyForm, name: e.target.value })} placeholder="Suriya Yadav" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Role</label>
                  <input type="text" value={storyForm.role} onChange={(e) => setStoryForm({ ...storyForm, role: e.target.value })} placeholder="Freelancer" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Headline</label>
                <input type="text" value={storyForm.headline} onChange={(e) => setStoryForm({ ...storyForm, headline: e.target.value })} placeholder="From Beginner to Freelancer" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Duration Label</label>
                  <input type="text" value={storyForm.duration} onChange={(e) => setStoryForm({ ...storyForm, duration: e.target.value })} placeholder="1:35" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                  <input type="number" value={storyForm.display_order} onChange={(e) => setStoryForm({ ...storyForm, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible on homepage)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={storyForm.is_active} onChange={(e) => setStoryForm({ ...storyForm, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowStoryForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="story-form" disabled={storySaving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!storySaving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{storySaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingStoryId ? 'Save Changes' : 'Add Success Story'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Testimonial Create/Edit Modal */}
      {showTestimonialForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Quote className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingTestimonialId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown in the "What Our Students Say" homepage section</p>
                </div>
              </div>
              <button onClick={() => setShowTestimonialForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="testimonial-form" onSubmit={handleTestimonialSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-5">
              {testimonialError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{testimonialError}</div>}

              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Photo</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {testimonialImagePreview ? <img src={testimonialImagePreview} className="w-full h-full object-cover" alt="" /> : <ImagePlus className="w-6 h-6 text-red-200" />}
                  </div>
                  <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:border-red-300 hover:text-red-600 transition-colors">
                    {testimonialImagePreview ? 'Replace Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleTestimonialImageChange} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Name *</label>
                  <input type="text" value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} placeholder="Toni" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Role</label>
                  <input type="text" value={testimonialForm.role} onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })} placeholder="Affiliate Marketer" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Testimonial Text *</label>
                <textarea value={testimonialForm.text} onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })} rows={4} placeholder="Life-changing experience! The training was clear, actionable..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                <input type="number" value={testimonialForm.display_order} onChange={(e) => setTestimonialForm({ ...testimonialForm, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first.</p>
              </div>

              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible on homepage)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={testimonialForm.is_active} onChange={(e) => setTestimonialForm({ ...testimonialForm, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowTestimonialForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="testimonial-form" disabled={testimonialSaving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!testimonialSaving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{testimonialSaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingTestimonialId ? 'Save Changes' : 'Add Testimonial'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Platform Feature Create/Edit Modal */}
      {showPlatformForm && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 flex items-center justify-between gap-4 px-6 sm:px-8 py-5 text-white"
              style={{ background: 'linear-gradient(135deg, #0b1428 0%, #3d0d1e 60%, #7f1d1d 100%)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate">{editingPlatformId ? 'Edit Feature Card' : 'Add Feature Card'}</h3>
                  <p className="text-[11px] text-white/60 truncate">Shown in the "About Platform" homepage section</p>
                </div>
              </div>
              <button onClick={() => setShowPlatformForm(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <form id="platform-form" onSubmit={handlePlatformSubmit} className="flex-1 overflow-y-auto admin-scrollbar px-6 sm:px-8 py-6 space-y-5">
              {platformError && <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-bold">{platformError}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Title *</label>
                <input type="text" value={platformForm.title} onChange={(e) => setPlatformForm({ ...platformForm, title: e.target.value })} placeholder="Expert Practical Training" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Description</label>
                <textarea value={platformForm.description} onChange={(e) => setPlatformForm({ ...platformForm, description: e.target.value })} rows={3} placeholder="Learn directly from real-world practitioners..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Icon</label>
                  <select value={platformForm.icon} onChange={(e) => setPlatformForm({ ...platformForm, icon: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow bg-white">
                    {ICON_OPTIONS.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Gradient</label>
                  <select value={platformForm.gradient} onChange={(e) => setPlatformForm({ ...platformForm, gradient: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow bg-white">
                    {GRADIENT_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">Display Order</label>
                <input type="number" value={platformForm.display_order} onChange={(e) => setPlatformForm({ ...platformForm, display_order: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-shadow" />
                <p className="text-[11px] text-slate-400 mt-1">Lower numbers appear first.</p>
              </div>
              <label className="flex items-center justify-between gap-3 cursor-pointer bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-sm font-bold text-slate-700">Active (visible on homepage)</span>
                <span className="relative inline-flex items-center">
                  <input type="checkbox" checked={platformForm.is_active} onChange={(e) => setPlatformForm({ ...platformForm, is_active: e.target.checked })} className="sr-only peer" />
                  <span className="w-10 h-6 bg-slate-300 peer-checked:bg-red-600 rounded-full transition-colors"></span>
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                </span>
              </label>
            </form>

            <div className="shrink-0 flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 bg-white">
              <button type="button" onClick={() => setShowPlatformForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" form="platform-form" disabled={platformSaving} className="group relative overflow-hidden flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-red-600/25 hover:shadow-xl transition-all active:scale-[0.98]">
                {!platformSaving && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent"></span>}
                <span className="relative flex items-center gap-2">{platformSaving ? 'Saving...' : <><CheckCircle2 className="w-4 h-4" /> {editingPlatformId ? 'Save Changes' : 'Add Feature Card'}</>}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
