import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storageService';
import { Category } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { FolderPlus, Trash, Layers, GripVertical } from 'lucide-react';
import { ConfirmModal } from './ui/ConfirmModal';

interface SettingsProps {
  setNavVisible?: (visible: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({ setNavVisible }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  
  // Drag and Drop refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  const lastScrollTop = useRef(0);

  useEffect(() => {
    setCategories(StorageService.getCategories());
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!setNavVisible) return;
    const scrollTop = e.currentTarget.scrollTop;
    if (Math.abs(scrollTop - lastScrollTop.current) < 10) return;
    if (scrollTop > lastScrollTop.current && scrollTop > 50) {
      setNavVisible(false);
    } else {
      setNavVisible(true);
    }
    lastScrollTop.current = scrollTop;
  };

  const handleAdd = () => {
    if (!newCatName.trim()) return;
    const newCat = StorageService.addCategory(newCatName);
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
  };

  const handleDeleteClick = (id: string) => {
    setDeleteCategoryId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteCategoryId) {
      StorageService.deleteCategory(deleteCategoryId);
      setCategories(prev => prev.filter(c => c.id !== deleteCategoryId));
      setDeleteCategoryId(null);
    }
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    // Effect styling for drag ghost
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
    e.preventDefault();
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Reset opacity
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
    }

    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const _categories = [...categories];
      const draggedItemContent = _categories.splice(dragItem.current, 1)[0];
      _categories.splice(dragOverItem.current, 0, draggedItemContent);

      setCategories(_categories);
      StorageService.saveCategories(_categories);
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col pb-20">
      <div className="bg-white p-6 shadow-sm border-b">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Loại hàng</h1>
        <p className="text-gray-500 text-sm">Kéo thả để sắp xếp thứ tự hiển thị hoặc xóa loại hàng.</p>
      </div>

      <div 
        className="p-4 flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Add New */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
            <FolderPlus className="w-4 h-4 mr-2 text-brand-600" /> Tạo loại mới
          </h2>
          <div className="flex gap-2">
            <Input 
              placeholder="Tên loại hàng (VD: Bánh kẹo)" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="py-2"
            />
            <Button onClick={handleAdd} disabled={!newCatName.trim()}>Thêm</Button>
          </div>
        </div>

        {/* List */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 ml-1 flex items-center">
          <Layers className="w-4 h-4 mr-2" /> Danh sách & Sắp xếp
        </h2>
        <div className="space-y-2">
          {categories.map((cat, index) => (
            <div 
              key={cat.id} 
              className="bg-white p-3 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow group select-none cursor-move active:cursor-grabbing"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-brand-600 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-800">{cat.name}</span>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent drag start when clicking delete
                  handleDeleteClick(cat.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                onMouseDown={(e) => e.stopPropagation()} // Prevent drag initiation on button
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteCategoryId}
        title="Xóa loại hàng?"
        message="Xóa loại hàng này sẽ không xóa sản phẩm, nhưng các sản phẩm thuộc loại này sẽ mất phân loại. Bạn có chắc chắn?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCategoryId(null)}
      />
    </div>
  );
};