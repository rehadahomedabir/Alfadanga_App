import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Hospital, 
  Bus, 
  ShieldCheck, 
  Zap, 
  Wrench, 
  Phone, 
  Newspaper, 
  Settings,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Info,
  Menu,
  X,
  Home,
  User,
  Briefcase,
  GraduationCap,
  Building2,
  UtensilsCrossed,
  Palmtree,
  Truck,
  Droplets,
  Microscope,
  Heart,
  Car,
  Package,
  Building,
  Lightbulb,
  Megaphone,
  UserPlus,
  BookOpen,
  Hotel,
  Train,
  ShoppingBag,
  MapPin,
  Flame,
  LogIn,
  LogOut,
  Mail,
  Lock,
  Search,
  Bell,
  Calendar,
  Cloud,
  RefreshCw,
  Droplet,
  AlertTriangle,
  MessageSquare,
  ClipboardList,
  BarChart3,
  Languages,
  Download,
  History,
  Map as MapIcon,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/src/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// --- Types ---
interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  can_manage_users?: boolean;
  can_edit_news?: boolean;
  can_approve_services?: boolean;
  can_edit_settings?: boolean;
}
interface Service {
  id: number;
  category: string;
  name: string;
  phone: string;
  image_url?: string;
  description?: string;
}

interface PendingService extends Service {
  created_at: string;
}

interface HomeSettings {
  id: number;
  banner_text: string;
  banner_image: string;
  featured_card_1_title: string;
  featured_card_1_desc: string;
  featured_card_1_icon?: string;
  featured_card_2_title: string;
  featured_card_2_desc: string;
  featured_card_2_icon?: string;
  allow_user_contribution: boolean;
  allowed_categories: string[];
}

interface News {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
}

interface BloodDonor {
  id: number;
  name: string;
  blood_group: string;
  phone: string;
  location?: string;
  last_donation_date?: string;
}

interface Complaint {
  id: number;
  subject: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved';
  admin_note?: string;
  created_at: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  is_urgent: boolean;
  created_at: string;
}

interface Category {
  id: string;
  title_bn: string;
  title_en: string;
  icon_name: string;
  color_class: string;
}

interface ActivityLog {
  id: number;
  action: string;
  details: any;
  created_at: string;
  admin_email?: string;
}

// --- Translations ---
const translations = {
  bn: {
    home: 'হোম',
    services: 'সার্ভিস',
    news: 'সংবাদ',
    profile: 'প্রোফাইল',
    emergency: 'জরুরী হেল্পলাইন',
    blood: 'রক্তদাতা',
    weather: 'আবহাওয়া',
    complaint: 'অভিযোগ',
    notice: 'নোটিশ বোর্ড',
    admin: 'অ্যাডমিন প্যানেল',
    search: 'সার্ভিস খুঁজুন...',
    all_services: 'সব সার্ভিস',
    categories: 'ক্যাটাগরি',
    loading: 'লোড হচ্ছে...',
    no_data: 'কোন তথ্য পাওয়া যায়নি',
    call: 'কল করুন',
    map: 'ম্যাপে দেখুন',
    language: 'English',
    logout: 'লগ আউট',
    save: 'সেভ করুন',
    update: 'আপডেট করুন',
    delete: 'ডিলিট করুন',
    approve: 'অ্যাপ্রুভ করুন',
    pending: 'পেন্ডিং',
    active: 'অ্যাক্টিভ',
    blocked: 'ব্লকড',
    admin_secret: 'অ্যাডমিন সিক্রেট কি',
    login: 'লগইন',
    signup: 'সাইন আপ',
    email: 'ইমেইল',
    password: 'পাসওয়ার্ড',
    full_name: 'পুরো নাম',
    phone: 'ফোন নম্বর',
    avatar: 'প্রোফাইল ছবি'
  },
  en: {
    home: 'Home',
    services: 'Services',
    news: 'News',
    profile: 'Profile',
    emergency: 'Emergency',
    blood: 'Blood Donor',
    weather: 'Weather',
    complaint: 'Complaint',
    notice: 'Notice Board',
    admin: 'Admin Panel',
    search: 'Search services...',
    all_services: 'All Services',
    categories: 'Categories',
    loading: 'Loading...',
    no_data: 'No data found',
    call: 'Call',
    map: 'View Map',
    language: 'বাংলা',
    logout: 'Logout',
    save: 'Save',
    update: 'Update',
    delete: 'Delete',
    approve: 'Approve',
    pending: 'Pending',
    active: 'Active',
    blocked: 'Blocked',
    admin_secret: 'Admin Secret Key',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    full_name: 'Full Name',
    phone: 'Phone Number',
    avatar: 'Avatar'
  }
};

// --- Helpers ---
const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      if (uploadError.message.includes('bucket not found')) {
        alert('সুপাবেস স্টোরেজে "images" নামে একটি পাবলিক বাকেট তৈরি করুন।');
      }
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    alert('ছবি আপলোড ব্যর্থ হয়েছে: ' + error.message);
    return null;
  }
};

const logActivity = async (action: string, details: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('activity_logs').insert([{ admin_id: user.id, action, details }]);
  } catch (err) {
    console.error('Logging error:', err);
  }
};

const trackEvent = async (eventType: string, metadata: any) => {
  try {
    await supabase.from('analytics').insert([{ event_type: eventType, metadata }]);
  } catch (err) {
    console.error('Analytics error:', err);
  }
};

const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(',')).join('\n');
  const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const fetchWeather = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    // Using a public API for weather (Open-Meteo doesn't need a key)
    // Alfadanga coordinates roughly: 23.36, 89.65
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=23.36&longitude=89.65&current_weather=true&timezone=auto', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`Weather API returned ${res.status}`);
    }
    
    const data = await res.json();
    if (!data || !data.current_weather) {
      throw new Error('Invalid weather data received');
    }
    
    return data.current_weather;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error('Weather fetch timed out');
    } else {
      console.error('Weather fetch error:', err.message || err);
    }
    return null;
  }
};

// --- Components ---

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="h-full bg-emerald-500"
    />
  </div>
);

