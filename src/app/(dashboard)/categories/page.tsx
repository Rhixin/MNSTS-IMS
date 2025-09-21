"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HexColorPicker } from "react-colorful";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { CategoryGridSkeleton } from "@/components/ui/SkeletonLoader";

interface CategoryForm {
  name: string;
  description: string;
  color: string;
}

const QUICK_COLORS = [
  "#2D5F3F", // Primary Forest
  "#F4C430", // Primary Golden
  "#1B4B47", // Deep Teal
  "#87A96B", // Sage Green
  "#E74C3C", // Red
  "#3498DB", // Blue
  "#2ECC71", // Green
  "#F39C12", // Orange
  "#9B59B6", // Purple
  "#1ABC9C", // Turquoise
  "#34495E", // Dark Gray
  "#E67E22", // Carrot
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    description: "",
    color: QUICK_COLORS[0],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    categoryId: string;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: "",
    categoryName: "",
  });
  const { toasts, removeToast, showSuccess, showError, showWarning } =
    useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
          // Extract item counts from the API response
          const counts: Record<string, number> = {};
          result.data.forEach((category: any) => {
            counts[category.id] = category._count?.inventoryItems || 0;
          });
          setItemCounts(counts);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setFormLoading(true);
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategories();
        handleCloseForm();
        showSuccess(
          editingCategory ? "Category Updated!" : "Category Created!",
          editingCategory
            ? "Category has been updated successfully."
            : "New category has been created successfully."
        );
      } else {
        const result = await response.json();
        showError("Save Failed", result.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showError(
        "Error",
        "An unexpected error occurred while saving the category"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    const itemCount = itemCounts[categoryId] || 0;
    if (itemCount > 0) {
      showWarning(
        "Cannot Delete Category",
        `This category contains ${itemCount} items. Please reassign or delete those items first.`
      );
      return;
    }

    setDeleteModal({
      isOpen: true,
      categoryId,
      categoryName,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `/api/categories/${deleteModal.categoryId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchCategories();
        showSuccess(
          "Category Deleted!",
          "Category has been deleted successfully."
        );
      } else {
        const result = await response.json();
        showError("Delete Failed", result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      showError(
        "Error",
        "An unexpected error occurred while deleting the category"
      );
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: QUICK_COLORS[0] });
  };

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-primary-forest">
                Category Management
              </h1>
              <p className="text-secondary-gray">
                Organize your inventory with categories
              </p>
            </div>
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg flex items-center space-x-2 cursor-not-allowed"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>
          <CategoryGridSkeleton count={8} />
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-primary-forest">
              Category Management
            </h1>
            <p className="text-secondary-gray">
              Organize your inventory with categories
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-forest text-accent-white px-6 py-3 rounded-lg hover:bg-secondary-teal transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="w-16 h-16 text-secondary-gray/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-gray mb-2">
              No categories yet
            </h3>
            <p className="text-secondary-gray mb-4">
              Create your first category to organize inventory items
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary-forest text-accent-white px-6 py-2 rounded-lg hover:bg-secondary-teal transition-colors"
            >
              Create First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => {
              const itemCount = itemCounts[category.id] || 0;
              const hasItems = itemCount > 0;

              return (
                <div
                  key={category.id}
                  className="bg-accent-white rounded-xl shadow-sm border border-secondary-sage/10 overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer"
                >
                  {/* Header with gradient background */}
                  <div
                    className="relative p-6 pb-4"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: category.color }}
                      >
                        <TagIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(category);
                          }}
                          className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-md"
                          title="Edit category"
                        >
                          <PencilIcon className="w-4 h-4 text-primary-forest" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(category.id, category.name);
                          }}
                          className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-md"
                          title="Delete category"
                        >
                          <TrashIcon className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-2">
                    <h3 className="font-bold text-lg text-primary-forest mb-2 group-hover:text-secondary-teal transition-colors">
                      {category.name}
                    </h3>

                    {category.description ? (
                      <p className="text-sm text-secondary-gray mb-4 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>
                    ) : (
                      <p className="text-sm text-secondary-gray/60 mb-4 italic">
                        No description provided
                      </p>
                    )}

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary-golden"></div>
                          <span className="text-sm font-medium text-secondary-gray">Total Items</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${
                            hasItems ? 'text-primary-forest' : 'text-secondary-gray/60'
                          }`}>
                            {itemCount}
                          </span>
                          {hasItems && (
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          )}
                        </div>
                      </div>

                      {/* Progress indicator */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: category.color,
                            width: hasItems ? `${Math.min(itemCount * 10, 100)}%` : '0%'
                          }}
                        ></div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-xs text-secondary-gray font-mono">
                            {category.color.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {hasItems ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              Empty
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Category Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            style={{margin: 0, padding: '1rem'}}
            onClick={handleCloseForm}
          >
            <div
              className="bg-accent-white rounded-xl shadow-xl max-w-lg w-full max-h-[70vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div className="p-6 border-b border-secondary-sage/10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-primary-forest">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-secondary-gray hover:text-primary-forest transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1">

                <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-primary-forest mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-forest mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
                      placeholder="Brief description of this category"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-forest mb-4">
                      Category Color
                    </label>

                    <div className="space-y-6">
                      {/* Color Preview */}
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-secondary-gray">
                        <div
                          className="w-16 h-16 rounded-xl border-2 border-white shadow-lg"
                          style={{ backgroundColor: formData.color }}
                        />
                        <div>
                          <p className="font-semibold text-primary-forest text-lg">
                            Selected Color
                          </p>
                          <p className="text-sm text-secondary-gray font-mono">
                            {formData.color.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Color Wheel */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="color-picker-container">
                          <HexColorPicker
                            color={formData.color}
                            onChange={(color) =>
                              setFormData((prev) => ({ ...prev, color }))
                            }
                            style={{ width: "200px", height: "200px" }}
                          />
                        </div>

                        {/* Hex Input */}
                        <div className="w-full max-w-xs">
                          <input
                            type="text"
                            value={formData.color}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  color: value,
                                }));
                              }
                            }}
                            placeholder="#FF5733"
                            className="w-full px-3 py-2 border border-secondary-gray rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent font-mono text-sm text-center"
                            maxLength={7}
                          />
                        </div>
                      </div>

                      {/* Quick Color Presets */}
                      <div>
                        <label className="block text-xs font-medium text-secondary-gray mb-3">
                          Quick Presets
                        </label>
                        <div className="grid grid-cols-6 gap-3">
                          {QUICK_COLORS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, color }))
                              }
                              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 shadow-sm ${
                                formData.color.toUpperCase() ===
                                color.toUpperCase()
                                  ? "border-primary-forest ring-2 ring-primary-forest ring-opacity-30 scale-110"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              {/* Fixed Footer */}
              <div className="p-6 border-t border-secondary-sage/10 bg-primary-cream/30 flex-shrink-0">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 py-2 px-4 border border-secondary-gray rounded-lg text-secondary-gray hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="category-form"
                    disabled={formLoading}
                    className="flex-1 py-2 px-4 bg-primary-forest text-accent-white rounded-lg hover:bg-secondary-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading
                      ? "Saving..."
                      : editingCategory
                      ? "Update"
                      : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({ isOpen: false, categoryId: "", categoryName: "" })
          }
          onConfirm={handleDeleteConfirm}
          title="Delete Category"
          message={`Are you sure you want to delete "${deleteModal.categoryName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </>
  );
}
