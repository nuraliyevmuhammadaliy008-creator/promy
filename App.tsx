/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  LogOut, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Coffee, 
  User, 
  Lock, 
  Mail, 
  PlusCircle, 
  Calendar, 
  ChevronUp, 
  ChevronDown, 
  ShoppingBag, 
  Printer, 
  Archive, 
  Sparkles, 
  Store, 
  Clock, 
  ArrowRight, 
  LockKeyhole, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Check, 
  X, 
  Percent,
  RefreshCw,
  Layout,
  Sliders,
  Flame,
  UtensilsCrossed
} from 'lucide-react';
import { usePOS } from './usePOS';
import { Product, Table, ProductCategory, TableStatus, CustomWidget } from './types';

export default function App() {
  const pos = usePOS();
  
  // Local state managers
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'analytics'>('pos');
  
  // Auth Form State
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cafeName, setCafeName] = useState('');
  
  // POS Search/Filter State
  const [selectedCategory, setSelectedCategory] = useState<'Barchasi' | ProductCategory>('Barchasi');
  const [productSearch, setProductSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Barchasi' | TableStatus>('Barchasi');

  // Modals & Action overlays
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [showRenameTableModal, setShowRenameTableModal] = useState<Table | null>(null);
  const [renamedTableName, setRenamedTableName] = useState('');
  
  const [showAddProdModal, setShowAddProdModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Taom');
  const [prodAvailable, setProdAvailable] = useState(true);

  // General Confirmation Modals
  const [deleteConfirmType, setDeleteConfirmType] = useState<'table' | 'product' | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Checkout Receipt Simulator State
  const [simulatingReceiptTable, setSimulatingReceiptTable] = useState<Table | null>(null);

  // Live Toast Notifications State
  interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    text: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Auth triggers
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !email || !password || !cafeName) {
      addNotification("Iltimos, barcha maydonlarni to‘ldiring!", 'error');
      return;
    }
    const res = pos.registerCafe(ownerName, email, password, cafeName);
    if (res.success) {
      addNotification(res.message, 'success');
      // Reset forms
      setOwnerName('');
      setEmail('');
      setPassword('');
      setCafeName('');
    } else {
      addNotification(res.message, 'error');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addNotification("Iltimos, email va parolni kiriting!", 'error');
      return;
    }
    const res = pos.loginCafe(email, password);
    if (res.success) {
      addNotification(res.message, 'success');
      // Reset
      setEmail('');
      setPassword('');
    } else {
      addNotification(res.message, 'error');
    }
  };

  const handleLogout = () => {
    pos.logoutCafe();
    addNotification("Tizimdan muvaffaqiyatli chiqdingiz.", 'info');
  };

  // Table add trigger
  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) {
      addNotification("Stol nomini kiriting!", "error");
      return;
    }
    const res = pos.addTable(newTableName);
    if (res.success) {
      addNotification(res.message, "success");
      setNewTableName('');
      setShowAddTableModal(false);
    } else {
      addNotification(res.message, "error");
    }
  };

  // Table rename trigger
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenameTableModal || !renamedTableName) return;
    const res = pos.renameTable(showRenameTableModal.id, renamedTableName);
    if (res.success) {
      addNotification(res.message, 'success');
      setRenamedTableName('');
      setShowRenameTableModal(null);
    } else {
      addNotification(res.message, 'error');
    }
  };

  // Product submitting (Add / Edit)
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      addNotification("Mahsulot nomini kiritish majburiy!", "error");
      return;
    }
    if (prodPrice <= 0) {
      addNotification("Narx 0 so‘mdan yuqori bo‘lishi shart!", "error");
      return;
    }

    if (editingProduct) {
      const res = pos.editProduct(editingProduct.id, prodName, prodPrice, prodCategory, prodAvailable);
      if (res.success) {
        addNotification(res.message, "success");
        setEditingProduct(null);
        setShowAddProdModal(false);
        resetProductForm();
      } else {
        addNotification(res.message, "error");
      }
    } else {
      const res = pos.addProduct(prodName, prodPrice, prodCategory, prodAvailable);
      if (res.success) {
        addNotification(res.message, "success");
        setShowAddProdModal(false);
        resetProductForm();
      } else {
        addNotification(res.message, "error");
      }
    }
  };

  const resetProductForm = () => {
    setProdName('');
    setProdPrice(0);
    setProdCategory('Taom');
    setProdAvailable(true);
  };

  // Open edit product modal with settings pre-filled
  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdCategory(p.category);
    setProdAvailable(p.available);
    setShowAddProdModal(true);
  };

  // Handle table click trigger safely
  const handleTableSelect = (tableId: string) => {
    pos.setActiveTableId(tableId);
  };

  // Direct order item injection
  const handleAddProductToActiveTable = (product: Product) => {
    if (!pos.activeTableId) {
      addNotification("Iltimos, avval chap paneldan stolni tanlang!", "error");
      return;
    }
    const res = pos.addOrder(pos.activeTableId, product);
    if (res.success) {
      addNotification(res.message, "success");
    } else {
      addNotification(res.message, "error");
    }
  };

  // Safe table or product deletions after validation
  const triggerDeleteConfirm = (type: 'table' | 'product', id: string) => {
    setDeleteConfirmType(type);
    setDeleteConfirmId(id);
  };

  const executeDelete = () => {
    if (!deleteConfirmType || !deleteConfirmId) return;
    
    if (deleteConfirmType === 'table') {
      const res = pos.deleteTable(deleteConfirmId);
      if (res.success) {
        addNotification(res.message, 'success');
      } else {
        addNotification(res.message, 'error');
      }
    } else {
      const res = pos.deleteProduct(deleteConfirmId);
      if (res.success) {
        addNotification(res.message, 'success');
      } else {
        addNotification(res.message, 'error');
      }
    }
    
    setDeleteConfirmType(null);
    setDeleteConfirmId(null);
  };

  // Process checkout payments and open simulation
  const handleCheckoutClick = (table: Table) => {
    if (table.orders.length === 0) {
      addNotification("Ushbu stolda hech qanday buyurtma yo‘q!", "error");
      return;
    }
    // Set table for the physical receipt preview
    setSimulatingReceiptTable(table);
  };

  const confirmReceiptPayment = () => {
    if (!simulatingReceiptTable) return;
    const res = pos.processPayment(simulatingReceiptTable.id);
    if (res.success) {
      addNotification(res.message, 'success');
      setSimulatingReceiptTable(null);
    } else {
      addNotification(res.message, 'error');
    }
  };

  // Filter tables
  const filteredTables = useMemo(() => {
    return pos.tables.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(tableSearch.toLowerCase());
      const matchesStatus = statusFilter === 'Barchasi' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pos.tables, tableSearch, statusFilter]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return pos.products.filter(p => {
      const matchesCategory = selectedCategory === 'Barchasi' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [pos.products, selectedCategory, productSearch]);

  const activeTable = pos.tables.find(t => t.id === pos.activeTableId);

  // Helper formatting currency
  const formatUZS = (val: number) => {
    return val.toLocaleString('uz-UZ') + " so‘m";
  };

  // Interactive reorder widget actions (dragging replacement arrows for stable layout shifts)
  const handleWidgetShift = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    pos.moveWidget(index, nextIdx);
    addNotification("Widget tartibi o‘zgartirildi", "info");
  };

  // Authentication screens
  if (!pos.currentCafe) {
    return (
      <div className="relative min-h-screen bg-[#070a13] flex items-center justify-center p-4 overflow-hidden selection:bg-indigo-500 selection:text-white">
        {/* Glow ambient design elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[60%] w-[350px] h-[350px] rounded-full bg-emerald-950/10 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md z-10">
          {/* Logo Heading */}
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-indigo-400/20 mb-4 scale-hover transition-transform duration-300">
              <ChefHat className="w-9 h-9 text-white animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
              UZ <span className="text-gradient bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">POS PRO</span>
            </h1>
            <p className="text-xs text-slate-400 mt-2 font-mono uppercase tracking-widest">SaaS Restoran Tizimi • $200-$500 litsenziya</p>
          </div>

          {/* Form Container */}
          <div className="glass-panel rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-5">
              <button 
                type="button"
                className={`text-lg font-heading font-semibold transition-colors duration-200 ${authView === 'login' ? 'text-white border-b-2 border-indigo-500 pb-1' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setAuthView('login')}
              >
                Kirish (Kassa)
              </button>
              <button 
                type="button"
                className={`text-lg font-heading font-semibold transition-colors duration-200 ${authView === 'register' ? 'text-white border-b-2 border-indigo-500 pb-1' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setAuthView('register')}
              >
                Yangi Kafe Ochish
              </button>
            </div>

            <AnimatePresence mode="wait">
              {authView === 'login' ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleLogin} 
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kafengiz ma‘lumotlariga xavfsiz kirish va real-vaqt kassa rejimida ishlash uchun sozlangan ma‘lumotlarni kiriting.
                  </p>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Elektron Pochta</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                      <input 
                        type="email" 
                        required
                        className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm outline-none transition-all duration-200"
                        placeholder="masalan, admin@shashlik.uz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.55">Parol</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                      <input 
                        type="password" 
                        required
                        className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm outline-none transition-all duration-200"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-3 px-4 rounded-xl font-heading font-medium tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer transition-all duration-200 mt-6"
                  >
                    Tizimga Kirish
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="bg-slate-900/45 rounded-xl p-3 border border-slate-800/80 mt-4 text-[11px] text-indigo-300/90 leading-normal text-center">
                    Tizim to‘liq offline ishlaydi. Ma‘lumotlar faqat sizning brauzeringizda (LocalStorage) xavfsiz saqlanadi.
                  </div>
                </motion.form>
              ) : (
                <motion.form 
                  key="register-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleRegister} 
                  className="space-y-4"
                >
                  <p className="text-xs text-slate-400">
                    SaaS platformamizda mustaqil yangi kafe accounts yarating. Istalgancha yangi accounts ochishingiz mumkin.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Muassasa (Kafe/Restoran) Nomi</label>
                    <div className="relative">
                      <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm outline-none transition-all duration-200"
                        placeholder="masalan, Rayhon Milliy Taomlar"
                        value={cafeName}
                        onChange={(e) => setCafeName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Egasi / Direktor Ismi</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm outline-none transition-all duration-200"
                        placeholder="Ism va familiyangizni yozing"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Elektron Pochta</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                      <input 
                        type="email" 
                        required
                        className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm outline-none transition-all duration-200"
                        placeholder="email@cafe.uz"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Maxfiy Parol</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4.5 h-4.5" />
                      <input 
                        type="password" 
                        required
                        className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-slate-200 text-sm outline-none transition-all duration-200"
                        placeholder="kamida 6 ta belgi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white py-3 px-4 rounded-xl font-heading font-medium tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer transition-all duration-200 mt-6"
                  >
                    SaaS Accountni yaratish
                    <Plus className="w-5 h-5" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className="text-center mt-6 text-xs text-slate-500 leading-normal">
            Lokal kassa tizimi o‘rnatilgan va sinovdan o‘tgan.<br/>
            Sotish koeffitsiyenti: <span className="font-mono text-emerald-400">100% litsenziyalangan</span>
          </div>
        </div>
        
        {/* Custom Toast Alert overlays */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map(t => (
            <div 
              key={t.id} 
              className={`p-4 rounded-xl shadow-xl flex items-center gap-3 border text-sm text-slate-100 ${
                t.type === 'error' ? 'bg-red-950/80 border-red-800/50' : 
                t.type === 'info' ? 'bg-blue-950/80 border-blue-800/50' : 
                'bg-emerald-950/80 border-emerald-800/50'
              }`}
            >
              {t.type === 'error' ? <XCircle className="w-5 h-5 text-red-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Loaded Active Cafe Dashboard Layout
  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Alert popups */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className={`p-4 rounded-xl shadow-xl flex items-center gap-3 border text-sm text-slate-100 transition-all duration-300 animate-slide-in ${
              t.type === 'error' ? 'bg-red-900/90 border-red-700/60' : 
              t.type === 'info' ? 'bg-indigo-950/90 border-indigo-700/60' : 
              'bg-emerald-900/90 border-emerald-700/60'
            }`}
          >
            {t.type === 'error' ? <XCircle className="w-5 h-5 text-red-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* Top Professional Header Bar */}
      <header className="glass-panel border-b border-slate-800/80 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-indigo-400/20 shadow-md">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-extrabold text-white text-gradient bg-clip-text">
                {pos.currentCafe.cafeName}
              </h2>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest font-mono">
                SaaS Faol
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Egasi: <span className="text-slate-300 font-medium">{pos.currentCafe.ownerName}</span>
            </p>
          </div>
        </div>

        {/* Live Clock and Calendar Contextual Segment */}
        <div className="hidden md:flex items-center gap-5 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{currentTime.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300 font-bold">
            <Clock className="w-4 h-4 text-purple-400 animate-spin-slow" />
            <span>{currentTime.toLocaleTimeString('uz-UZ')}</span>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2.5">
          {/* Module Tab Toggles */}
          <nav className="flex items-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 mr-2">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-155 cursor-pointer ${activeTab === 'pos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Kassa POS
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-155 cursor-pointer ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Archive className="w-3.5 h-3.5" />
              Menyu Ma‘lumotlari
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-155 cursor-pointer ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analitika
            </button>
          </nav>

          {/* Logout operation */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-950/60 hover:bg-red-900 text-red-200 hover:text-white px-3.5 py-2.5 rounded-xl border border-red-800/40 text-xs font-medium cursor-pointer transition-colors duration-155"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </header>

      {/* Main Panel views conditional routing */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* -------------------- 1. POS SALES INTERFACE -------------------- */}
          {activeTab === 'pos' && (
            <motion.div
              key="pos-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-[calc(100vh-80px)] flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 overflow-hidden"
            >
              
              {/* LEFT SIDEBAR: Stol Tizimi (Tables System) */}
              <section className="w-full lg:w-1/4 flex flex-col bg-[#0a0e1b] overflow-hidden shrink-0">
                <div className="p-4 border-b border-slate-800 flex flex-col gap-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-heading flex items-center gap-1.5">
                      <Layout className="w-4 h-4 text-indigo-400" />
                      Stollar ({pos.tables.length})
                    </h3>
                    <button
                      onClick={() => setShowAddTableModal(true)}
                      className="bg-indigo-600/90 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Qo‘shish
                    </button>
                  </div>

                  {/* Filter Status controls */}
                  <div className="flex flex-wrap gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {(['Barchasi', 'Bo‘sh', 'Band', 'Hisoblangan'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`flex-1 text-center py-1 rounded transition-all cursor-pointer font-medium ${statusFilter === st ? 'bg-slate-800 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Search table input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                    <input
                      type="text"
                      className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Stollarni izlash..."
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Stollar ro‘yxati (Dynamic custom cards scroll container) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredTables.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-2xl">
                      <Store className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs text-slate-500">Stollar topilmadi</p>
                    </div>
                  ) : (
                    filteredTables.map((t) => {
                      const isSelected = pos.activeTableId === t.id;
                      const isBusy = t.orders.length > 0;
                      
                      return (
                        <div
                          key={t.id}
                          className={`group rounded-2xl p-3.5 transition-all duration-200 relative cursor-pointer border ${
                            isSelected 
                              ? 'bg-indigo-950/50 border-indigo-500/80 shadow-lg shadow-indigo-500/5' 
                              : 'bg-slate-900/35 border-slate-800/70 hover:border-slate-700/80 hover:bg-slate-900/65'
                          }`}
                          onClick={() => handleTableSelect(t.id)}
                        >
                          {/* Active Indicators glow */}
                          {isSelected && (
                            <div className="absolute top-0 right-0 h-1.5 w-12 bg-gradient-to-l from-indigo-500 to-purple-500 rounded-bl-xl rounded-tr-xl" />
                          )}

                          <div className="flex items-center justify-between mb-2">
                            <span className="font-heading font-bold text-slate-200 text-sm truncate max-w-[145px]">
                              {t.name}
                            </span>
                            
                            {/* Color coded status badges */}
                            <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${
                              t.status === 'Bo‘sh' ? 'bg-slate-950/40 text-slate-400 border-slate-800' :
                              t.status === 'Band' ? 'bg-purple-900/20 text-purple-400 border-purple-800/40 animate-pulse' :
                              'bg-emerald-900/20 text-emerald-400 border-emerald-800/40'
                            }`}>
                              {t.status}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between mt-3 text-xs">
                            <span className="text-slate-400 font-mono text-[11px]">
                              {t.orders.length} ta mahsulot
                            </span>
                            <span className="font-heading font-bold text-slate-100">
                              {formatUZS(t.totalPrice)}
                            </span>
                          </div>

                          {/* Quick Admin Actions on Hover */}
                          <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-slate-800/65 opacity-0 group-hover:opacity-100 transition-opacity duration-155">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamedTableName(t.name);
                                setShowRenameTableModal(t);
                              }}
                              className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
                              title="Nomini o‘zgartirish"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerDeleteConfirm('table', t.id);
                              }}
                              className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-slate-850/80 transition-colors"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* CENTER PANEL: Faol Buyurtmalar ro‘yxati (Active Orders Detailed Checkout List) */}
              <section className="flex-1 flex flex-col bg-[#070b13] overflow-hidden min-w-0">
                {activeTable ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* Header for dynamic active table state */}
                    <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold font-heading text-white">{activeTable.name}</h3>
                          <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${
                            activeTable.status === 'Bo‘sh' ? 'bg-slate-900 text-slate-400 border-slate-800' :
                            activeTable.status === 'Band' ? 'bg-purple-900/20 text-purple-400 border-purple-800/40' :
                            'bg-emerald-905/20 text-emerald-400 border-emerald-800/40'
                          }`}>
                            Holat: {activeTable.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Buyurtmaning batafsil to‘lov chek hisobi va taqsimoti.</p>
                      </div>

                      {/* Manual Table Status Overrider */}
                      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                        <span className="text-slate-500 font-mono text-[10px] px-2 font-bold uppercase tracking-wider">Holat:</span>
                        {(['Bo‘sh', 'Band', 'Hisoblangan'] as TableStatus[]).map(st => (
                          <button
                            key={st}
                            onClick={() => pos.setTableStatus(activeTable.id, st)}
                            className={`px-2 py-1 rounded-lg font-medium cursor-pointer transition-all ${activeTable.status === st ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Order items scrolling viewport */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                      {activeTable.orders.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-900/10 rounded-3xl border border-dashed border-slate-800">
                          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 mb-4">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                          <h4 className="text-sm font-heading font-semibold text-slate-300">Ushbu stolda buyurtmalar yo‘q</h4>
                          <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                            O‘ng paneldagi mahsulot qatorlarini bosing va buyurtmaga to‘g‘ridan-to‘g‘ri, bir zumda qo‘shing.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                            <span className="col-span-5">Mahsulot</span>
                            <span className="col-span-2 text-center">Narxi</span>
                            <span className="col-span-3 text-center">Miqdor</span>
                            <span className="col-span-2 text-right">Jami</span>
                          </div>

                          {activeTable.orders.map((item) => (
                            <div
                              key={item.productId}
                              className="grid grid-cols-12 items-center bg-slate-900/50 hover:bg-slate-900/80 border border-slate-850/80 rounded-2xl p-3 text-sm transition-colors duration-155"
                            >
                              {/* Product details */}
                              <div className="col-span-5 pr-2">
                                <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                              </div>

                              {/* Price */}
                              <div className="col-span-2 text-center font-mono text-xs text-slate-300">
                                {formatUZS(item.price)}
                              </div>

                              {/* Interactive controls */}
                              <div className="col-span-3 flex items-center justify-center gap-2">
                                <button
                                  onClick={() => pos.updateQuantity(activeTable.id, item.productId, -1)}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold flex items-center justify-center select-none cursor-pointer transition-all border border-slate-700"
                                >
                                  -
                                </button>
                                <span className="font-mono font-bold text-slate-100 text-sm min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => pos.updateQuantity(activeTable.id, item.productId, 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold flex items-center justify-center select-none cursor-pointer transition-all border border-slate-700"
                                >
                                  +
                                </button>
                              </div>

                              {/* Absolute aggregate sum UZS */}
                              <div className="col-span-2 text-right font-heading font-bold text-slate-100 text-xs">
                                {formatUZS(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Integrated POS Invoice bottom footer panel */}
                    <div className="p-4 bg-slate-950 border-t border-slate-800/80 shrink-0">
                      <div className="space-y-2 mb-4 text-xs font-mono text-slate-400">
                        <div className="flex justify-between items-center">
                          <span>Subtotal:</span>
                          <span className="text-slate-200">{formatUZS(activeTable.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            Xizmat haqi (10%):
                            <Percent className="w-3 h-3 text-indigo-400" />
                          </span>
                          <span className="text-slate-200">{formatUZS(Math.round(activeTable.totalPrice * 0.1))}</span>
                        </div>
                        <div className="h-px bg-slate-800/60 my-2" />
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="font-heading text-slate-100 font-extrabold uppercase">Umumiy Summa:</span>
                          <span className="text-xl font-heading text-emerald-400 font-extrabold">
                            {formatUZS(Math.round(activeTable.totalPrice * 1.1))}
                          </span>
                        </div>
                      </div>

                      {/* Payment trigger area */}
                      <button
                        onClick={() => handleCheckoutClick(activeTable)}
                        disabled={activeTable.orders.length === 0}
                        className={`w-full py-4.5 rounded-2xl font-heading font-extrabold tracking-wide text-sm flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200 active:scale-[0.99] shadow-xl ${
                          activeTable.orders.length === 0 
                            ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-500/10'
                        }`}
                      >
                        <Printer className="w-5 h-5 shrink-0" />
                        TO‘LOV TIZIMI (HISOB CHIQARISH)
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#070b13] relative">
                    <div className="absolute inset-0 bg-radial-gradient from-indigo-950/20 via-transparent to-transparent opacity-80 pointer-events-none" />
                    
                    <div className="w-20 h-20 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 mb-5 relative">
                      <Store className="w-10 h-10 text-indigo-500/60" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center animate-bounce text-[9px] font-bold text-white uppercase tracking-wider">UZ</div>
                    </div>
                    
                    <h3 className="text-2xl font-extrabold font-heading text-white tracking-tight mb-2">POS Tizimi Ishchi Hududi</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                      Sotuv amalga oshirish yoki hisob-faktura yuborish uchun <span className="text-indigo-400 font-bold">chap paneldagi istalgan stollardan birini tanlang</span> yoki yangi stol qo‘shing.
                    </p>

                    <div className="mt-8 flex items-center gap-3">
                      <button
                        onClick={() => setShowAddTableModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-medium text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 active:scale-95 cursor-pointer transition-all"
                      >
                        Yangi Stol Ochish
                      </button>
                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="bg-slate-900 hover:bg-slate-850 px-5 py-3 border border-slate-800 rounded-xl text-xs text-slate-300 font-heading font-medium transition-colors"
                      >
                        Tushumlar Hisobotini ko‘rish
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* RIGHT PANEL: Mahsulotlar Ro‘yxati (Product Catalog selection Grid) */}
              <section className="w-full lg:w-1/3 flex flex-col bg-[#0a0e1b] overflow-hidden shrink-0">
                <div className="p-4 border-b border-slate-800 flex flex-col gap-3.5 shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-heading flex items-center gap-1.5 font-mono">
                      <Coffee className="w-4 h-4 text-orange-400" />
                      Menyu Mahsulotlari ({pos.products.length})
                    </h3>
                    <button
                      onClick={() => {
                        resetProductForm();
                        setEditingProduct(null);
                        setShowAddProdModal(true);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Yangi Menyu Item
                    </button>
                  </div>

                  {/* Product Search inputs */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
                    <input
                      type="text"
                      className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Milliy taomlarni izlash..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  {/* Categories picker */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {(['Barchasi', 'Taom', 'Ichimlik', 'Shirinlik'] as const).map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer shrink-0 transition-all ${
                            isActive 
                              ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold' 
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-850'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid list container */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-2 h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-2xl">
                      <Coffee className="w-8 h-8 text-slate-600 mb-2" />
                      <p className="text-xs text-slate-500">Hech qanday mahsulot topilmadi</p>
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => p.available && handleAddProductToActiveTable(p)}
                        className={`group rounded-2xl p-3 border transition-all duration-200 text-left relative flex flex-col justify-between h-[115px] select-none ${
                          p.available 
                            ? 'bg-slate-900/35 border-slate-800/85 hover:border-slate-700/80 hover:bg-slate-900/75 cursor-pointer glass-card-hover' 
                            : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {/* Shading index overlay */}
                        <div className="flex justify-between items-start">
                          {/* Categorized tags */}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                            p.category === 'Taom' ? 'bg-orange-950/40 text-orange-400 border border-orange-900/20' :
                            p.category === 'Ichimlik' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/20' :
                            'bg-purple-950/40 text-purple-400 border border-purple-900/20'
                          }`}>
                            {p.category}
                          </span>

                          {/* Stocks text display */}
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full ${p.available ? 'bg-emerald-900/10 text-emerald-400' : 'bg-red-950/20 text-red-400'}`}>
                            {p.available ? 'Bor' : 'Tugagan'}
                          </span>
                        </div>

                        {/* Title block */}
                        <div className="mt-2.5">
                          <p className="font-semibold text-slate-200 text-xs truncate max-w-full group-hover:text-white transition-colors">
                            {p.name}
                          </p>
                          <p className={`font-heading font-bold text-xs mt-1 ${p.available ? 'text-indigo-400' : 'text-slate-600'}`}>
                            {formatUZS(p.price)}
                          </p>
                        </div>

                        {/* Quick indicator icon top */}
                        {p.available && (
                          <div className="absolute right-3.5 bottom-3.5 w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3.5 h-3.5 text-indigo-400" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>

            </motion.div>
          )}

          {/* -------------------- 2. MENU DETAILS / ADMIN OPERATIONS PANEL -------------------- */}
          {activeTab === 'products' && (
            <motion.div
              key="products-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto p-6 space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold font-heading text-white tracking-tight flex items-center gap-2">
                    <Archive className="w-6 h-6 text-indigo-400" />
                    Menyu Ma‘lumotlar Ombori
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Ushbu ekranda taomlar ro‘yxatini, narxlarini tahrirlang hamda bor/yo‘qligini tekshiring.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      resetProductForm();
                      setEditingProduct(null);
                      setShowAddProdModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-semibold text-xs px-4.5 py-3 rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Yangi Mahsulot Qo‘shish
                  </button>
                </div>
              </div>

              {/* Advanced search operations bar */}
              <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-md">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Katalogdan qidirish..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2">Guruhlash:</span>
                  {(['Barchasi', 'Taom', 'Ichimlik', 'Shirinlik'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${selectedCategory === cat ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog detailed interactive tabular deck */}
              <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800/80">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs font-bold font-mono tracking-widest uppercase border-b border-slate-800/70">
                      <tr>
                        <th className="p-4">Mahsulot Nomi</th>
                        <th className="p-4">Toifa</th>
                        <th className="p-4">Narxi UZS</th>
                        <th className="p-4 text-center">Do‘kon Holati</th>
                        <th className="p-4 text-center">Boshqaruv</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-500 text-xs">
                            Hech qanday mahsulot topilmadi. Qo‘shish tugmasi orqali yangi narsalar yarating!
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-900/25 transition-colors">
                            <td className="p-4 font-semibold text-slate-100">{p.name}</td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase font-mono tracking-wider font-semibold px-2 py-1 rounded-md ${
                                p.category === 'Taom' ? 'bg-orange-950/40 text-orange-400 border border-orange-900/20' :
                                p.category === 'Ichimlik' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/20' :
                                'bg-purple-950/40 text-purple-400 border border-purple-900/20'
                              }`}>
                                {p.category}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-slate-200 font-bold">{formatUZS(p.price)}</td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  const res = pos.toggleAvailability(p.id);
                                  addNotification(res.message, "success");
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border font-mono tracking-wider transition-all cursor-pointer ${
                                  p.available 
                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/20' 
                                    : 'bg-red-950/40 text-red-400 border-red-900/30 hover:bg-red-900/20'
                                }`}
                              >
                                {p.available ? 'Bor (Mavjud)' : 'Tugagan'}
                              </button>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => startEditProduct(p)}
                                  className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Tahrirlash"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => triggerDeleteConfirm('product', p.id)}
                                  className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                  title="O‘chirish"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* -------------------- 3. COMPREHENSIVE ANALYTICS & CUSTOM WIDGETS DASHBOARD -------------------- */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto p-6 space-y-6"
            >
              {/* Header with quick overview */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold font-heading text-white tracking-tight flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-indigo-400" />
                    Boshqaruv va Kassa Analitikasi
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Sotuv tahlillari, o‘rtacha soatlik tushumlar va muassasangiz real statistikalari.</p>
                </div>
                
                {/* Reset button simulator */}
                <button
                  onClick={() => addNotification("Grafik ma‘lumotlari real vaqtda yangilandi", 'info')}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  Hozirgi Holat
                </button>
              </div>

              {/* Core Dynamic SaaS metrics list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Bugungi tushum */}
                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden shadow-lg border-indigo-500/10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-indigo-500" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold font-mono tracking-wider text-slate-400 uppercase">Bugungi tushum</span>
                    <DollarSign className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white mt-1">
                    {formatUZS(pos.dailyIncome())}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Bugun yopilgan stollar hisobi</p>
                </div>

                {/* Oylik tushum */}
                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden shadow-lg border-purple-500/10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold font-mono tracking-wider text-slate-400 uppercase">Oylik tushum</span>
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white mt-1">
                    {formatUZS(pos.monthlyIncome())}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Joiriy oydagi umumiy savdo</p>
                </div>

                {/* Yillik tushum */}
                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden shadow-lg border-emerald-500/10">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-emerald-500" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold font-mono tracking-wider text-slate-400 uppercase">Yillik tushum</span>
                    <Store className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white mt-1">
                    {formatUZS(pos.yearlyIncome())}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Yillik jamlanma daromad</p>
                </div>

                {/* Eng ko'p sotilgan mahsulot */}
                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/40" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold font-mono tracking-wider text-slate-400 uppercase">Top Taom</span>
                    <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-heading font-extrabold text-white mt-1 truncate">
                    {pos.getMostSoldProduct().name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Sotildi: <span className="text-indigo-400 font-bold">{pos.getMostSoldProduct().qty} marta</span>
                  </p>
                </div>

                {/* Aktiv band stollar nomi */}
                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/40" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold font-mono tracking-wider text-slate-400 uppercase">Faol Stollar</span>
                    <UtensilsCrossed className="w-5 h-5 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-heading font-extrabold text-white mt-1">
                    {pos.activeTablesCount} / {pos.tables.length}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">Hozirda band bo‘lgan stollar soni</p>
                </div>
              </div>

              {/* DYNAMIC METRIC DRAG-DROP / SHIFT ARRANGEMENT GRID WIDGETS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pos.widgets.map((wd, idx) => {
                  return (
                    <div
                      key={wd.id}
                      className={`glass-panel p-6 rounded-3xl shadow-xl flex flex-col justify-between ${
                        wd.w === 3 ? 'md:col-span-3' : wd.w === 2 ? 'md:col-span-2' : 'md:col-span-1'
                      }`}
                    >
                      {/* Widget Header with Drag-Shifting arrows keys */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                          <h3 className="text-xs uppercase font-mono tracking-wider font-extrabold text-slate-200">
                            {wd.title}
                          </h3>
                        </div>

                        {/* Shift buttons represent drag and drop safely in the isolated viewport */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                          <button
                            onClick={() => handleWidgetShift(idx, 'up')}
                            disabled={idx === 0}
                            className={`p-1 rounded transition-colors text-slate-500 hover:text-slate-200 cursor-pointer ${idx === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Yuqoriga surish (Drag-Up)"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-0.5 h-3 bg-slate-800" />
                          <button
                            onClick={() => handleWidgetShift(idx, 'down')}
                            disabled={idx === pos.widgets.length - 1}
                            className={`p-1 rounded transition-colors text-slate-500 hover:text-slate-200 cursor-pointer ${idx === pos.widgets.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Pastga surish (Drag-Down)"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Widget body content based on type */}
                      <div className="flex-1">
                        
                        {/* Type A: Weekly Analytics D3-style Clean Native SVG Chart block */}
                        {wd.type === 'analytics' && (
                          <div className="py-4">
                            <p className="text-xs text-slate-400 mb-4 font-mono">Haftalik kassa harakati va kirim tahlillari (UZS):</p>
                            
                            {/* Premium SVG linear bar/area visual chart with custom dynamic glows */}
                            <div className="w-full h-44 bg-slate-950/60 rounded-2xl border border-slate-850 p-3 flex flex-col justify-between">
                              <div className="flex-1 flex items-end gap-2 px-2 relative">
                                {/* Grid reference lines */}
                                <div className="absolute left-0 w-full h-[33%] border-t border-slate-900" />
                                <div className="absolute left-0 w-full h-[66%] border-t border-slate-900" />
                                
                                {/* Monday mock */}
                                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                                  <div className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/40 rounded-t-lg transition-all" style={{ height: '40%' }}>
                                    <div className="w-full h-1 bg-indigo-400 rounded-full" />
                                  </div>
                                  <span className="text-[10px] font-mono font-medium text-slate-500">Du</span>
                                </div>

                                {/* Tuesday */}
                                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                                  <div className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/40 rounded-t-lg transition-all" style={{ height: '65%' }}>
                                    <div className="w-full h-1 bg-indigo-400 rounded-full" />
                                  </div>
                                  <span className="text-[10px] font-mono font-medium text-slate-500">Se</span>
                                </div>

                                {/* Wednesday */}
                                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                                  <div className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/40 rounded-t-lg transition-all" style={{ height: '50%' }}>
                                    <div className="w-full h-1 bg-indigo-400 rounded-full" />
                                  </div>
                                  <span className="text-[10px] font-mono font-medium text-slate-500">Ch</span>
                                </div>

                                {/* Thursday */}
                                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                                  <div className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/40 rounded-t-lg transition-all" style={{ height: '85%' }}>
                                    <div className="w-full h-1 bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full" />
                                  </div>
                                  <span className="text-[10px] font-mono font-medium text-slate-500">Pa</span>
                                </div>

                                {/* Friday */}
                                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                                  <div className="w-full bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/40 rounded-t-lg transition-all" style={{ height: '70%' }}>
                                    <div className="w-full h-1 bg-purple-400 rounded-full" />
                                  </div>
                                  <span className="text-[10px] font-mono font-medium text-slate-500">Ju</span>
                                </div>

                                {/* Saturday */}
                                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                                  <div className="w-full bg-purple-500/30 hover:bg-purple-500/50 border border-purple-500/50 rounded-t-lg transition-all animate-pulse" style={{ height: '100%' }}>
                                    <div className="w-full h-1.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full" />
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-slate-400">Sha</span>
                                </div>

                                {/* Sunday */}
                                <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end z-10">
                                  <div className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/40 rounded-t-lg transition-all" style={{ height: '90%' }}>
                                    <div className="w-full h-1 bg-emerald-400 rounded-full" />
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-slate-400">Yak</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Type B: Quick Statistical gauges */}
                        {wd.type === 'quick_stats' && (
                          <div className="grid grid-cols-2 gap-4 py-3">
                            <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">O‘rtacha chek</span>
                              <p className="text-base font-heading font-bold text-slate-200">
                                {formatUZS(pos.incomeHistory.length > 0 ? Math.round(pos.monthlyIncome() / pos.incomeHistory.length) : 45000)}
                              </p>
                            </div>
                            <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Do‘kon bandligi</span>
                              <p className="text-base font-heading font-bold text-slate-200">
                                {pos.tables.length > 0 ? Math.round((pos.activeTablesCount / pos.tables.length) * 100) : 0} %
                              </p>
                            </div>
                            <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Oylik tranzaksiyalar</span>
                              <p className="text-base font-heading font-bold text-slate-200">
                                {pos.incomeHistory.length} ta yopiq stol
                              </p>
                            </div>
                            <div className="bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-1">Xizmat darajasi</span>
                              <p className="text-base font-heading font-bold text-emerald-400">99.8% Alijon kassa</p>
                            </div>
                          </div>
                        )}

                        {/* Type C: Recent pay history timeline */}
                        {wd.type === 'recent_sales' && (
                          <div className="space-y-2.5 max-h-[160px] overflow-y-auto py-2 pr-1">
                            {pos.incomeHistory.length === 0 ? (
                              <p className="text-center text-xs text-slate-500 py-6">Hozircha hech qanday to‘lov tushumlari tahlili mavjud emas.</p>
                            ) : (
                              pos.incomeHistory.map((rec) => (
                                <div key={rec.id} className="flex justify-between items-center bg-slate-900/30 p-2.5 rounded-xl border border-slate-850">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-900/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                                      {rec.tableName.substring(0, 2)}
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-slate-200">{rec.tableName}</p>
                                      <p className="text-[10px] text-slate-500 font-mono">
                                        {new Date(rec.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                    +{formatUZS(rec.amount)}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Type D: System health / Cafe information status view */}
                        {wd.type === 'cafe_info' && (
                          <div className="space-y-2 text-xs text-slate-400 py-3 block font-mono">
                            <p className="flex justify-between border-b border-slate-850 pb-1.5">
                              <span>SaaS Litsenziya:</span>
                              <span className="text-indigo-400 font-bold">PRO Versiya</span>
                            </p>
                            <p className="flex justify-between border-b border-slate-850 pb-1.5">
                              <span>Lokal Bazasi:</span>
                              <span className="text-emerald-400 font-bold">Sinchronizatsiyada</span>
                            </p>
                            <p className="flex justify-between border-b border-slate-850 pb-1.5">
                              <span>Kafe ID:</span>
                              <span className="text-slate-300 select-all font-sans text-[10px] underline">{pos.currentCafe.id}</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Kassa holati:</span>
                              <span className="text-slate-300">Aktiv (Sotuvda)</span>
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER: Minimal branding credits and status indicators */}
      <footer className="glass-panel border-t border-slate-800/80 p-3 text-center text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between px-6 bg-slate-950/70 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>UZ POS PRO • Avtonom lokal server faol</span>
        </div>
        <p className="mt-1 sm:mt-0 text-[11px] text-slate-500">
          Ushbu kassa SaaS tizimi <span className="text-slate-400 font-bold underline">100% litsenziyalangan</span> va sotishga tayyor.
        </p>
      </footer>

      {/* -------------------- GENERAL SYSTEM MODALS & DIALOGS -------------------- */}
      
      {/* 1. Add Table Modal */}
      <AnimatePresence>
        {showAddTableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddTableModal(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold font-heading text-white">Yangi Stol Qo‘shish</h3>
                <button 
                  onClick={() => setShowAddTableModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddTableSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stol Nomi yoki Raqami</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-3.5 py-2.5 text-sm outline-none text-white transition-all"
                    placeholder="masalan, 6-Stol (VIP)"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTableModal(false)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-400 py-3 rounded-xl border border-slate-800 text-xs font-semibold transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-505 text-white py-3 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-colors"
                  >
                    Yaratish (Stol)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Rename Table Modal */}
      <AnimatePresence>
        {showRenameTableModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRenameTableModal(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-indigo-500" />
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold font-heading text-white">Stol Nomini O‘zgartirish</h3>
                <button 
                  onClick={() => setShowRenameTableModal(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRenameSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Yangi Stol nomi</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 rounded-xl px-3.5 py-2.5 text-sm outline-none text-white transition-all"
                    value={renamedTableName}
                    onChange={(e) => setRenamedTableName(e.target.value)}
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRenameTableModal(null)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-400 py-3 rounded-xl border border-slate-800 text-xs font-semibold transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/10 transition-colors"
                  >
                    O‘zgartirish (Saqlash)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Add / Edit Product Modal */}
      <AnimatePresence>
        {showAddProdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddProdModal(false);
                resetProductForm();
              }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500" />
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold font-heading text-white">
                  {editingProduct ? 'Mahsulotni Tahrirlash' : 'Yangi Mahsulot Qo‘shish'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddProdModal(false);
                    resetProductForm();
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mahsulot Nomi</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl px-3.5 py-2.5 text-sm outline-none text-white transition-all"
                    placeholder="masalan, Tandir Somsa"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                  />
                </div>

                {/* Category selectors */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.55">Toifasi (Kategoriya)</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                  >
                    <option value="Taom">Taom (Milliy/Evropa)</option>
                    <option value="Ichimlik">Ichimlik (Issiq/Sovuq)</option>
                    <option value="Shirinlik">Shirinlik (Piroglar/Mevalar)</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Narxi (UZS - so‘mda)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 rounded-xl pl-3.5 pr-14 py-2.5 text-sm outline-none text-white transition-all font-mono"
                      value={prodPrice || ''}
                      onChange={(e) => setProdPrice(parseInt(e.target.value) || 0)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">SO‘M</span>
                  </div>
                </div>

                {/* Switch availability checkbox */}
                <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Mavjudlik (Zaxirada bor)</p>
                    <p className="text-[10px] text-slate-500">Mijozlar buyurtma bera olishlari uchun belgilang.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prodAvailable}
                    onChange={(e) => setProdAvailable(e.target.checked)}
                    className="w-5 h-5 rounded accent-indigo-500 border-slate-800 cursor-pointer"
                  />
                </div>

                {/* Footer Modal Toggles */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProdModal(false);
                      resetProductForm();
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-400 py-3 rounded-xl border border-slate-800 text-xs font-semibold transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-colors"
                  >
                    {editingProduct ? 'Tahrirlab Saqlash' : 'Ro‘yxatga Qo‘shish'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Delete Confirmation modal */}
      <AnimatePresence>
        {deleteConfirmType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDeleteConfirmType(null);
                setDeleteConfirmId(null);
              }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              
              <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-900 flex items-center justify-center text-red-400 mx-auto mb-3">
                <Trash2 className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold font-heading text-white">Ishonchingiz Komilmi?</h3>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Ushbu amalni ortga qaytarib bo‘lmaydi. Tanlangan {deleteConfirmType === 'table' ? 'stolni' : 'mahsulotni'} butunlay o‘chirib tashlaysizmi?
              </p>

              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={() => {
                    setDeleteConfirmType(null);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-400 p-2.5 rounded-xl border border-slate-800 text-xs font-semibold transition-colors"
                >
                  Yo‘q, Bekor qilinsin
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white p-2.5 rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-red-600/10"
                >
                  Ha, O‘chirilsin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Checkout Receipt & Print Preview Modal (The premium physical receipt simulator!) */}
      <AnimatePresence>
        {simulatingReceiptTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSimulatingReceiptTable(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-sm rounded-[24px] z-10 overflow-hidden flex flex-col shadow-2xl relative bg-[#0a0e1a]"
            >
              {/* Receipts container banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-indigo-600 flex items-center justify-between text-white shrink-0">
                <span className="font-heading font-extrabold text-xs tracking-wider flex items-center gap-1.5 uppercase">
                  <Printer className="w-4 h-4 text-emerald-300" />
                  KASSA CHEK CHIQARISH
                </span>
                <button 
                  onClick={() => setSimulatingReceiptTable(null)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Thermal Tape Paper Wrapper */}
              <div className="p-5 overflow-y-auto bg-slate-900/40 border-b border-slate-800 flex justify-center">
                
                {/* Simulated receipt scroll paper strip */}
                <div className="receipt-tape w-full max-w-xs rounded-lg p-5 text-left flex flex-col justify-between select-none">
                  
                  {/* Store info header */}
                  <div className="text-center border-b border-dashed border-slate-350 pb-4 mb-4">
                    <h3 className="text-base font-bold text-slate-900 leading-tight uppercase tracking-wide">
                      {pos.currentCafe.cafeName}
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1 tracking-widest leading-normal">
                      Kassa terminali #01
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Manzil: Toshkent shahar, UZ
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 font-mono uppercase">
                      tel: +998 (90) 123-4567
                    </p>
                  </div>

                  {/* Bill header logs */}
                  <div className="space-y-1.5 text-[10px] text-slate-600 border-b border-dashed border-slate-350 pb-3 mb-3">
                    <div className="flex justify-between">
                      <span>STOL RAQAMI:</span>
                      <span className="font-bold text-slate-900">{simulatingReceiptTable.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CHIQARILGAN:</span>
                      <span className="font-mono">{currentTime.toLocaleDateString('uz-UZ')} {currentTime.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KASSIR:</span>
                      <span className="font-bold text-slate-900 uppercase">{pos.currentCafe.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SAAS ID:</span>
                      <span className="font-mono text-slate-500 text-[8px]">{simulatingReceiptTable.id.substring(0, 10)}</span>
                    </div>
                  </div>

                  {/* Order Dishes items list */}
                  <div className="space-y-2 text-[10px] text-slate-800 border-b border-dashed border-slate-350 pb-3 mb-3">
                    <div className="flex font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1 font-mono text-[9px] uppercase">
                      <span className="flex-1">NOMI</span>
                      <span className="w-12 text-center">SONI</span>
                      <span className="w-16 text-right">SUMMA</span>
                    </div>
                    {simulatingReceiptTable.orders.map((item) => (
                      <div key={item.productId} className="flex font-mono">
                        <span className="flex-1 truncate">{item.name}</span>
                        <span className="w-12 text-center">{item.quantity} ta</span>
                        <span className="w-16 text-right font-bold">{formatUZS(item.price * item.quantity).replace(" so‘m", "")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Receipt absolute sums */}
                  <div className="space-y-1.5 text-[10px] text-slate-700 leading-normal mb-5">
                    <div className="flex justify-between">
                      <span>MAXSULOTLAR JAMI:</span>
                      <span className="font-mono text-slate-900">{formatUZS(simulatingReceiptTable.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>XIZMAT HAQI (10%):</span>
                      <span className="font-mono text-slate-950">{formatUZS(Math.round(simulatingReceiptTable.totalPrice * 0.1))}</span>
                    </div>
                    <div className="h-0.5 bg-slate-900 my-1.5" />
                    <div className="flex justify-between items-baseline text-sm font-bold border-b border-double border-slate-900 pb-1 text-slate-950">
                      <span>JAMI TO‘LOV:</span>
                      <span className="font-mono text-lg font-extrabold">{formatUZS(Math.round(simulatingReceiptTable.totalPrice * 1.1))}</span>
                    </div>
                  </div>

                  {/* Decorative Barcode block */}
                  <div className="flex flex-col items-center justify-center pt-2 border-t border-dashed border-slate-350">
                    <div className="font-mono text-[16px] text-center tracking-[4px] font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded select-none uppercase">
                      ||||||II||I|I|II|||
                    </div>
                    <p className="text-[8px] text-slate-400 mt-2 tracking-wide font-mono uppercase">
                      * UZ-POS-PRO-CLOUD-SAAS *
                    </p>
                    <p className="text-[10px] text-slate-900 font-bold mt-2.5 text-center leading-normal">
                      Tashrifingiz uchun rahmat!<br/>
                      Yana kuting!
                    </p>
                  </div>

                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-4 bg-slate-950 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setSimulatingReceiptTable(null)}
                  className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-400 py-3 rounded-2xl border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Oynani yopish
                </button>
                <button
                  type="button"
                  onClick={confirmReceiptPayment}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-extrabold text-xs py-3 rounded-2xl text-center shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  TO‘LOV QILINDI (YOPISH)
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
