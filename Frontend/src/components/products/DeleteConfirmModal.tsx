import React from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  productName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  productName,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            제품을 삭제하시겠습니까?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            <strong className="text-zinc-800 dark:text-zinc-200">&apos;{productName}&apos;</strong>이(가) 보유 제품 목록 및 주기 알림 대상에서 제거됩니다.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>삭제 중...</span>
              </>
            ) : (
              <span>삭제하기</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