const ImageUploadField = ({ 
  label, 
  currentImage, 
  onUpload, 
  loading, 
  progress 
}: { 
  label: string, 
  currentImage?: string, 
  onUpload: (file: File) => void, 
  loading: boolean, 
  progress: number 
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider">{label}</label>
    <div className="relative group">
      <div className={`w-full h-40 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50 ${loading ? 'border-emerald-300' : 'border-slate-200 hover:border-emerald-400'}`}>
        {currentImage ? (
          <div className="relative w-full h-full">
            <img src={currentImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-[10px] font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">ছবি পরিবর্তন করুন</p>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Cloud size={24} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">ছবি সিলেক্ট করুন</p>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-6">
            <div className="animate-spin text-emerald-600 mb-2"><RefreshCw size={24} /></div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">আপলোড হচ্ছে... {progress}%</p>
            <div className="w-full max-w-[150px]">
              <ProgressBar progress={progress} />
            </div>
          </div>
        )}
        
        <input 
          type="file" 
          accept="image/*"
          onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={loading}
        />
      </div>
    </div>
  </div>
);

interface CategoryCardProps {
  key?: string | number;
  icon: any;
  title: string;
  onClick: () => void;
  color: string;
  isTop?: boolean;
}

const CategoryCard = ({ icon: Icon, title, onClick, color, isTop, lang }: CategoryCardProps & { lang: 'bn' | 'en' }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center justify-center ${isTop ? 'min-w-[85px] p-3 bg-white rounded-3xl shadow-sm border border-slate-100' : 'p-4 bg-white rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md'}`}
  >
    <div className={`p-3 rounded-2xl ${color} mb-2 text-white shadow-sm`}>
      <Icon size={isTop ? 18 : 22} />
    </div>
    <span className={`text-[10px] font-bold text-slate-700 text-center leading-tight`}>{title}</span>
  </motion.button>
);

const EmergencyHotlines = ({ lang }: { lang: 'bn' | 'en' }) => {
  const t = translations[lang];
  const hotlines = [
    { name: lang === 'bn' ? 'জাতীয় জরুরী সেবা' : 'National Emergency', number: '999', icon: AlertTriangle, color: 'bg-red-600' },
    { name: lang === 'bn' ? 'তথ্য ও সেবা' : 'Info & Service', number: '333', icon: Info, color: 'bg-blue-600' },
    { name: lang === 'bn' ? 'দুর্নীতি দমন কমিশন' : 'ACC', number: '106', icon: ShieldCheck, color: 'bg-emerald-600' },
    { name: lang === 'bn' ? 'আলফাডাঙ্গা থানা' : 'Alfadanga Police', number: '01320000000', icon: ShieldCheck, color: 'bg-indigo-600' },
    { name: lang === 'bn' ? 'ফায়ার সার্ভিস' : 'Fire Service', number: '01700000000', icon: Flame, color: 'bg-orange-600' },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 p-4">
      {hotlines.map((h, i) => (
        <motion.a
          key={i}
          href={`tel:${h.number}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 p-4 bg-white rounded-3xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all group"
        >
          <div className={`p-3 rounded-2xl ${h.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
            <h.icon size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800">{h.name}</h4>
            <p className="text-xs text-slate-400 font-mono">{h.number}</p>
          </div>
          <Phone size={18} className="text-emerald-500" />
        </motion.a>
      ))}
    </div>
  );
};

const BloodDonorList = ({ lang }: { lang: 'bn' | 'en' }) => {
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    const { data } = await supabase.from('blood_donors').select('*').order('name');
    if (data) setDonors(data);
    setLoading(false);
  };

  const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === '' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          {lang === 'bn' ? 'সব' : 'All'}
        </button>
        {groups.map(g => (
          <button 
            key={g}
            onClick={() => setFilter(g)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === g ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-400">{translations[lang].loading}</div>
      ) : (
        <div className="space-y-3">
          {donors.filter(d => !filter || d.blood_group === filter).map((d, i) => (
            <motion.div 
              key={d.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm">
                  {d.blood_group}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{d.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{d.location || (lang === 'bn' ? 'আলফাডাঙ্গা' : 'Alfadanga')}</p>
                </div>
              </div>
              <a href={`tel:${d.phone}`} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors">
                <Phone size={18} />
              </a>
            </motion.div>
          ))}
          {donors.filter(d => !filter || d.blood_group === filter).length === 0 && (
            <div className="text-center py-10 text-slate-400">{translations[lang].no_data}</div>
          )}
        </div>
      )}
    </div>
  );
};

const WeatherWidget = ({ lang }: { lang: 'bn' | 'en' }) => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWeather = async () => {
    setLoading(true);
    setError(false);
    const data = await fetchWeather();
    if (data) {
      setWeather(data);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWeather();
  }, []);

  if (loading) return (
    <div className="px-4">
      <div className="bg-slate-100 h-24 rounded-[2.5rem] animate-pulse flex items-center justify-center">
        <RefreshCw className="animate-spin text-slate-300" size={20} />
      </div>
    </div>
  );

  if (error || !weather) return (
    <div className="px-4">
      <button 
        onClick={loadWeather}
        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-[2.5rem] text-slate-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
      >
        <Cloud size={16} />
        {lang === 'bn' ? 'আবহাওয়া তথ্য পাওয়া যায়নি (পুনরায় চেষ্টা করুন)' : 'Weather unavailable (Tap to retry)'}
      </button>
    </div>
  );

  return (
    <div className="px-4">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-[2.5rem] text-white shadow-lg shadow-blue-100 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
            {lang === 'bn' ? 'আলফাডাঙ্গা আবহাওয়া' : 'Alfadanga Weather'}
          </p>
          <div className="flex items-end gap-2">
            <h2 className="text-4xl font-black leading-none">{Math.round(weather.temperature)}°C</h2>
            <p className="text-sm font-bold text-white/80 mb-1">
              {weather.weathercode <= 3 ? (lang === 'bn' ? 'পরিষ্কার আকাশ' : 'Clear Sky') : (lang === 'bn' ? 'মেঘলা' : 'Cloudy')}
            </p>
          </div>
        </div>
        <div className="relative z-10 text-right">
          <Cloud size={48} className="text-white/30 mb-2 ml-auto" />
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
            Wind: {weather.windspeed} km/h
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

const NoticeBoard = ({ lang }: { lang: 'bn' | 'en' }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (data) setNotices(data);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        <div className="text-center py-10 text-slate-400">{translations[lang].loading}</div>
      ) : (
        notices.map((n, i) => (
          <motion.div 
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-3xl shadow-sm border ${n.is_urgent ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'} space-y-3`}
          >
            <div className="flex justify-between items-start">
              <h4 className={`font-bold ${n.is_urgent ? 'text-rose-700' : 'text-slate-800'}`}>{n.title}</h4>
              {n.is_urgent && <span className="text-[8px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Urgent</span>}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
            <p className="text-[10px] text-slate-400 font-medium">{new Date(n.created_at).toLocaleDateString()}</p>
          </motion.div>
        ))
      )}
      {!loading && notices.length === 0 && (
        <div className="text-center py-10 text-slate-400">{translations[lang].no_data}</div>
      )}
    </div>
  );
};

