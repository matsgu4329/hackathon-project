'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ProductResponse,
  ProductRequest,
  UsageStep,
} from '../../types/product';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../lib/api';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductModal } from '../../components/products/ProductModal';
import { DeleteConfirmModal } from '../../components/products/DeleteConfirmModal';
import {
  Plus,
  Moon,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

type FilterType = 'ALL' | 'NIGHT_ONLY' | UsageStep;

const FILTER_TABS: { id: FilterType; label: string; emoji?: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'NIGHT_ONLY', label: '🌙 밤 전용' },
  { id: 'CLEANSING', label: '클렌징', emoji: '🧼' },
  { id: 'TONER', label: '토너/스킨', emoji: '🧴' },
  { id: 'ESSENCE_SERUM', label: '에센스/세럼', emoji: '🧪' },
  { id: 'CREAM', label: '크림/보습', emoji: '💧' },
  { id: 'SUNCARE', label: '선케어', emoji: '☀️' },
  { id: 'MASK_PACK', label: '팩/마스크', emoji: '🎭' },
  { id: 'OTHER', label: '기타', emoji: '✨' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    id: number;
    name: string;
    loading: boolean;
  }>({
    isOpen: false,
    id: 0,
    name: '',
    loading: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load products on mount
  const loadProductList = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);
    } catch (err) {
      console.warn('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductList();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product: ProductResponse) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveProduct = async (data: ProductRequest) => {
    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, data);
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? updated : p))
      );
      showToast(`'${updated.name}' 제품이 수정되었습니다.`);
    } else {
      const created = await createProduct(data);
      setProducts((prev) => [created, ...prev]);
      showToast(`'${created.name}' 제품이 새로 등록되었습니다.`);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (id: number, name: string) => {
    setDeleteState({
      isOpen: true,
      id,
      name,
      loading: false,
    });
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      setDeleteState((prev) => ({ ...prev, loading: true }));
      await deleteProduct(deleteState.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteState.id));
      showToast(`'${deleteState.name}' 제품이 삭제되었습니다.`);
      setDeleteState({ isOpen: false, id: 0, name: '', loading: false });
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('삭제 중 오류가 발생했습니다.');
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Quick mark used today
  const handleMarkUsedToday = async (product: ProductResponse) => {
    const today = new Date().toISOString().split('T')[0];
    const payload: ProductRequest = {
      name: product.name,
      usageStep: product.usageStep,
      ingredientTags: product.ingredientTags,
      cycleType: product.cycleType,
      cycleIntervalDays: product.cycleIntervalDays,
      cycleWeekdays: product.cycleWeekdays,
      lastUsedAt: today,
    };

    try {
      const updated = await updateProduct(product.id, payload);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showToast(`'${product.name}' 오늘 사용 기록 완료!`);
    } catch (err) {
      console.error('Failed to update last used date:', err);
    }
  };

  // Filter & Search logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Step / Night Only Filter
      if (activeFilter === 'NIGHT_ONLY') {
        if (!p.nightOnly) return false;
      } else if (activeFilter !== 'ALL') {
        if (p.usageStep !== activeFilter) return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesIngredient = (p.ingredientTags || []).some((t) =>
          t.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesIngredient) return false;
      }

      return true;
    });
  }, [products, activeFilter, searchQuery]);

  // Summary statistics
  const totalCount = products.length;
  const nightOnlyCount = products.filter((p) => p.nightOnly).length;
  const todayCareCount = products.filter((p) => {
    if (!p.nextUseDate) return true;
    const today = new Date().toISOString().split('T')[0];
    return p.nextUseDate <= today;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/15 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform"
            >
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
                  SkinClock
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">보유 제품 관리</span>
              </div>
              <h1 className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                나의 스킨케어 화장품 ({totalCount}개)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
            >
              대시보드
            </Link>
            <Link
              href="/onboarding"
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors hidden sm:inline-block"
            >
              온보딩 설정
            </Link>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>새 제품 추가</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:py-8 flex-1 space-y-6">
        {/* Statistics Hero Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">등록된 총 화장품</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{totalCount}개</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">오늘 사용 예정</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{todayCareCount}개</p>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">밤 전용 (레티놀 등)</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{nightOnlyCount}개</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제품명 또는 성분 검색 (예: 레티놀, 시카, 크림)"
              className="w-full h-11 pl-10 pr-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? tab.id === 'NIGHT_ONLY'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.emoji && <span className="mr-1">{tab.emoji}</span>}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid / List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500">화장품 목록을 불러오는 중입니다...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onMarkUsedToday={handleMarkUsedToday}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-dashed border-zinc-300 dark:border-zinc-800 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {searchQuery || activeFilter !== 'ALL'
                  ? '조건에 맞는 화장품이 없습니다.'
                  : '등록된 화장품이 없습니다.'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {searchQuery || activeFilter !== 'ALL'
                  ? '검색어 또는 필터를 변경해 보세요.'
                  : '매일 쓰는 기초 화장품과 레티놀/팩 등 주기성 제품을 등록하면 맞춤 루틴과 알림을 받아보실 수 있습니다.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>첫 화장품 등록하기</span>
            </button>
          </div>
        )}
      </main>

      {/* Product Modal (Create / Edit) */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        editProduct={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteState.isOpen}
        productName={deleteState.name}
        loading={deleteState.loading}
        onClose={() => setDeleteState({ isOpen: false, id: 0, name: '', loading: false })}
        onConfirm={handleConfirmDelete}
      />

      {/* Footer Disclaimer (FE PRD Section 6.3) */}
      <footer className="max-w-6xl mx-auto w-full px-4 py-4 text-center border-t border-zinc-200/60 dark:border-zinc-800">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
          ⚠️ SkinClock의 안내는 일반적인 생활 습관 관리 참고용이며, 의학적 진단이나 처방을 대신하지 않습니다. 피부 이상 발생 시 전문의와 상담하세요.
        </p>
      </footer>
    </div>
  );
}
