import os

file_path = "client/src/pages/ProductPage.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """      <div className="flex justify-between border-t border-luxury-border pt-2 text-gold-400 font-600">
        <span className="uppercase tracking-wider">Total Price</span>
        <span className="text-base">{formatPrice(total)}</span>
      </div>"""

replacement = """      {product.activeOffer && (
        <div className="flex justify-between text-green-400/80 pt-1">
          <span>Offer Discount ({product.activeOffer.title})</span>
          <span>-{formatPrice(total - calculateOfferPrice(total, product.activeOffer))}</span>
        </div>
      )}
      <div className="flex justify-between border-t border-luxury-border pt-2 text-gold-400 font-600">
        <span className="uppercase tracking-wider">Final Price</span>
        <span className="text-base">{formatPrice(product.activeOffer ? calculateOfferPrice(total, product.activeOffer) : total)}</span>
      </div>"""

if target in content:
    content = content.replace(target, replacement)
elif target.replace("\n", "\r\n") in content:
    content = content.replace(target.replace("\n", "\r\n"), replacement.replace("\n", "\r\n"))
else:
    print("Could not find Target in ProductPage.jsx")
    print(repr(target))

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied")