const ComplaintBox = ({ lang, onClose }: { lang: 'bn' | 'en', onClose: () => void }) => {
  const [formData, setFormData] = useState({ subject: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert(lang === 'bn' ? 'দয়া করে লগইন করুন' : 'Please login first');
    if (!formData.subject || !formData.description) return alert(lang === 'bn' ? 'সব তথ্য দিন' : 'Please fill all fields');
    
    setLoading(true);
    const { error } = await supabase.from('complaints').insert([{ ...formData, user_id: user.id }]);
    if (error) alert(error.message);
    else {
      alert(lang === 'bn' ? 'আপনার অভিযোগটি জমা হয়েছে' : 'Complaint submitted successfully');
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl text-slate-800">{translations[lang].complaint}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Subject</label>
            <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="অভিযোগের বিষয়" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
            <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm h-32 focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="বিস্তারিত লিখুন..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 disabled:opacity-50 transition-all hover:bg-emerald-700">
            {loading ? 'পাঠানো হচ্ছে...' : 'অভিযোগ পাঠান'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SubmissionModal = ({ category, onClose, onSubmit }: { category: string, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', description: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 200);

    const url = await uploadImage(file);
    clearInterval(interval);
    setUploadProgress(100);
    
    if (url) {
      setFormData({ ...formData, image_url: url });
    }
    setTimeout(() => {
      setLoading(false);
      setUploadProgress(0);
    }, 500);
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('তথ্য যোগ করতে দয়া করে লগইন করুন');
    if (!formData.name || !formData.phone) return alert('নাম এবং ফোন নম্বর আবশ্যক');
    setLoading(true);
    const { error } = await supabase.from('pending_services').insert([{ ...formData, category }]);
    if (error) alert('Error: ' + error.message);
    else {
      alert('আপনার তথ্যটি সফলভাবে পাঠানো হয়েছে। অ্যাডমিন যাচাই করার পর এটি পাবলিশ করা হবে।');
      onSubmit(formData);
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">তথ্য যোগ করুন</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input className="w-full p-3 bg-slate-50 rounded-xl text-sm" placeholder="নাম" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input className="w-full p-3 bg-slate-50 rounded-xl text-sm" placeholder="ফোন নম্বর" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <textarea className="w-full p-3 bg-slate-50 rounded-xl text-sm h-24" placeholder="বর্ণনা" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          
          <ImageUploadField 
            label="ছবি যোগ করুন"
            currentImage={formData.image_url}
            onUpload={handleImageUpload}
            loading={loading && uploadProgress > 0}
            progress={uploadProgress}
          />

          <button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">
            {loading && uploadProgress === 0 ? 'পাঠানো হচ্ছে...' : 'সাবমিট করুন'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, categories, onCategoryClick, setView, profile, lang, setLang }: { isOpen: boolean, onClose: () => void, categories: any[], onCategoryClick: (id: string) => void, setView: (v: any) => void, profile: Profile | null, lang: 'bn' | 'en', setLang: (l: 'bn' | 'en') => void }) => {
  const t = translations[lang];
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white z-50 shadow-2xl overflow-y-auto flex flex-col"
          >
            <div className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors"><X size={20} /></button>
              </div>
              <h2 className="text-2xl font-black leading-tight">{lang === 'bn' ? 'আলফাডাঙ্গা' : 'Alfadanga'}<br/>{lang === 'bn' ? 'উপজেলা' : 'Upazila'}</h2>
              <p className="text-white/60 text-xs mt-2 font-medium uppercase tracking-widest">Digital Service Portal</p>
            </div>
            
            <div className="p-6 flex-1 space-y-8">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setView('home'); onClose(); }} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <Home size={20} /> {t.home}
                </button>
                <button onClick={() => { setView('news'); onClose(); }} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-3xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <Newspaper size={20} /> {t.news}
                </button>
                <button onClick={() => { setLang(lang === 'bn' ? 'en' : 'bn'); onClose(); }} className="col-span-2 flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-3xl text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <Languages size={20} /> {t.language}
                </button>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">{t.categories}</h3>
                <div className="space-y-1">
                  {categories.slice(0, 8).map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => { onCategoryClick(cat.id); onClose(); }}
                      className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-all group"
                    >
                      <div className={`p-2 rounded-xl ${cat.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                        <cat.icon size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{lang === 'bn' ? cat.title : cat.id.toUpperCase()}</span>
                      <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">অন্যান্য</h3>
                <div className="space-y-2">
                  <button onClick={() => { setView('emergency'); onClose(); }} className="w-full flex items-center gap-4 p-3 text-slate-600 font-bold text-sm hover:text-emerald-600 transition-colors">
                    <AlertTriangle size={18} /> {t.emergency}
                  </button>
                  <button onClick={() => { setView('blood'); onClose(); }} className="w-full flex items-center gap-4 p-3 text-slate-600 font-bold text-sm hover:text-emerald-600 transition-colors">
                    <Droplet size={18} /> {t.blood}
                  </button>
                  <button onClick={() => { setView('notice'); onClose(); }} className="w-full flex items-center gap-4 p-3 text-slate-600 font-bold text-sm hover:text-emerald-600 transition-colors">
                    <ClipboardList size={18} /> {t.notice}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 text-center font-medium">© ২০২৬ আলফাডাঙ্গা ডিজিটাল পোর্টাল</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Footer = ({ setView, currentView, lang }: { setView: (v: any) => void, currentView: string, lang: 'bn' | 'en' }) => {
  const t = translations[lang];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 p-4 flex justify-around items-center z-40 max-w-md mx-auto">
      <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}>
        <Home size={20} />
        <span className="text-[10px] font-bold">{t.home}</span>
      </button>
      <button onClick={() => setView('list')} className={`flex flex-col items-center gap-1 ${currentView === 'list' ? 'text-emerald-600' : 'text-slate-400'}`}>
        <Search size={20} />
        <span className="text-[10px] font-bold">{t.services}</span>
      </button>
      <button onClick={() => setView('news')} className={`flex flex-col items-center gap-1 ${currentView === 'news' ? 'text-emerald-600' : 'text-slate-400'}`}>
        <Newspaper size={20} />
        <span className="text-[10px] font-bold">{t.news}</span>
      </button>
      <button onClick={() => setView('login')} className={`flex flex-col items-center gap-1 ${currentView === 'login' ? 'text-emerald-600' : 'text-slate-400'}`}>
        <User size={20} />
        <span className="text-[10px] font-bold">{t.profile}</span>
      </button>
    </div>
  );
};

const ProfileSettings = ({ profile, onUpdate }: { profile: Profile, onUpdate: () => void }) => {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleImageUpload = async (file: File) => {
    setLoading(true);
    const url = await uploadImage(file);
    if (url) {
      setFormData({ ...formData, avatar_url: url });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!formData.full_name.trim() || !formData.phone.trim()) {
      return alert('নাম এবং ফোন নম্বর ফাঁকা রাখা যাবে না');
    }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', profile.id);
    
    if (error) alert('Error: ' + error.message);
    else {
      alert('প্রোফাইল আপডেট সফল হয়েছে!');
      onUpdate();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2"><User size={18} /> প্রোফাইল সেটিংস</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-400 ml-2">পুরো নাম</label>
          <input 
            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm mt-1" 
            placeholder="আপনার নাম" 
            value={formData.full_name} 
            onChange={e => setFormData({...formData, full_name: e.target.value})} 
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 ml-2">ফোন নম্বর</label>
          <input 
            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm mt-1" 
            placeholder="আপনার ফোন নম্বর" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 ml-2">প্রোফাইল ছবি</label>
          <div className="flex items-center gap-4 mt-1">
            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden">
              {formData.avatar_url ? <img src={formData.avatar_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User size={20} className="m-auto mt-3 text-slate-300" />}
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              className="text-xs"
            />
          </div>
        </div>
      </div>
      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50"
      >
        {loading ? 'সেভ হচ্ছে...' : 'তথ্য সেভ করুন'}
      </button>
    </div>
  );
};

const AdminPanel = ({ settings, onUpdate, onClose, categories, handleLogout, currentProfile }: { settings: HomeSettings | null, onUpdate: () => void, onClose: () => void, categories: any[], handleLogout: () => void, currentProfile: Profile | null }) => {
  const [formData, setFormData] = useState<HomeSettings>(settings || {
    id: 0,
    banner_text: '',
    banner_image: '',
    featured_card_1_title: '',
    featured_card_1_desc: '',
    featured_card_2_title: '',
    featured_card_2_desc: '',
    allow_user_contribution: false,
    allowed_categories: []
  });
  const [pendingItems, setPendingItems] = useState<PendingService[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [allNews, setAllNews] = useState<News[]>([]);
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('banner');
  const [newNews, setNewNews] = useState({ title: '', content: '', image_url: '' });
  const [newNotice, setNewNotice] = useState({ title: '', content: '', is_urgent: false });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const checkStorageBucket = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('images');
      if (error) {
        if (error.message.includes('not found')) {
          setStorageError('Storage bucket "images" not found. Please create it in Supabase Dashboard or run the SQL script.');
        } else {
          throw error;
        }
      } else {
        setStorageError(null);
      }
    } catch (err: any) {
      console.error('Storage bucket error:', err);
      setStorageError(err.message || 'Storage bucket inaccessible.');
    }
  };

  const createBucket = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });
      if (error) throw error;
      alert('Bucket "images" created successfully!');
      setStorageError(null);
      checkStorageBucket();
    } catch (err: any) {
      alert('Could not create bucket automatically: ' + err.message + '\n\nPlease run the SQL script in the System tab instead.');
    } finally {
      setLoading(false);
    }
  };

  const attemptAutoFix = async () => {
    if (storageError?.includes('not found')) {
      await createBucket();
    } else {
      alert('Auto-fix requires manual SQL execution in Supabase Dashboard. Please use the "Database Setup" button to get the script.');
    }
  };

  useEffect(() => {
    checkStorageBucket();
    refreshData();
  }, [activeTab]);

  const refreshData = () => {
    if (activeTab === 'pending') fetchPendingItems();
    if (activeTab === 'users') fetchAllProfiles();
    if (activeTab === 'services') fetchAllServices();
    if (activeTab === 'news') fetchAllNews();
    if (activeTab === 'notices') fetchAllNotices();
    if (activeTab === 'complaints') fetchAllComplaints();
    if (activeTab === 'logs') fetchActivityLogs();
    if (activeTab === 'analytics') fetchAnalytics();
  };

  const fetchPendingItems = async () => {
    const { data } = await supabase.from('pending_services').select('*').order('created_at', { ascending: false });
    if (data) setPendingItems(data);
  };

  const fetchAllProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAllProfiles(data);
  };

  const fetchAllServices = async () => {
    const { data } = await supabase.from('services').select('*').order('id', { ascending: false });
    if (data) setAllServices(data);
  };

  const fetchAllNews = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setAllNews(data);
  };

  const fetchAllNotices = async () => {
    const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
    if (data) setAllNotices(data);
  };

  const fetchAllComplaints = async () => {
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (data) setAllComplaints(data);
  };

  const fetchActivityLogs = async () => {
    const { data } = await supabase.from('activity_logs').select('*, profiles(email)').order('created_at', { ascending: false }).limit(50);
    if (data) setActivityLogs(data.map(l => ({ ...l, admin_email: (l as any).profiles?.email })));
  };

  const fetchAnalytics = async () => {
    const { data } = await supabase.from('analytics').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setAnalyticsData(data);
  };

  const handleAddNotice = async () => {
    if (!newNotice.title || !newNotice.content) return alert('সব তথ্য দিন');
    setLoading(true);
    const { error } = await supabase.from('notices').insert([newNotice]);
    if (error) alert(error.message);
    else {
      alert('নোটিশ যোগ হয়েছে!');
      setNewNotice({ title: '', content: '', is_urgent: false });
      fetchAllNotices();
      logActivity('add_notice', { title: newNotice.title });
    }
    setLoading(false);
  };

  const handleUpdateComplaint = async (id: number, status: string, note: string) => {
    const { error } = await supabase.from('complaints').update({ status, admin_note: note }).eq('id', id);
    if (error) alert(error.message);
    else {
      alert('অভিযোগ আপডেট হয়েছে!');
      fetchAllComplaints();
      logActivity('update_complaint', { id, status });
    }
  };

  const handleAddNews = async () => {
    if (!newNews.title || !newNews.content) return alert('সব তথ্য দিন');
    setLoading(true);
    const { error } = await supabase.from('news').insert([newNews]);
    if (error) alert(error.message);
    else {
      alert('সংবাদ যোগ হয়েছে!');
      setNewNews({ title: '', content: '', image_url: '' });
      fetchAllNews();
      onUpdate();
    }
    setLoading(false);
  };

  const handleUpdateNews = async () => {
    if (!editingNews || !editingNews.title || !editingNews.content) return alert('সব তথ্য দিন');
    setLoading(true);
    const { error } = await supabase.from('news').update({
      title: editingNews.title,
      content: editingNews.content,
      image_url: editingNews.image_url
    }).eq('id', editingNews.id);
    
    if (error) alert(error.message);
    else {
      alert('সংবাদ আপডেট হয়েছে!');
      setEditingNews(null);
      fetchAllNews();
      onUpdate();
    }
    setLoading(false);
  };

  const handleUpdateService = async () => {
    if (!editingService || !editingService.name || !editingService.phone) return alert('সব তথ্য দিন');
    setLoading(true);
    const { error } = await supabase.from('services').update({
      name: editingService.name,
      phone: editingService.phone,
      description: editingService.description,
      image_url: editingService.image_url,
      category: editingService.category
    }).eq('id', editingService.id);
    
    if (error) alert(error.message);
    else {
      alert('সার্ভিস আপডেট হয়েছে!');
      setEditingService(null);
      fetchAllServices();
      onUpdate();
    }
    setLoading(false);
  };

  const handleImageUpload = async (file: File, type: 'banner' | 'news' | 'edit-news' | 'edit-service') => {
    setLoading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 200);

    const url = await uploadImage(file);
    clearInterval(interval);
    setUploadProgress(100);

    if (url) {
      if (type === 'banner') setFormData({ ...formData, banner_image: url });
      if (type === 'news') setNewNews({ ...newNews, image_url: url });
      if (type === 'edit-news' && editingNews) setEditingNews({ ...editingNews, image_url: url });
      if (type === 'edit-service' && editingService) setEditingService({ ...editingService, image_url: url });
    }

    setTimeout(() => {
      setLoading(false);
      setUploadProgress(0);
    }, 500);
  };

  const deleteNews = async (id: number) => {
    if (!confirm('ডিলিট করতে চান?')) return;
    await supabase.from('news').delete().eq('id', id);
    fetchAllNews();
    onUpdate();
  };

  const deleteService = async (id: number) => {
    if (!confirm('ডিলিট করতে চান?')) return;
    await supabase.from('services').delete().eq('id', id);
    fetchAllServices();
    onUpdate();
  };

  const updateUserPermission = async (userId: string, field: keyof Profile, value: any) => {
    const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', userId);
    if (error) alert('Error: ' + error.message);
    else fetchAllProfiles();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData.id) {
        const { error } = await supabase.from('home_settings').update(formData).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('home_settings').insert([formData]).select().single();
        if (error) throw error;
        if (data) setFormData(data);
      }
      alert('Settings updated successfully!');
      onUpdate();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: PendingService) => {
    const { id, created_at, ...serviceData } = item;
    const { error: insertError } = await supabase.from('services').insert([serviceData]);
    if (insertError) return alert('Approve Error: ' + insertError.message);
    
    await supabase.from('pending_services').delete().eq('id', item.id);
    alert('সফলভাবে অ্যাপ্রুভ করা হয়েছে!');
    fetchPendingItems();
  };

  const handleDeletePending = async (id: number) => {
    if (!confirm('আপনি কি নিশ্চিত যে এটি ডিলিট করতে চান?')) return;
    await supabase.from('pending_services').delete().eq('id', id);
    fetchPendingItems();
  };

  const toggleCategory = (catId: string) => {
    const current = formData.allowed_categories || [];
    const updated = current.includes(catId) 
      ? current.filter(id => id !== catId) 
      : [...current, catId];
    setFormData({ ...formData, allowed_categories: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Settings size={20} /> অ্যাডমিন প্যানেল</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${settings ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <p className="text-[8px] font-black uppercase tracking-widest text-white/60">
                {settings ? 'Database Connected' : 'Database Disconnected'}
              </p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-white/20 rounded-full" title="লগ আউট">
          <LogOut size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {storageError && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2.5rem] flex flex-col gap-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-100">
                <ShieldCheck size={28} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-black text-rose-700">Storage Error!</h4>
                  <button 
                    onClick={checkStorageBucket}
                    className="p-2 bg-white text-rose-500 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                  >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  </button>
                </div>
                <p className="text-xs text-rose-600 mt-1 leading-relaxed font-medium">
                  {storageError}
                </p>
              </div>
            </div>
            
            <div className="bg-white/50 p-4 rounded-3xl space-y-3">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">কিভাবে সমাধান করবেন?</p>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={attemptAutoFix}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-100 disabled:opacity-50"
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />} 
                  স্বয়ংক্রিয়ভাবে ঠিক করুন (Auto-Fix)
                </button>
                <div className="p-3 bg-rose-100/50 rounded-2xl">
                  <p className="text-[10px] text-rose-700 leading-normal">
                    <span className="font-bold">ম্যানুয়াল পদ্ধতি:</span> Supabase Dashboard → Storage → New Bucket → নাম দিন <code className="font-bold">images</code> → <span className="font-bold">Public</span> চালু করুন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'banner', label: '🖼️ Banner', show: currentProfile?.can_edit_settings },
            { id: 'permissions', label: '🔐 Permissions', show: currentProfile?.can_edit_settings },
            { id: 'pending', label: `⏳ Pending (${pendingItems.length})`, show: currentProfile?.can_approve_services },
            { id: 'services', label: '🛠️ Services', show: currentProfile?.can_approve_services },
            { id: 'news', label: '📰 News', show: currentProfile?.can_edit_news },
            { id: 'users', label: '👥 Users', show: currentProfile?.can_manage_users },
            { id: 'system', label: '⚙️ System', show: currentProfile?.role === 'admin' }
          ].filter(tab => tab.show || currentProfile?.role === 'admin').map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'banner' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🖼️ হোম Banner সেটিংস</h3>
              <div className="space-y-4">
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="ব্যানার টেক্সট" value={formData.banner_text} onChange={e => setFormData({...formData, banner_text: e.target.value})} />
                
                <ImageUploadField 
                  label="ব্যানার ইমেজ"
                  currentImage={formData.banner_image}
                  onUpload={(file) => handleImageUpload(file, 'banner')}
                  loading={loading && uploadProgress > 0}
                  progress={uploadProgress}
                />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">⭐ Featured কার্ড ১</h3>
              <div className="space-y-4">
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="টাইটেল" value={formData.featured_card_1_title} onChange={e => setFormData({...formData, featured_card_1_title: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="সাব-টাইটেল" value={formData.featured_card_1_desc} onChange={e => setFormData({...formData, featured_card_1_desc: e.target.value})} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">⭐ Featured কার্ড ২</h3>
              <div className="space-y-4">
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="টাইটেল" value={formData.featured_card_2_title} onChange={e => setFormData({...formData, featured_card_2_title: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="সাব-টাইটেল" value={formData.featured_card_2_desc} onChange={e => setFormData({...formData, featured_card_2_desc: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-slate-800">Allow User Data Entry</h3>
                  <p className="text-xs text-slate-400">ইউজারদের ডাটা যোগ করার অনুমতি দিন</p>
                </div>
                <button 
                  onClick={() => setFormData({...formData, allow_user_contribution: !formData.allow_user_contribution})}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.allow_user_contribution ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.allow_user_contribution ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {formData.allow_user_contribution && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Allowed Categories</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                        <div className="flex items-center gap-3">
                          <cat.icon size={18} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{cat.title}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={formData.allowed_categories?.includes(cat.id)} 
                          onChange={() => toggleCategory(cat.id)}
                          className="w-5 h-5 accent-emerald-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400">কোন পেন্ডিং রিকোয়েস্ট নেই</div>
            ) : (
              pendingItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase">{item.category}</span>
                      <h4 className="font-bold text-slate-800 mt-1">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.phone}</p>
                    </div>
                    <p className="text-[10px] text-slate-300">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">{item.description}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(item)} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold">Approve</button>
                    <button onClick={() => handleDeletePending(item.id)} className="flex-1 bg-rose-50 text-rose-600 py-2 rounded-xl text-xs font-bold">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold text-slate-800">সব সার্ভিস ম্যানেজমেন্ট</h3>
              <button onClick={fetchAllServices} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><RefreshCw size={18} /></button>
            </div>
            
            {editingService ? (
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-emerald-700">সার্ভিস এডিট করুন</h4>
                  <button onClick={() => setEditingService(null)} className="p-2 text-slate-400"><X size={18} /></button>
                </div>
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="নাম" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="ফোন" value={editingService.phone} onChange={e => setEditingService({...editingService, phone: e.target.value})} />
                <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm h-24" placeholder="বর্ণনা" value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} />
                <select 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm"
                  value={editingService.category}
                  onChange={e => setEditingService({...editingService, category: e.target.value})}
                >
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
                </select>
                
                <ImageUploadField 
                  label="সার্ভিস ইমেজ"
                  currentImage={editingService.image_url}
                  onUpload={(file) => handleImageUpload(file, 'edit-service')}
                  loading={loading && uploadProgress > 0}
                  progress={uploadProgress}
                />

                <button onClick={handleUpdateService} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50">
                  {loading && uploadProgress === 0 ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                </button>
              </div>
            ) : (
              allServices.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <img src={s.image_url || `https://picsum.photos/seed/${s.id}/50/50`} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{s.name}</h4>
                      <p className="text-[10px] text-slate-400">{s.category} • {s.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingService(s)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Settings size={18} />
                    </button>
                    <button onClick={() => deleteService(s.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-6">
            {editingNews ? (
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-emerald-700">সংবাদ এডিট করুন</h3>
                  <button onClick={() => setEditingNews(null)} className="p-2 text-slate-400"><X size={18} /></button>
                </div>
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="সংবাদের শিরোনাম" value={editingNews.title} onChange={e => setEditingNews({...editingNews, title: e.target.value})} />
                <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm h-32" placeholder="সংবাদের বিস্তারিত" value={editingNews.content} onChange={e => setEditingNews({...editingNews, content: e.target.value})} />
                
                <ImageUploadField 
                  label="সংবাদ ইমেজ"
                  currentImage={editingNews.image_url}
                  onUpload={(file) => handleImageUpload(file, 'edit-news')}
                  loading={loading && uploadProgress > 0}
                  progress={uploadProgress}
                />

                <button onClick={handleUpdateNews} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50">
                  {loading && uploadProgress === 0 ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                </button>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">📰 নতুন সংবাদ যোগ করুন</h3>
                <div className="space-y-4">
                  <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm" placeholder="সংবাদের শিরোনাম" value={newNews.title} onChange={e => setNewNews({...newNews, title: e.target.value})} />
                  <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm h-32" placeholder="সংবাদের বিস্তারিত" value={newNews.content} onChange={e => setNewNews({...newNews, content: e.target.value})} />
                  
                  <ImageUploadField 
                    label="সংবাদ ইমেজ"
                    currentImage={newNews.image_url}
                    onUpload={(file) => handleImageUpload(file, 'news')}
                    loading={loading && uploadProgress > 0}
                    progress={uploadProgress}
                  />

                  <button onClick={handleAddNews} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50">
                    {loading && uploadProgress === 0 ? 'পাবলিশ হচ্ছে...' : 'সংবাদ পাবলিশ করুন'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-slate-800">সব সংবাদ</h3>
                <button onClick={fetchAllNews} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><RefreshCw size={18} /></button>
              </div>
              {allNews.map(n => (
                <div key={n.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                  <div className="flex items-center gap-3 flex-1 pr-4">
                    {n.image_url && <img src={n.image_url} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />}
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{n.title}</h4>
                      <p className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingNews(n)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Settings size={18} />
                    </button>
                    <button onClick={() => deleteNews(n.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 px-2">ইউজার ম্যানেজমেন্ট</h3>
            {allProfiles.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full rounded-full object-cover" /> : <User size={20} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{p.full_name || 'No Name'}</h4>
                      <p className="text-[10px] text-slate-400">{p.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${p.role === 'admin' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                    {p.role}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                    <select 
                      value={p.role} 
                      onChange={(e) => updateUserPermission(p.id, 'role', e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl text-xs p-2 font-medium"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
                    <button 
                      onClick={() => updateUserPermission(p.id, 'status', p.status === 'active' ? 'blocked' : 'active')}
                      className={`w-full py-2 rounded-xl text-xs font-bold ${p.status === 'active' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}
                    >
                      {p.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                  </div>
                </div>

                {p.role === 'admin' && (
                  <div className="pt-2 border-t border-slate-50 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'can_manage_users', label: 'Manage Users' },
                        { id: 'can_edit_news', label: 'Edit News' },
                        { id: 'can_approve_services', label: 'Approve Services' },
                        { id: 'can_edit_settings', label: 'Edit Settings' }
                      ].map(perm => (
                        <label key={perm.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={!!(p as any)[perm.id]} 
                            onChange={(e) => updateUserPermission(p.id, perm.id as any, e.target.checked)}
                            className="w-4 h-4 accent-emerald-600"
                          />
                          <span className="text-[10px] font-medium text-slate-600">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🛠️ ডাটাবেস সেটআপ</h3>
              <p className="text-xs text-slate-500 mb-4">
                আপনার সুপাবেস প্রজেক্টে যদি টেবিলগুলো না থাকে, তবে নিচের SQL স্ক্রিপ্টটি সুপাবেস SQL এডিটরে রান করুন।
              </p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-40 mb-4">
                <pre>{`-- Run the script in supabase_setup.sql file`}</pre>
              </div>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/supabase_setup.sql';
                  link.download = 'supabase_setup.sql';
                  link.click();
                }}
                className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                SQL ফাইল ডাউনলোড করুন
              </button>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">🌱 ডেমো ডাটা (Seed Data)</h3>
              <p className="text-xs text-slate-500 mb-4">
                ডাটাবেসে কিছু প্রাথমিক ডেমো ডাটা যোগ করুন।
              </p>
              <button 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const demoServices = [
                      { category: 'doctor', name: 'ডাঃ মোঃ আব্দুল্লাহ', phone: '01700000000', description: 'এমবিবিএস, এফসিপিএস (মেডিসিন)' },
                      { category: 'hospital', name: 'আলফাডাঙ্গা উপজেলা স্বাস্থ্য কমপ্লেক্স', phone: '01711111111', description: 'সরকারি হাসপাতাল' },
                      { category: 'fire', name: 'ফায়ার সার্ভিস আলফাডাঙ্গা', phone: '01722222222', description: 'জরুরী অগ্নিনির্বাপণ সেবা' }
                    ];
                    const { error } = await supabase.from('services').insert(demoServices);
                    if (error) throw error;
                    alert('ডেমো ডাটা সফলভাবে যোগ করা হয়েছে!');
                    onUpdate();
                  } catch (err: any) {
                    alert('Error: ' + err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                ডেমো ডাটা যোগ করুন
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        {(activeTab === 'banner' || activeTab === 'permissions') ? (
          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
          >
            {loading ? 'সেভ হচ্ছে...' : <><ShieldCheck size={20} /> সেটিংস সেভ করুন</>}
          </button>
        ) : (
          <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest py-2">
            Alfadanga Admin System v2.0
          </div>
        )}
      </div>
    </div>
  );
};

const AuthModal = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin && role === 'admin') {
        if (secretKey !== 'admin123') {
          throw new Error('ভুল অ্যাডমিন সিক্রেট কি!');
        }
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.user) {
          // প্রোফাইল তৈরি করা
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
              id: data.user.id, 
              email, 
              role, 
              status: 'active',
              can_manage_users: role === 'admin',
              can_edit_news: role === 'admin',
              can_approve_services: role === 'admin',
              can_edit_settings: role === 'admin'
            }]);
          if (profileError) console.error('Profile creation error:', profileError);
          
          if (data.session) {
            // If auto-logged in
            onAuthSuccess();
          } else {
            alert('আপনার ইমেইল চেক করুন (Verification link পাঠানো হয়েছে)। ইমেইল ভেরিফাই করার পর লগইন করুন।');
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">{isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট খুলুন'}</h2>
        <p className="text-sm text-slate-400 mt-1">আপনার তথ্য দিয়ে প্রবেশ করুন</p>
      </div>
      
      {!isLogin && (
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setRole('user')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${role === 'user' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            User
          </button>
          <button 
            onClick={() => setRole('admin')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${role === 'admin' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            Admin
          </button>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="email" 
            placeholder="ইমেইল" 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="password" 
            placeholder="পাসওয়ার্ড" 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {!isLogin && role === 'admin' && (
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="অ্যাডমিন সিক্রেট কি" 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500"
              value={secretKey}
              onChange={e => setSecretKey(e.target.value)}
              required
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 disabled:opacity-50"
        >
          {loading ? 'অপেক্ষা করুন...' : isLogin ? 'লগইন' : 'সাইন আপ'}
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="w-full text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        {isLogin ? 'নতুন অ্যাকাউন্ট খুলতে চান? সাইন আপ করুন' : 'অ্যাকাউন্ট আছে? লগইন করুন'}
      </button>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'list' | 'news' | 'login' | 'emergency' | 'blood' | 'notice'>('home');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<HomeSettings | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    fetchInitialData();
    
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // যখনই ভিউ পরিবর্তন হবে, প্রোফাইল রিফ্রেশ হবে
  useEffect(() => {
    if (view === 'login' && user) {
      fetchProfile(user.id);
    }
  }, [view]);

  const fetchProfile = async (userId: string) => {
    if (!userId) return;
    setProfileLoading(true);
    try {
      // ১. প্রথমে ID দিয়ে চেষ্টা
      const { data: idData, error: idError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (idData) {
        setProfile(idData as Profile);
        setProfileLoading(false);
        return;
      }

      // ২. যদি ID দিয়ে না পাওয়া যায়, তবে ইমেইল দিয়ে চেষ্টা (Fallback)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) {
        const { data: emailData } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle();
        
        if (emailData) {
          setProfile(emailData as Profile);
          setProfileLoading(false);
          return;
        }
      }

      // ৩. যদি একদমই না থাকে, তবেই নতুন তৈরি করা
      if (authUser && authUser.id === userId) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: userId, 
            email: authUser.email, 
            role: 'user', 
            status: 'active'
          }])
          .select()
          .maybeSingle();
        
        if (newProfile) setProfile(newProfile as Profile);
      }
    } catch (err) {
      console.error("Critical Error in fetchProfile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('home');
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: settingsData, error: settingsError } = await supabase.from('home_settings').select('*').maybeSingle();
      if (settingsError) {
        console.error("Settings error:", settingsError);
      }
      
      const { data: newsData, error: newsError } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(5);
      if (newsError) {
        console.error("News error:", newsError);
      }
      
      if (settingsData) setSettings(settingsData);
      else {
        // If no settings, we might be on a fresh DB
        console.log("No settings found, database might need initialization.");
      }
      if (newsData) setNews(newsData);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesByCategory = async (category: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', category);
      
      if (error) throw error;
      if (data) setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    fetchServicesByCategory(category);
    setView('list');
  };

  const categories = [
    { id: 'doctor', title: 'ডাক্তার', icon: Stethoscope, color: 'bg-rose-500' },
    { id: 'hospital', title: 'হাসপাতাল', icon: Hospital, color: 'bg-blue-500' },
    { id: 'bus', title: 'বাস', icon: Bus, color: 'bg-amber-500' },
    { id: 'train', title: 'ট্রেন', icon: Train, color: 'bg-slate-700' },
    { id: 'place', title: 'দর্শনীয় স্থান', icon: Palmtree, color: 'bg-emerald-500' },
    { id: 'rent', title: 'বাসা ভাড়া', icon: Home, color: 'bg-orange-500' },
    { id: 'shopping', title: 'শপিং', icon: ShoppingBag, color: 'bg-pink-500' },
    { id: 'fire', title: 'ফায়ার সার্ভিস', icon: Flame, color: 'bg-red-600' },
    { id: 'blood', title: 'রক্ত', icon: Droplets, color: 'bg-red-500' },
    { id: 'diagnostic', title: 'ডায়াগনস্টিক', icon: Microscope, color: 'bg-cyan-600' },
    { id: 'wedding', title: 'ওয়েডিং সার্ভিস', icon: Heart, color: 'bg-rose-400' },
    { id: 'car', title: 'গাড়ি ভাড়া', icon: Car, color: 'bg-blue-600' },
    { id: 'courier', title: 'কুরিয়ার', icon: Package, color: 'bg-amber-700' },
    { id: 'police', title: 'থানা-পুলিশ', icon: ShieldCheck, color: 'bg-indigo-600' },
    { id: 'paurashava', title: 'পৌর সেবা', icon: Building2, color: 'bg-slate-500' },
    { id: 'electricity', title: 'বিদ্যুৎ অফিস', icon: Zap, color: 'bg-yellow-500' },
    { id: 'mechanic', title: 'মিস্ত্রি', icon: Wrench, color: 'bg-emerald-500' },
    { id: 'emergency', title: 'জরুরী সেবা', icon: Megaphone, color: 'bg-red-500' },
    { id: 'job', title: 'চাকরি', icon: Briefcase, color: 'bg-slate-600' },
    { id: 'entrepreneur', title: 'উদ্যোক্তা', icon: UserPlus, color: 'bg-emerald-600' },
    { id: 'teacher', title: 'শিক্ষক', icon: User, color: 'bg-indigo-500' },
    { id: 'hotel', title: 'হোটেল', icon: Hotel, color: 'bg-blue-400' },
    { id: 'restaurant', title: 'রেস্টুরেন্ট', icon: UtensilsCrossed, color: 'bg-orange-400' },
    { id: 'land', title: 'ফ্ল্যাট ও জমি', icon: Building, color: 'bg-slate-700' },
    { id: 'news_today', title: 'আজকের খবর', icon: Newspaper, color: 'bg-blue-500' },
    { id: 'education', title: 'শিক্ষা প্রতিষ্ঠান', icon: GraduationCap, color: 'bg-indigo-700' },
    { id: 'nursery', title: 'নার্সারি', icon: Palmtree, color: 'bg-emerald-600' },
  ];

  const filteredCategories = categories.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isContributionAllowed = settings?.allow_user_contribution && selectedCategory && settings.allowed_categories?.includes(selectedCategory);

  if (loading && !settings) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800">{t.loading}</h2>
      </div>
    );
  }

  if (view === 'admin' as any && profile?.role === 'admin') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 shadow-xl flex flex-col relative font-sans">
        <AdminPanel 
          settings={settings} 
          onUpdate={fetchInitialData} 
          onClose={() => setView('home')}
          categories={categories}
          handleLogout={handleLogout}
          currentProfile={profile}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 shadow-xl flex flex-col relative font-sans overflow-x-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={categories}
        onCategoryClick={handleCategoryClick}
        setView={setView}
        profile={profile}
        lang={lang}
        setLang={setLang}
      />

      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 pt-6"
            >
              {/* Header */}
              <div className="px-6 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-slate-800 leading-tight">
                    {lang === 'bn' ? 'আলফাডাঙ্গা' : 'Alfadanga'} <br/>
                    <span className="text-emerald-600">{lang === 'bn' ? 'ডিজিটাল পোর্টাল' : 'Digital Portal'}</span>
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-4 bg-white rounded-[1.5rem] shadow-sm border border-slate-100 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Menu size={20} />
                </button>
              </div>

              {/* Weather */}
              <WeatherWidget lang={lang} />

              {/* Banner */}
              {settings?.banner_text && (
                <div className="px-4">
                  <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-emerald-100">
                    <div className="relative z-10">
                      <h2 className="text-xl font-black leading-tight mb-4">{settings.banner_text}</h2>
                      <button 
                        onClick={() => setView('list')}
                        className="bg-white text-emerald-600 px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-900/20 hover:scale-105 transition-transform"
                      >
                        {t.services}
                      </button>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="px-4">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.categories}</h3>
                  <button onClick={() => setView('list')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.all_services}</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
                  {categories.slice(0, 8).map((cat) => (
                    <CategoryCard 
                      key={cat.id}
                      {...cat}
                      isTop
                      lang={lang}
                      onClick={() => handleCategoryClick(cat.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Featured Cards */}
              <div className="px-4 grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ y: -5 }}
                  onClick={() => setView('emergency')}
                  className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
                    <AlertTriangle size={20} />
                  </div>
                  <h4 className="text-sm font-black text-rose-900 mb-1">{t.emergency}</h4>
                  <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Quick Call</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5 }}
                  onClick={() => setView('blood')}
                  className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 cursor-pointer group"
                >
                  <div className="w-10 h-10 bg-red-600 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                    <Droplet size={20} />
                  </div>
                  <h4 className="text-sm font-black text-red-900 mb-1">{t.blood}</h4>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Find Donor</p>
                </motion.div>
              </div>

              {/* Notice & Complaint */}
              <div className="px-4 space-y-4">
                <button 
                  onClick={() => setView('notice')}
                  className="w-full flex items-center justify-between p-6 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:rotate-12 transition-transform">
                      <ClipboardList size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black text-slate-800">{t.notice}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Latest Updates</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
                <button 
                  onClick={() => setIsComplaintOpen(true)}
                  className="w-full flex items-center justify-between p-6 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:bg-slate-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:rotate-12 transition-transform">
                      <MessageSquare size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-black text-slate-800">{t.complaint}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Submit Box</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'emergency' && (
            <motion.div key="emergency" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pt-6">
              <div className="px-6 flex items-center gap-4">
                <button onClick={() => setView('home')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600"><ChevronLeft size={20} /></button>
                <h2 className="text-xl font-black text-slate-800">{t.emergency}</h2>
              </div>
              <EmergencyHotlines lang={lang} />
            </motion.div>
          )}

          {view === 'blood' && (
            <motion.div key="blood" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pt-6">
              <div className="px-6 flex items-center gap-4">
                <button onClick={() => setView('home')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600"><ChevronLeft size={20} /></button>
                <h2 className="text-xl font-black text-slate-800">{t.blood}</h2>
              </div>
              <BloodDonorList lang={lang} />
            </motion.div>
          )}

          {view === 'notice' && (
            <motion.div key="notice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pt-6">
              <div className="px-6 flex items-center gap-4">
                <button onClick={() => setView('home')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600"><ChevronLeft size={20} /></button>
                <h2 className="text-xl font-black text-slate-800">{t.notice}</h2>
              </div>
              <NoticeBoard lang={lang} />
            </motion.div>
          )}

          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pt-6">
              <div className="px-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder={t.search}
                    className="w-full pl-12 pr-4 py-4 bg-white rounded-[1.5rem] shadow-sm border border-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="px-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${!selectedCategory ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border border-slate-100'}`}
                >
                  {t.all_services}
                </button>
                {categories.map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border border-slate-100'}`}
                  >
                    {lang === 'bn' ? cat.title : cat.id.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="px-6 space-y-4">
                {services
                  .filter(s => (!selectedCategory || s.category === selectedCategory) && (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase())))
                  .map((s, i) => (
                    <motion.div 
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-base font-black text-slate-800 mb-1">{s.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                        </div>
                        <div className={`p-3 rounded-2xl ${categories.find(c => c.id === s.category)?.color || 'bg-slate-100'} text-white shadow-sm`}>
                          {(() => {
                            const Icon = categories.find(c => c.id === s.category)?.icon || Info;
                            return <Icon size={20} />;
                          })()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${s.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                          <Phone size={14} /> {t.call}
                        </a>
                        <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
                          <MapIcon size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {view === 'news' && (
            <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 pt-6">
              <div className="px-6">
                <h2 className="text-2xl font-black text-slate-800">{t.news}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latest from Alfadanga</p>
              </div>
              <div className="px-6 space-y-6">
                {news.map((n, i) => (
                  <motion.div 
                    key={n.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group"
                  >
                    {n.image_url && <img src={n.image_url} alt={n.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />}
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-black text-slate-800 leading-tight">{n.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{n.content}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</span>
                        <button className="text-xs font-black text-emerald-600 uppercase tracking-widest">Read More</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="px-6 pt-6">
              {profile ? (
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 text-center relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full rounded-[2rem] object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User size={40} className="text-emerald-600" />
                        )}
                      </div>
                      <h2 className="text-xl font-black text-slate-800">{profile.full_name}</h2>
                      <p className="text-xs text-slate-400 font-medium mb-6">{profile.email}</p>
                      <div className="flex gap-2">
                        <button onClick={handleLogout} className="flex-1 bg-rose-50 text-rose-600 py-4 rounded-2xl text-xs font-black hover:bg-rose-100 transition-all">
                          {t.logout}
                        </button>
                        {profile.role === 'admin' && (
                          <button onClick={() => setView('admin' as any)} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                            {t.admin}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="absolute -left-4 -top-4 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-50" />
                  </div>
                  <ProfileSettings profile={profile} onUpdate={fetchInitialData} />
                </div>
              ) : (
                <AuthModal onAuthSuccess={fetchInitialData} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {isSubmitModalOpen && selectedCategory && (
        <SubmissionModal 
          category={selectedCategory} 
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={() => {
            setIsSubmitModalOpen(false);
            alert('আপনার তথ্যটি যাচাইয়ের জন্য পাঠানো হয়েছে। ধন্যবাদ!');
          }}
        />
      )}

      {isComplaintOpen && (
        <ComplaintBox lang={lang} onClose={() => setIsComplaintOpen(false)} />
      )}

      <Footer setView={setView} currentView={view} lang={lang} />
    </div>
  );
}
