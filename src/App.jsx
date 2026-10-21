import React, { useMemo, useState } from "react";
import site from "./data/site.json";
import catalogue from "./data/products.json";
import Hero from "./components/Hero";
import GlassNav from "./components/GlassNav";
import Reveal from "./components/Reveal";
import Modal from "./components/Modal";
import ProductPhoto from "./components/ProductPhoto";
import Blobs from "./components/Blobs";
import { waLink, money } from "./lib/whatsapp";

const products = catalogue.items;
const byId = (id) => products.find((p) => p.id === id);
const MAX_COMPARE = 3;

export default function App() {
  const { business, contact, hero, nav, shop, availability, highlights, visit, footer } = site;
  const [cat, setCat] = useState(shop.allLabel);
  const [brand, setBrand] = useState(shop.allLabel);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [cmp, setCmp] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const price = (p) => {
    const t = money(p.price, business.currencySymbol, shop.noPrice);
    return p.price === null || p.price === undefined ? t : t + shop.priceSuffix;
  };
  const avLabel = (p) => availability[p.availability] || availability.enq;
  const avClass = (p) => `pill-av av-${availability[p.availability] ? p.availability : "enq"}`;

  const base = useMemo(() => products.filter((p) => cat === shop.allLabel || p.category === cat), [cat, shop.allLabel]);
  const brands = useMemo(() => [shop.allLabel, ...Array.from(new Set(base.map((p) => p.brand)))], [base, shop.allLabel]);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return base.filter(
      (p) =>
        (brand === shop.allLabel || p.brand === brand) &&
        (!term || `${p.name} ${p.brand} ${p.model} ${p.category}`.toLowerCase().includes(term))
    );
  }, [base, brand, q, shop.allLabel]);

  const cur = sel ? byId(sel) : null;
  const cmpItems = cmp.map(byId).filter(Boolean);
  const cartItems = cart.map((entry) => ({ ...entry, product: byId(entry.id) })).filter((entry) => entry.product);
  const cartCount = cartItems.reduce((sum, entry) => sum + entry.quantity, 0);
  const cartTotal = cartItems.reduce((sum, entry) => {
    const value = Number(entry.product.price);
    return entry.product.price !== null && entry.product.price !== undefined && Number.isFinite(value)
      ? sum + value * entry.quantity
      : sum;
  }, 0);
  const hasUnpricedItems = cartItems.some(({ product }) => product.price === null || product.price === undefined);
  const cmpKeys = [];
  cmpItems.forEach((p) => p.specs.forEach((s) => { if (!cmpKeys.includes(s.label)) cmpKeys.push(s.label); }));

  const toggle = (id) =>
    setCmp((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < MAX_COMPARE ? [...c, id] : c));

  const addToCart = (id) => {
    setCart((current) => {
      const found = current.find((item) => item.id === id);
      return found
        ? current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { id, quantity: 1 }];
    });
  };

  const changeQuantity = (id, change) => {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  };

  const removeFromCart = (id) => setCart((current) => current.filter((item) => item.id !== id));
  const quantityInCart = (id) => cart.find((item) => item.id === id)?.quantity ?? 0;

  const orderText = (p) =>
    shop.orderMessage
      .replace("{shop}", business.name)
      .replace("{name}", p.name)
      .replace("{model}", p.model)
      .replace("{price}", price(p));

  const checkoutMessage = () => {
    const lines = cartItems.map(({ product, quantity }, index) => {
      const lineTotal = product.price === null || product.price === undefined
        ? shop.noPrice
        : money(Number(product.price) * quantity, business.currencySymbol, shop.noPrice) + shop.priceSuffix;
      return `${index + 1}. ${product.name} (${product.model})\n   Quantity: ${quantity}\n   Unit price: ${price(product)}\n   Line total: ${lineTotal}\n   Availability: ${avLabel(product)}`;
    });

    const totalText = cartItems.some(({ product }) => product.price !== null && product.price !== undefined)
      ? money(cartTotal, business.currencySymbol, shop.noPrice) + shop.priceSuffix
