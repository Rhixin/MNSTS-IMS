"use client";

import { useState, useEffect } from "react";
import {
  ItemForm as ItemFormType,
  InventoryItemWithCategory,
  Category,
} from "@/types";
import ImageUpload from "./ImageUpload";
import CustomSelect from "../ui/CustomSelect";

interface ItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormType) => void;
  categories: Category[];
  editingItem?: InventoryItemWithCategory | null;
  loading?: boolean;
  onError?: (title: string, message: string) => void;
  onWarning?: (title: string, message: string) => void;
}

export default function ItemForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingItem,
  loading = false,
  onError,
  onWarning,
}: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormType>({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    quantity: 0,
    minStock: 5,
    maxStock: 100,
    unitPrice: 0,
    location: "",
    categoryId: "",
    imageUrls: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description || "",
        sku: editingItem.sku,
        barcode: editingItem.barcode || "",
        quantity: editingItem.quantity,
        minStock: editingItem.minStock,
        maxStock: editingItem.maxStock,
        unitPrice: parseFloat(editingItem.unitPrice.toString()),
        location: editingItem.location || "",
        categoryId: editingItem.categoryId,
        imageUrls: editingItem.imageUrls || [],
      });
    } else {
      // Reset form for new item
      setFormData({
        name: "",
        description: "",
        sku: "",
        barcode: "",
        quantity: 0,
        minStock: 5,
        maxStock: 100,
        unitPrice: 0,
        location: "",
        categoryId: "",
        imageUrls: [],
      });
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (formData.quantity < 0)
      newErrors.quantity = "Quantity cannot be negative";
    if (formData.unitPrice <= 0)
      newErrors.unitPrice = "Unit price must be greater than 0";
    if (formData.minStock < 0)
      newErrors.minStock = "Minimum stock cannot be negative";
    if (formData.maxStock <= formData.minStock) {
      newErrors.maxStock = "Maximum stock must be greater than minimum stock";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof ItemFormType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{margin: 0, padding: '1rem'}}
      onClick={onClose}
    >
      <div
        className="bg-accent-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-secondary-sage/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-forest">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary-cream rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-secondary-gray"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-forest">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors ${
                      errors.name ? "border-red-500" : "border-secondary-gray"
                    }`}
                    placeholder="Enter item name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    Category *
                  </label>
                  <CustomSelect
                    options={categories.map(category => ({
                      value: category.id,
                      label: category.name
                    }))}
                    value={formData.categoryId}
                    onChange={(value) => handleChange("categoryId", value)}
                    placeholder="Select a category"
                    error={!!errors.categoryId}
                    required
                  />
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-forest mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors resize-none"
                  placeholder="Enter item description"
                />
              </div>
            </div>

            {/* Identification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-forest">
                Identification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      handleChange("sku", e.target.value.toUpperCase())
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors ${
                      errors.sku ? "border-red-500" : "border-secondary-gray"
                    }`}
                    placeholder="e.g., LAB-001"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => handleChange("barcode", e.target.value)}
                    className="w-full px-4 py-3 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                    placeholder="Enter barcode"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-forest mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors"
                  placeholder="e.g., Warehouse A, Shelf B-3"
                />
              </div>
            </div>

            {/* Stock & Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-forest">
                Stock & Pricing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleChange("quantity", parseInt(e.target.value) || 0)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors ${
                      errors.quantity
                        ? "border-red-500"
                        : "border-secondary-gray"
                    }`}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    Min Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) =>
                      handleChange("minStock", parseInt(e.target.value) || 0)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors ${
                      errors.minStock
                        ? "border-red-500"
                        : "border-secondary-gray"
                    }`}
                  />
                  {errors.minStock && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.minStock}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    Max Stock *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxStock}
                    onChange={(e) =>
                      handleChange("maxStock", parseInt(e.target.value) || 1)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors ${
                      errors.maxStock
                        ? "border-red-500"
                        : "border-secondary-gray"
                    }`}
                  />
                  {errors.maxStock && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.maxStock}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-forest mb-2">
                    Unit Price (₱) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      handleChange("unitPrice", parseFloat(e.target.value) || 0)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent transition-colors ${
                      errors.unitPrice
                        ? "border-red-500"
                        : "border-secondary-gray"
                    }`}
                  />
                  {errors.unitPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.unitPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-forest">
                Images
              </h3>
              <ImageUpload
                imageUrls={formData.imageUrls}
                onImagesChange={(urls) => handleChange("imageUrls", urls)}
                maxImages={5}
                onError={onError}
                onWarning={onWarning}
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-secondary-sage/10 bg-primary-cream/30 flex-shrink-0">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-secondary-gray hover:text-primary-forest transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary-forest text-accent-white rounded-lg hover:bg-secondary-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
