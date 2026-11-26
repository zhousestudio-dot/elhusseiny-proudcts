-- ============================================================================
-- Elhusseiny Products (منتجات الحسيني) — Initial Categories & Products Seed
-- ============================================================================
-- Run this in Supabase Dashboard -> SQL Editor AFTER running schema.sql.

insert into public.categories (name, slug, description, sort_order, is_active)
values
  ('منتجات أساسية', 'basic-products', 'طحينة سمسم خام وزبدة فول سوداني طبيعي وبالشوكولاتة ١٠٠٪', 1, true),
  ('عسل ومنتجات النحل', 'honey-products', 'عسل موالح، برسيم، حبة البركة، عسل بالمكسرات، وعسل أسود', 2, true),
  ('الحلاوة وزيت الزيتون', 'halawa-olive-oil', 'حلاوة طحينية سادة وبالشوكولاتة وزيت زيتون بكر ممتاز', 3, true),
  ('عروض وخلطات خاصة', 'special-offers', 'المختوم الفلسطيني وباقات التوفير الحصرية من الحسيني', 4, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

with cats as (
  select id, slug from public.categories
)
insert into public.products (category_id, name, slug, description, price, image_url, stock, is_active)
values
  ((select id from cats where slug = 'basic-products'), 'طحينة سمسم خام ١٠٠٪ (١ كيلو)', 'raw-sesame-tahina-1kg', 'طحينة سمسم صافي ١٠٠٪ بدون أي إضافات أو مواد حافظة.', 150, '/images/products/product-12.jpg', 30, true),
  ((select id from cats where slug = 'halawa-olive-oil'), 'زيت زيتون بكر ممتاز (١ كيلو)', 'extra-virgin-olive-oil-1kg', 'زيت زيتون طبيعي بكر ممتاز بحموضة أقل من 0.8%.', 250, '/images/products/product-18.jpg', 20, true),
  ((select id from cats where slug = 'honey-products'), 'عسل بالمكسرات الفاخر (١ كيلو)', 'honey-with-nuts-1kg', 'عسل نحل طبيعي مع تشكيلة مكسرات فاخرة (لوز، عين جمل، كاجو).', 350, '/images/products/product-02.jpg', 15, true),
  ((select id from cats where slug = 'special-offers'), 'المختوم الفلسطيني (١ كيلو)', 'palestinian-makhtoum-1kg', 'خلطة طبيعية لزيادة الوزن والطاقة: تمر، عسل نحل، طحينة، سمسم، زيت زيتون، وخل طبيعي.', 500, '/images/products/makhtoum-solo.jpg', 15, true),
  ((select id from cats where slug = 'basic-products'), 'زبدة الفول السوداني الطبيعي (١ كيلو)', 'natural-peanut-butter-1kg', 'زبدة فول سوداني طبيعية ١٠٠٪ بدون زيوت مهدرجة.', 160, '/images/products/peanut-butter-solo.jpg', 25, true),
  ((select id from cats where slug = 'basic-products'), 'زبدة الفول السوداني بالشوكولاتة (١ كيلو)', 'chocolate-peanut-butter-1kg', 'زبدة فول سوداني طبيعية ممزوجة بالشوكولاتة الغنية.', 200, '/images/products/peanut-butter-solo.jpg', 20, true),
  ((select id from cats where slug = 'honey-products'), 'عسل حبة البركة الطبيعي (١ كيلو)', 'black-seed-honey-1kg', 'عسل حبة البركة طبيعي ١٠٠٪ غني بالفوائد للمناعة والصحة.', 240, '/images/products/black-seed-honey-solo.jpg', 22, true),
  ((select id from cats where slug = 'honey-products'), 'عسل نوارة البرسيم (١ كيلو)', 'clover-honey-1kg', 'عسل نحل نوارة البرسيم الأصلي بطعم نقي وجودة مضمونة.', 200, '/images/products/product-21.jpg', 25, true),
  ((select id from cats where slug = 'honey-products'), 'عسل الموالح الطبيعي (١ كيلو)', 'citrus-honey-1kg', 'عسل نحل موالح طبيعي ١٠٠٪ برائحة زهر البرتقال المميزة.', 240, '/images/products/product-04.jpg', 18, true),
  ((select id from cats where slug = 'honey-products'), 'عسل أسود طبيعي (١ كيلو)', 'black-honey-1kg', 'عسل أسود قصب طبيعي فاخر بدون إضافات.', 60, '/images/products/product-01.jpg', 35, true),
  ((select id from cats where slug = 'halawa-olive-oil'), 'حلاوة طحينية سادة (١ كيلو)', 'plain-halawa-1kg', 'حلاوة طحينية تقليدية من السمسم الصافي.', 130, '/images/products/halawa-plain-solo.jpg', 25, true),
  ((select id from cats where slug = 'halawa-olive-oil'), 'حلاوة طحينية بالشوكولاتة (١ كيلو)', 'chocolate-halawa-1kg', 'حلاوة طحينية بالشوكولاتة الفاخرة.', 140, '/images/products/halawa-plain-solo.jpg', 20, true),
  ((select id from cats where slug = 'special-offers'), 'عرض: ½ عسل بالمكسرات + ½ عسل حبة البركة', 'offer-nuts-blackseed-honey', 'عرض مميز لفترة محدودة: نصف كيلو عسل بالمكسرات + نصف كيلو عسل حبة البركة.', 230, '/images/products/product-15.jpg', 15, true),
  ((select id from cats where slug = 'special-offers'), 'عرض: ½ عسل برسيم + ½ عسل حبة البركة', 'offer-clover-blackseed-honey', 'عرض خاص: نصف كيلو عسل برسيم + نصف كيلو عسل حبة البركة.', 170, '/images/products/product-16.jpg', 20, true),
  ((select id from cats where slug = 'special-offers'), 'عرض: كيلو وربع طحينة سمسم خام', 'offer-tahina-1250g', 'عرض لفترة محدودة: كيلو وربع طحينة سمسم خام بقوام ناعم وطعم أصلي.', 160, '/images/products/product-19.jpg', 20, true),
  ((select id from cats where slug = 'special-offers'), 'عرض: ½ مختوم فلسطيني + ½ عسل برسيم', 'offer-makhtoum-clover', 'عرض خاص: نصف كيلو مختوم فلسطيني + نصف كيلو عسل نحل نورة البرسيم.', 250, '/images/products/product-22.jpg', 12, true),
  ((select id from cats where slug = 'special-offers'), 'عرض التوفير: ¼ طحينة + ¼ زبدة فول + ¼ زيت زيتون', 'offer-saving-trio', 'ربع كيلو طحينة + ربع كيلو زبدة فول سوداني + ربع كيلو زيت زيتون بكر ممتاز.', 120, '/images/products/product-31.jpg', 20, true)
on conflict (slug) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  stock = excluded.stock,
  is_active = excluded.is_active;
