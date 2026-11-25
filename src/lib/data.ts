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

// Starter data for Step 3 — will be fetched from Supabase in the catalog step
export const FEATURED_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "منتجات غذائية طبيعية",
    slug: "natural-foods",
    description: "عسل نحل، زيوت طبيعية، ومنتجات طازجة مختارة",
  },
  {
    id: "cat-2",
    name: "التوابل والأعشاب",
    slug: "spices-herbs",
    description: "أجود أنواع التوابل والأعشاب المعبأة بعناية",
  },
  {
    id: "cat-3",
    name: "العناية الشخصية",
    slug: "personal-care",
    description: "منتجات عناية طبيعية وآمنة للاستخدام اليومي",
  },
  {
    id: "cat-4",
    name: "عروض وتوفير",
    slug: "offers",
    description: "باقات مميزة بأسعار خاصة لعملائنا في مصر",
  },
];

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "عسل سدر جبلي طبيعي - ٥٠٠ جم",
    slug: "sidr-honey-500g",
    description: "عسل نحل طبيعي ١٠٠٪ مفحوص ومضمون الجودة.",
    price: 380,
    image_url: "/images/prod-1.svg",
    stock: 18,
    category: "منتجات غذائية طبيعية",
    category_slug: "natural-foods",
    is_active: true,
  },
  {
    id: "prod-2",
    name: "زيت زيتون بكر ممتاز - ٧٥٠ مل",
    slug: "extra-virgin-olive-oil",
    description: "معصور على البارد للحفاظ على النكهة والفوائد الغذائية.",
    price: 450,
    image_url: "/images/prod-2.svg",
    stock: 12,
    category: "منتجات غذائية طبيعية",
    category_slug: "natural-foods",
    is_active: true,
  },
  {
    id: "prod-3",
    name: "تشكيلة توابل الحسيني الفاخرة",
    slug: "elhusseiny-spices-box",
    description: "عبوة متكاملة من أجود البهارات الطازجة للمطبخ المصري.",
    price: 240,
    image_url: "/images/prod-3.svg",
    stock: 25,
    category: "التوابل والأعشاب",
    category_slug: "spices-herbs",
    is_active: true,
  },
  {
    id: "prod-4",
    name: "باقة العائلة الاقتصادية",
    slug: "family-value-pack",
    description: "مجموعة مختارة من أكثر منتجات الحسيني مبيعاً بسعر مخفض.",
    price: 690,
    image_url: "/images/prod-4.svg",
    stock: 9,
    category: "عروض وتوفير",
    category_slug: "offers",
    is_active: true,
  },
];
