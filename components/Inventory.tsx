import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Tag, Package, Camera, X, ChevronDown, ChevronRight } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { Product, Category } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ConfirmModal } from './ui/ConfirmModal';

interface InventoryProps {
  setNavVisible?: (visible: boolean) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ setNavVisible }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  
  // Collapsible State
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Scroll tracking
  const lastScrollTop = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Form State
  // We use a separate state for price input to handle the ".000" visual logic easily
  const [priceInput, setPriceInput] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Product> & { images: string[] }>({
    name: '', categoryId: '', price: 0, brand: '', images: []
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!setNavVisible) return;

    const scrollTop = e.currentTarget.scrollTop;
    
    // Threshold to prevent jitter
    if (Math.abs(scrollTop - lastScrollTop.current) < 10) return;

    if (scrollTop > lastScrollTop.current && scrollTop > 50) {
      // Scrolling down
      setNavVisible(false);
    } else {
      // Scrolling up
      setNavVisible(true);
    }
    lastScrollTop.current = scrollTop;
  };

  const toggleCategory = (catId: string) => {
    const newSet = new Set(collapsedCategories);
    if (newSet.has(catId)) {
      newSet.delete(catId);
    } else {
      newSet.add(catId);
    }
    setCollapsedCategories(newSet);
  };

  const openAddModal = () => {
    setFormData({ name: '', categoryId: '', price: 0, brand: '', images: [] });
    setPriceInput('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    // Validate required fields (Brand is now optional)
    if (!formData.name || !formData.categoryId || !priceInput) {
      alert("Vui lòng điền Tên, Loại hàng và Giá bán.");
      return;
    }

    if (formData.images.length < 5) {
      alert(`Bạn cần tải lên ít nhất 5 hình ảnh để AI nhận diện tốt hơn. (Hiện tại: ${formData.images.length}/5)`);
      return;
    }
    
    // Convert short price input (e.g. 15) to full price (15000)
    const finalPrice = Number(priceInput) * 1000;

    StorageService.addProduct({
      name: formData.name!,
      categoryId: formData.categoryId!,
      price: finalPrice,
      brand: formData.brand || '', // Optional
      images: formData.images
    });
    
    setIsModalOpen(false);
    refreshData();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteProductId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteProductId) {
      StorageService.deleteProduct(deleteProductId);
      setDeleteProductId(null);
      refreshData();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (formData.images.length + files.length > 10) {
        alert("Chỉ được phép tải lên tối đa 10 ảnh.");
        return;
      }

      Array.from(files).forEach((file: File) => {
        if (file.size > 1024 * 1024) { 
          alert(`File ${file.name} quá lớn! Vui lòng chọn ảnh dưới 1MB.`);
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ 
            ...prev, 
            images: [...prev.images, reader.result as string] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedProducts = categories.map(cat => ({
    ...cat,
    items: filteredProducts.filter(p => p.categoryId === cat.id)
  })).filter(group => group.items.length > 0);

  return (
    <div className="h-full bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm border-b sticky top-0 z-10 transition-transform">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Kho Hàng</h1>
          <Button size="sm" onClick={openAddModal}>
            <Plus className="w-5 h-5 mr-1" /> Thêm mới
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc thương hiệu..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        {groupedProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Chưa có sản phẩm nào.</p>
          </div>
        ) : (
          groupedProducts.map(group => {
            const isCollapsed = collapsedCategories.has(group.id);
            return (
              <div key={group.id} className="animate-fade-in-up">
                <button 
                  onClick={() => toggleCategory(group.id)}
                  className="w-full flex items-center justify-between text-brand-700 font-bold uppercase text-sm tracking-wider mb-3 ml-1 hover:bg-brand-50 p-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2" /> {group.name} ({group.items.length})
                  </div>
                  {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {!isCollapsed && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden transition-all duration-300">
                    {group.items.map(product => (
                      <div key={product.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 flex items-center justify-center relative">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-300" />
                            )}
                            {product.images && product.images.length > 1 && (
                              <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[9px] px-1 rounded-tl-md">
                                +{product.images.length - 1}
                              </div>
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate pr-2">{product.name}</h3>
                            <p className="text-xs text-gray-500 font-medium uppercase truncate">{product.brand}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                          <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1.5 rounded-lg text-sm whitespace-nowrap">
                            {product.price.toLocaleString()}đ
                          </span>
                          <button onClick={() => handleDeleteClick(product.id)} className="text-gray-300 hover:text-red-500 p-1">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Thêm Sản Phẩm Mới</h2>
            <div className="space-y-5">
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Hình ảnh ({formData.images.length}/5) <span className="text-red-500">*</span>
                  </label>
                  {formData.images.length < 5 && (
                     <span className="text-xs text-red-500 font-medium">Cần thêm {5 - formData.images.length} ảnh</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-brand-600/80 text-white text-[8px] text-center py-0.5 font-bold uppercase">
                          Đại diện
                        </div>
                      )}
                    </div>
                  ))}

                  <label className="aspect-square rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 hover:border-brand-400 hover:bg-brand-50 transition-all flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-brand-600">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold uppercase">Thêm ảnh</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                
                <p className="text-xs text-gray-400 mt-1">
                  Chụp nhiều góc độ để AI nhận diện chính xác hơn.
                </p>
              </div>

              <Input 
                label="Tên sản phẩm *" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ví dụ: Coca Cola"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại hàng *</label>
                <div className="relative">
                  <select 
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none bg-white appearance-none"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">Chọn loại hàng...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Thương hiệu" 
                  value={formData.brand} 
                  onChange={e => setFormData({...formData, brand: e.target.value})}
                  placeholder="Không bắt buộc"
                />
                
                {/* Price Field with .000 suffix */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán *</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      inputMode="numeric"
                      className="w-full pl-4 pr-14 py-3 rounded-xl border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      placeholder="0"
                      value={priceInput}
                      onChange={e => setPriceInput(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium select-none pointer-events-none">
                      .000 đ
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <Button variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button 
                fullWidth 
                onClick={handleSave}
                disabled={formData.images.length < 5}
                className={formData.images.length < 5 ? "opacity-50 cursor-not-allowed" : ""}
              >
                {formData.images.length < 5 ? `Thêm ${5 - formData.images.length} ảnh` : 'Lưu sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!deleteProductId}
        title="Xóa sản phẩm?"
        message="Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa khỏi kho hàng vĩnh viễn."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteProductId(null)}
      />
    </div>
  );
};