          <span className="flex gap-2">
            <button type="button" className="btn min-h-[44px]" style={{ padding: "0 20px" }} onClick={() => setShowCompare(true)}>{shop.compareNow}</button>
            <button type="button" className="btn btn-ghost min-h-[44px]" style={{ padding: "0 16px" }} onClick={() => { setCmp([]); setShowCompare(false); }}>{shop.clear}</button>
          </span>
        </div>
      ) : null}

      <Modal open={showCart} onClose={closeCart} label="Shopping cart">
        <h3 className="mb-2 text-2xl font-bold">Your shopping cart</h3>
        <p className="mb-5 text-sm text-muted">Review your items and quantities before sending the order to the shop on WhatsApp.</p>
        {cartItems.length ? (
          <div className="flex flex-col gap-3">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 rounded-2xl border p-3" style={{ borderColor: "var(--glass-border)", background: "rgba(255,255,255,.035)" }}>
                <div className="w-20 shrink-0 overflow-hidden rounded-xl">
                  <ProductPhoto product={product} ratio="1 / 1" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold leading-snug">{product.name}</div>
                  <div className="mt-1 text-sm text-muted">{product.model} · {price(product)}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" className="chip h-9 w-9 px-0" aria-label={`Decrease quantity of ${product.name}`} onClick={() => changeQuantity(product.id, -1)}>−</button>
                    <span className="min-w-6 text-center font-bold" aria-live="polite">{quantity}</span>
                    <button type="button" className="chip h-9 w-9 px-0" aria-label={`Increase quantity of ${product.name}`} onClick={() => changeQuantity(product.id, 1)}>+</button>
                    <button type="button" className="ml-1 text-sm underline text-muted" onClick={() => removeFromCart(product.id)}>Remove</button>
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm font-bold">
                  {product.price === null || product.price === undefined
                    ? shop.noPrice
                    : money(Number(product.price) * quantity, business.currencySymbol, shop.noPrice) + shop.priceSuffix}
                </div>
              </div>
            ))}
            <div className="mt-2 rounded-2xl p-4" style={{ background: "rgba(255,255,255,.05)" }}>
              <div className="flex items-center justify-between gap-4 text-lg font-extrabold">
                <span>Estimated total</span>
                <span>{displayedCartTotal}</span>
              </div>
              {hasUnpricedItems ? <p className="mt-2 text-sm text-muted">Some items need a confirmed price. The shop will confirm the final total on WhatsApp.</p> : null}
              <p className="mt-2 text-sm text-muted">Prices and stock will be confirmed by the shop. No payment is taken on this website.</p>
              <a className="btn mt-4 min-h-[48px] w-full" href={waLink(contact.whatsapp, checkoutMessage())} target="_blank" rel="noopener noreferrer">Checkout on WhatsApp</a>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-8 text-center text-muted" style={{ background: "rgba(255,255,255,.04)" }}>
            Your cart is empty.
            <button type="button" className="btn mt-4" onClick={closeCart}>Continue shopping</button>
          </div>
        )}
      </Modal>

      <Modal open={showCompare && cmpItems.length > 0} onClose={closeCompare} label={shop.compareTitle}>
        <h3 className="mb-4 text-2xl font-bold">{shop.compareTitle}</h3>
        <div className="overflow-x-auto">
          <table className="spec w-full border-collapse text-sm" style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th />
                {cmpItems.map((p) => (
                  <th key={p.id} className="font-display">
                    {p.name}
                    <div className="text-[13px] font-medium text-muted">{price(p)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="mono text-muted">{shop.specAvailability}</td>
                {cmpItems.map((p) => <td key={p.id}>{avLabel(p)}</td>)}
              </tr>
              <tr>
                <td className="mono text-muted">{shop.specWarranty}</td>
                {cmpItems.map((p) => <td key={p.id}>{p.warranty}</td>)}
              </tr>
              {cmpKeys.map((k) => (
                <tr key={k}>
                  <td className="mono text-muted">{k}</td>
                  {cmpItems.map((p) => {
                    const f = p.specs.find((s) => s.label === k);
                    return <td key={p.id}>{f ? f.value : "-"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal open={!!cur} onClose={closeModal} label={cur ? cur.name : "Product details"}>
        {cur ? (
          <div className="flex flex-wrap gap-6">
            <div className="min-w-0 flex-1 basis-64">
              <ProductPhoto product={cur} className="rounded-2xl" />
            </div>
            <div className="flex min-w-0 flex-1 basis-80 flex-col gap-3.5">
              <span className="mono text-muted normal-case">{cur.brand} / {cur.model}</span>
              <h3 className="text-[28px] font-extrabold leading-tight tracking-tight">{cur.name}</h3>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-2xl font-bold">{price(cur)}</span>
                <span className={avClass(cur)}>{avLabel(cur)}</span>
              </div>
              <table className="spec w-full border-collapse text-sm">
                <tbody>
                  {cur.specs.map((s) => (
                    <tr key={s.label}><td className="mono w-2/5 text-muted">{s.label}</td><td>{s.value}</td></tr>
                  ))}
                  <tr><td className="mono w-2/5 text-muted">{shop.specWarranty}</td><td>{cur.warranty}</td></tr>
                </tbody>
              </table>
              <button type="button" className="btn min-h-[48px] w-full" onClick={() => addToCart(cur.id)}>
                {quantityInCart(cur.id) > 0 ? `Add another to cart · ${quantityInCart(cur.id)} in cart` : "Add to cart"}
              </button>
              <a className="btn btn-ghost min-h-[44px] w-full" href={waLink(contact.whatsapp, orderText(cur))} target="_blank" rel="noopener noreferrer">{shop.orderCta}</a>
              {cur.related && cur.related.length ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold">{shop.relatedLabel}</span>
                  <div className="flex flex-wrap gap-2">
                    {cur.related.map(byId).filter(Boolean).map((r) => (
                      <button key={r.id} type="button" className="chip min-h-[44px] px-3.5" onClick={() => setSel(r.id)}>{r.name}</button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
