export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
  category_slug: string;
  is_active: boolean;
}

// Real categories from Elhusseiny Products menu
export const FEATURED_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "منتجات أساسية",
    slug: "basic-products",
    description: "طحينة سمسم خام وزبدة فول سوداني طبيعي وبالشوكولاتة ١٠٠٪",
  },
  {
    id: "cat-2",
    name: "عسل ومنتجات النحل",
    slug: "honey-products",
    description: "عسل موالح، برسيم، حبة البركة، عسل بالمكسرات، وعسل أسود",
  },
  {
    id: "cat-3",
    name: "الحلاوة وزيت الزيتون",
    slug: "halawa-olive-oil",
    description: "حلاوة طحينية سادة وبالشوكولاتة وزيت زيتون بكر ممتاز",
  },
  {
    id: "cat-4",
    name: "عروض وخلطات خاصة",
    slug: "special-offers",
    description: "المختوم الفلسطيني وباقات التوفير الحصرية من الحسيني",
  },
];

// Real products & prices (in EGP) from Elhusseiny Products media & menu
export const FEATURED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "طحينة سمسم خام ١٠٠٪ (١ كيلو)",
    slug: "raw-sesame-tahina-1kg",
    description:
      "طحينة سمسم صافي ١٠٠٪ بدون أي إضافات أو مواد حافظة. متوفر أيضاً نصف كيلو (٧٥ ج) وربع كيلو (٤٠ ج).",
    price: 150,
    image_url: "/images/products/product-12.jpg",
    stock: 30,
    category: "منتجات أساسية",
    category_slug: "basic-products",
    is_active: true,
  },
  {
    id: "prod-2",
    name: "زيت زيتون بكر ممتاز (١ كيلو)",
    slug: "extra-virgin-olive-oil-1kg",
    description:
      "زيت زيتون طبيعي بكر ممتاز بحموضة أقل من 0.8%. متوفر أيضاً نصف كيلو (١٢٥ ج) وربع كيلو (٧٥ ج).",
    price: 250,
    image_url: "/images/products/product-18.jpg",
    stock: 20,
    category: "الحلاوة وزيت الزيتون",
    category_slug: "halawa-olive-oil",
    is_active: true,
  },
  {
    id: "prod-3",
    name: "عسل بالمكسرات الفاخر (١ كيلو)",
    slug: "honey-with-nuts-1kg",
    description:
      "عسل نحل طبيعي مع تشكيلة مكسرات فاخرة (لوز، عين جمل، كاجو). متوفر أيضاً ٤٠٠ جرام (١٥٠ ج).",
    price: 350,
    image_url: "/images/products/product-02.jpg",
    stock: 15,
    category: "عسل ومنتجات النحل",
    category_slug: "honey-products",
    is_active: true,
  },
  {
    id: "prod-4",
    name: "المختوم الفلسطيني (١ كيلو)",
    slug: "palestinian-makhtoum-1kg",
    description:
      "خلطة طبيعية لزيادة الوزن والطاقة: تمر، عسل نحل، طحينة، سمسم، زيت زيتون، وخل طبيعي. متوفر نصف كيلو (٢٥٠ ج) وربع كيلو (١٢٥ ج).",
    price: 500,
    image_url: "/images/products/product-22.jpg",
    stock: 15,
    category: "عروض وخلطات خاصة",
    category_slug: "special-offers",
    is_active: true,
  },
  {
    id: "prod-5",
    name: "زبدة الفول السوداني الطبيعي (١ كيلو)",
    slug: "natural-peanut-butter-1kg",
    description:
      "زبدة فول سوداني طبيعية ١٠٠٪ بدون زيوت مهدرجة. متوفر نصف كيلو (٨٠ ج) وربع كيلو (٤٠ ج).",
    price: 160,
    image_url: "/images/products/product-03.jpg",
    stock: 25,
    category: "منتجات أساسية",
    category_slug: "basic-products",
    is_active: true,
  },
  {
    id: "prod-6",
    name: "زبدة الفول السوداني بالشوكولاتة (١ كيلو)",
    slug: "chocolate-peanut-butter-1kg",
    description:
      "زبدة فول سوداني طبيعية ممزوجة بالشوكولاتة الغنية. متوفر نصف كيلو (١٠٠ ج) وربع كيلو (٥٠ ج).",
    price: 200,
    image_url: "/images/products/product-03.jpg",
    stock: 20,
    category: "منتجات أساسية",
    category_slug: "basic-products",
    is_active: true,
  },
  {
    id: "prod-7",
    name: "عسل حبة البركة الطبيعي (١ كيلو)",
    slug: "black-seed-honey-1kg",
    description:
      "عسل حبة البركة طبيعي ١٠٠٪ غني بالفوائد للمناعة والصحة. متوفر أيضاً نصف كيلو (١٢٠ ج).",
    price: 240,
    image_url: "/images/products/product-04.jpg",
    stock: 22,
    category: "عسل ومنتجات النحل",
    category_slug: "honey-products",
    is_active: true,
  },
  {
    id: "prod-8",
    name: "عسل نوارة البرسيم (١ كيلو)",
    slug: "clover-honey-1kg",
    description:
      "عسل نحل نوارة البرسيم الأصلي بطعم نقي وجودة مضمونة. متوفر أيضاً نصف كيلو (١٠٠ ج).",
    price: 200,
    image_url: "/images/products/product-21.jpg",
    stock: 25,
    category: "عسل ومنتجات النحل",
    category_slug: "honey-products",
    is_active: true,
  },
  {
    id: "prod-9",
    name: "عسل الموالح الطبيعي (١ كيلو)",
    slug: "citrus-honey-1kg",
    description:
      "عسل نحل موالح طبيعي ١٠٠٪ برائحة زهر البرتقال المميزة. متوفر أيضاً نصف كيلو (١٢٠ ج).",
    price: 240,
    image_url: "/images/products/product-04.jpg",
    stock: 18,
    category: "عسل ومنتجات النحل",
    category_slug: "honey-products",
    is_active: true,
  },
  {
    id: "prod-10",
    name: "عسل أسود طبيعي (١ كيلو)",
    slug: "black-honey-1kg",
    description:
      "عسل أسود قصب طبيعي فاخر بدون إضافات. متوفر أيضاً نصف كيلو (٣٠ ج).",
    price: 60,
    image_url: "/images/products/product-01.jpg",
    stock: 35,
    category: "عسل ومنتجات النحل",
    category_slug: "honey-products",
    is_active: true,
  },
  {
    id: "prod-11",
    name: "حلاوة طحينية سادة (١ كيلو)",
    slug: "plain-halawa-1kg",
    description:
      "حلاوة طحينية تقليدية من السمسم الصافي. متوفر نصف كيلو (٦٥ ج) وربع كيلو (٣٥ ج).",
    price: 130,
    image_url: "/images/products/product-08.jpg",
    stock: 25,
    category: "الحلاوة وزيت الزيتون",
    category_slug: "halawa-olive-oil",
    is_active: true,
  },
  {
    id: "prod-12",
    name: "حلاوة طحينية بالشوكولاتة (١ كيلو)",
    slug: "chocolate-halawa-1kg",
    description:
      "حلاوة طحينية بالشوكولاتة الفاخرة. متوفر نصف كيلو (٧٠ ج) وربع كيلو (٤٠ ج).",
    price: 140,
    image_url: "/images/products/product-08.jpg",
    stock: 20,
    category: "الحلاوة وزيت الزيتون",
    category_slug: "halawa-olive-oil",
    is_active: true,
  },
  {
    id: "prod-13",
    name: "عرض: ½ عسل بالمكسرات + ½ عسل حبة البركة",
    slug: "offer-nuts-blackseed-honey",
    description:
      "عرض مميز لفترة محدودة: نصف كيلو عسل بالمكسرات + نصف كيلو عسل حبة البركة بسعر ٢٣٠ جنيه فقط.",
    price: 230,
    image_url: "/images/products/product-15.jpg",
    stock: 15,
    category: "عروض وخلطات خاصة",
    category_slug: "special-offers",
    is_active: true,
  },
  {
    id: "prod-14",
    name: "عرض: ½ عسل برسيم + ½ عسل حبة البركة",
    slug: "offer-clover-blackseed-honey",
    description:
      "عرض خاص: نصف كيلو عسل برسيم + نصف كيلو عسل حبة البركة بسعر ١٧٠ جنيه بدلاً من ٢٢٠ جنيه.",
    price: 170,
    image_url: "/images/products/product-16.jpg",
    stock: 20,
    category: "عروض وخلطات خاصة",
    category_slug: "special-offers",
    is_active: true,
  },
  {
    id: "prod-15",
    name: "عرض: كيلو وربع طحينة سمسم خام",
    slug: "offer-tahina-1250g",
    description:
      "عرض لفترة محدودة: كيلو وربع طحينة سمسم خام بقوام ناعم وطعم أصلي بسعر ١٦٠ جنيه بدلاً من ١٩٠ جنيه.",
    price: 160,
    image_url: "/images/products/product-19.jpg",
    stock: 20,
    category: "عروض وخلطات خاصة",
    category_slug: "special-offers",
    is_active: true,
  },
  {
    id: "prod-16",
    name: "عرض: ½ مختوم فلسطيني + ½ عسل برسيم",
    slug: "offer-makhtoum-clover",
    description:
      "عرض خاص: نصف كيلو مختوم فلسطيني + نصف كيلو عسل نحل نورة البرسيم بسعر ٢٥٠ جنيه فقط.",
    price: 250,
    image_url: "/images/products/product-22.jpg",
    stock: 12,
    category: "عروض وخلطات خاصة",
    category_slug: "special-offers",
    is_active: true,
  },
];
