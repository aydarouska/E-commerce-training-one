import { useCallback, useEffect, useState } from "react";
import * as productsApi from "../api/products";
import { getErrorMessage } from "../api/errors";
import { toastError, toastSuccess, confirmDialog } from "../utils/toast";
import { resolveProductImage } from "../utils/image";
import useI18n from "../hooks/useI18n";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";

// القيم الفاضيه لفورم المنتج الجديد
const EMPTY = {
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  price: "",
  category: "",
  categoryEn: "",
  brand: "",
  countInStock: "",
  isFeatured: false,
  image: "",
};

// صفحه اداره المنتجات: عرض - بحث - اضافه - تعديل - حذف
export default function AdminProducts() {
  const { t, tr, price } = useI18n();
  // بيانات الجدول
  const [data, setData] = useState({ products: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  // النافذه: null = مقفوله - "new" = منتج جديد - object = تعديل منتج
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  // ملف الصوره الاساسيه و الصور الاضافيه (لو اختارهم الادمن)
  const [imageFile, setImageFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  // جلب المنتجات (صفحه + بحث)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getProducts({ page, limit: 15, search, sort: "newest" });
      setData(res.data.data);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  // فتح النافذه لمنتج جديد
  const openNew = () => {
    setForm(EMPTY);
    setImageFile(null);
    setExtraFiles([]);
    setEditing("new");
  };

  // فتح النافذه لتعديل منتج (نملى الفورم ببياناته)
  const openEdit = (p) => {
    setForm({
      name: p.name,
      nameEn: p.nameEn || "",
      description: p.description,
      descriptionEn: p.descriptionEn || "",
      price: p.price,
      category: p.category,
      categoryEn: p.categoryEn || "",
      brand: p.brand || "",
      countInStock: p.countInStock,
      isFeatured: p.isFeatured,
      image: p.image,
    });
    setImageFile(null);
    setExtraFiles([]);
    setEditing(p);
  };

  // تحديث حقل فى الفورم (checkbox ليه قيمه checked بدل value)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // حفظ المنتج (اضافه او تعديل)
  const handleSave = async (e) => {
    e.preventDefault();
    // المنتج الجديد لازم يكون ليه صوره (ملف او رابط)
    if (editing === "new" && !imageFile && !form.image.trim()) return toastError(t("admin.imageRequired"));
    setSaving(true);
    try {
      // FormData عشان نقدر نبعت الصور مع باقى البيانات
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        // الصوره بنبعتها كرابط بس لو مفيش ملف مرفوع
        if (key === "image" && (imageFile || !value)) return;
        fd.append(key, value);
      });
      if (imageFile) fd.append("image", imageFile);
      extraFiles.forEach((f) => fd.append("images", f));

      if (editing === "new") await productsApi.createProduct(fd);
      else await productsApi.updateProduct(editing.id, fd);

      toastSuccess(t("admin.saved"));
      setEditing(null);
      load();
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // حذف منتج بعد التأكيد
  const handleDelete = async (p) => {
    const ok = await confirmDialog({
      title: t("admin.deleteProductConfirm", { name: tr(p, "name") }),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      danger: true,
    });
    if (!ok) return;
    try {
      await productsApi.deleteProduct(p.id);
      toastSuccess(t("admin.deleted"));
      load();
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h4 fw-bold mb-0">{t("admin.products")}</h1>
        <div className="d-flex gap-2">
          {/* البحث فى المنتجات */}
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder={t("nav.searchPlaceholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button type="button" className="btn btn-primary btn-sm text-nowrap" onClick={openNew}>
            <Icon name="plus" size={16} /> {t("admin.addProduct")}
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t("admin.product")}</th>
                  <th>{t("admin.category")}</th>
                  <th>{t("admin.price")}</th>
                  <th>{t("admin.stock")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img src={resolveProductImage(p.image)} alt="" className="rounded tw:h-10 tw:w-10 tw:object-cover" />
                        <div>
                          <div className="fw-semibold">{tr(p, "name")}</div>
                          {p.isFeatured && <span className="badge bg-warning text-dark">{t("product.featured")}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{tr(p, "category")}</td>
                    <td>{price(p.price, { currency: "EGP" })}</td>
                    {/* المخزن بيتلون احمر لو اقل من 5 */}
                    <td className={p.countInStock < 5 ? "text-danger fw-bold" : ""}>{p.countInStock}</td>
                    <td className="text-nowrap text-end">
                      <button type="button" className="btn btn-sm btn-light" onClick={() => openEdit(p)} aria-label={t("common.edit")}>
                        <Icon name="edit" size={16} />
                      </button>{" "}
                      <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(p)} aria-label={t("common.delete")}>
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {data.products.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-secondary py-4">{t("home.noResults")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />

      {/* نافذه اضافه / تعديل منتج */}
      <Modal
        show={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? t("admin.addProduct") : t("admin.editProduct")}
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={() => setEditing(null)}>{t("common.cancel")}</button>
            <button type="submit" form="product-form" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner-border spinner-border-sm" /> : t("common.save")}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSave} className="row g-3">
          {/* الاسم عربى (اجبارى) و انجليزى (اختيارى) */}
          <div className="col-md-6">
            <label className="form-label">{t("admin.nameAr")} *</label>
            <input name="name" required className="form-control" value={form.name} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t("admin.nameEn")}</label>
            <input name="nameEn" dir="ltr" className="form-control" value={form.nameEn} onChange={handleChange} />
          </div>
          {/* الوصف عربى و انجليزى */}
          <div className="col-md-6">
            <label className="form-label">{t("admin.descAr")} *</label>
            <textarea name="description" required rows={3} className="form-control" value={form.description} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t("admin.descEn")}</label>
            <textarea name="descriptionEn" dir="ltr" rows={3} className="form-control" value={form.descriptionEn} onChange={handleChange} />
          </div>
          {/* التصنيف عربى و انجليزى */}
          <div className="col-md-6">
            <label className="form-label">{t("admin.categoryAr")} *</label>
            <input name="category" required className="form-control" value={form.category} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t("admin.categoryEn")}</label>
            <input name="categoryEn" dir="ltr" className="form-control" value={form.categoryEn} onChange={handleChange} />
          </div>
          {/* السعر بالجنيه - المخزن - البراند */}
          <div className="col-md-4">
            <label className="form-label">{t("admin.priceEgp")} *</label>
            <input name="price" type="number" min="0" step="0.01" required className="form-control" value={form.price} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">{t("admin.stock")} *</label>
            <input name="countInStock" type="number" min="0" step="1" required className="form-control" value={form.countInStock} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">{t("product.brand")}</label>
            <input name="brand" className="form-control" value={form.brand} onChange={handleChange} />
          </div>
          {/* الصوره الاساسيه: يا اما ملف من الجهاز يا اما رابط */}
          <div className="col-md-6">
            <label className="form-label">{t("admin.mainImage")}</label>
            <input type="file" accept="image/*" className="form-control" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <input name="image" dir="ltr" placeholder={t("admin.orImageUrl")} className="form-control mt-2" value={form.image} onChange={handleChange} disabled={Boolean(imageFile)} />
          </div>
          {/* صور اضافيه (لحد 5) */}
          <div className="col-md-6">
            <label className="form-label">{t("admin.extraImages")}</label>
            <input type="file" accept="image/*" multiple className="form-control" onChange={(e) => setExtraFiles(Array.from(e.target.files || []).slice(0, 5))} />
            {editing && editing !== "new" && <div className="form-text">{t("admin.extraImagesHint")}</div>}
          </div>
          {/* معاينه الصوره الحاليه */}
          {(imageFile || form.image) && (
            <div className="col-12">
              <img src={imageFile ? URL.createObjectURL(imageFile) : resolveProductImage(form.image)} alt="" className="rounded border tw:h-24 tw:w-24 tw:object-cover" />
            </div>
          )}
          <div className="col-12">
            <div className="form-check">
              <input id="isFeatured" name="isFeatured" type="checkbox" className="form-check-input" checked={form.isFeatured} onChange={handleChange} />
              <label htmlFor="isFeatured" className="form-check-label">{t("admin.featuredLabel")}</label>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
