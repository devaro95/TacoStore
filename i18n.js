/* Traducción de la web (es · fr · en · de).
   El HTML está escrito en español; este script sustituye cada texto por su traducción
   y vigila con un MutationObserver lo que el resto de la página pinta después (tarjetas, carrito, avisos…). */
(function () {
  const LANGS = { es: "Español", fr: "Français", en: "English", de: "Deutsch" };
  const KEY = "ts-lang";

  // [español, inglés, francés, alemán]
  const T = [
    // Barra y navegación
    ["Inicio", "Home", "Accueil", "Startseite"],
    ["Catálogo", "Catalogue", "Catalogue", "Katalog"],
    ["Contacto", "Contact", "Contact", "Kontakt"],
    // Banner
    ["Masters y Fusion World", "Masters and Fusion World", "Masters et Fusion World", "Masters und Fusion World"],
    ["Sobres", "Packs", "Boosters", "Booster"],
    ["y booster box para tu colección de Dragon Ball", "and booster boxes for your Dragon Ball collection", "et displays pour votre collection Dragon Ball", "und Displays für deine Dragon-Ball-Sammlung"],
    ["Sobres sueltos y booster box precintadas de Dragon Ball Super Card Game. Ábrelos, colecciona y completa tus sets favoritos.", "Single packs and sealed booster boxes of Dragon Ball Super Card Game. Open them, collect and complete your favourite sets.", "Boosters à l'unité et displays scellés de Dragon Ball Super Card Game. Ouvrez-les, collectionnez et complétez vos sets préférés.", "Einzelne Booster und versiegelte Displays von Dragon Ball Super Card Game. Öffnen, sammeln und deine Lieblingssets vervollständigen."],
    ["Ver catálogo →", "View catalogue →", "Voir le catalogue →", "Zum Katalog →"],
    // Cinta
    ["Producto sellado", "Sealed product", "Produit scellé", "Versiegelte Ware"],
    ["Envío desde Madrid", "Shipped from Madrid", "Expédié depuis Madrid", "Versand aus Madrid"],
    ["Gratis desde 50 €", "Free over €50", "Gratuit dès 50 €", "Gratis ab 50 €"],
    ["Pago seguro", "Secure payment", "Paiement sécurisé", "Sichere Zahlung"],
    // Elige tu juego
    ["Elige tu juego", "Choose your game", "Choisissez votre jeu", "Wähle dein Spiel"],
    ["Dos juegos, una colección", "Two games, one collection", "Deux jeux, une collection", "Zwei Spiele, eine Sammlung"],
    ["La generación actual del juego, con las expansiones FB más recientes.", "The current generation of the game, with the latest FB expansions.", "La génération actuelle du jeu, avec les dernières extensions FB.", "Die aktuelle Generation des Spiels mit den neuesten FB-Erweiterungen."],
    ["El juego original de siempre, con sus expansiones BT.", "The original game, with its BT expansions.", "Le jeu original de toujours, avec ses extensions BT.", "Das ursprüngliche Spiel mit seinen BT-Erweiterungen."],
    ["productos", "products", "produits", "Produkte"],
    // Producto sellado. Nada más.
    ["Producto", "Only", "Que du", "Nur"],
    ["sellado", "sealed", "scellé", "versiegelt"],
    ["Nada más.", "Nothing else.", "Rien d'autre.", "Sonst nichts."],
    ["Solo vendemos sobres y booster box sin abrir de Dragon Ball Super Card Game. Sin cartas sueltas: lo que abres es lo que viene de fábrica.", "We only sell unopened packs and booster boxes of Dragon Ball Super Card Game. No single cards: what you open is exactly what came from the factory.", "Nous ne vendons que des boosters et displays non ouverts de Dragon Ball Super Card Game. Pas de cartes à l'unité : ce que vous ouvrez sort tout droit de l'usine.", "Wir verkaufen nur ungeöffnete Booster und Displays von Dragon Ball Super Card Game. Keine Einzelkarten: Was du öffnest, kommt direkt aus der Fabrik."],
    ["100 % sellado", "100% sealed", "100 % scellé", "100 % versiegelt"],
    ["Sobres y booster box sin abrir, tal cual salen de fábrica.", "Unopened packs and booster boxes, straight from the factory.", "Boosters et displays non ouverts, tels qu'ils sortent de l'usine.", "Ungeöffnete Booster und Displays, direkt aus der Fabrik."],
    ["Los dos juegos, cada uno con su catálogo.", "Both games, each with its own catalogue.", "Les deux jeux, chacun avec son catalogue.", "Beide Spiele, jedes mit eigenem Katalog."],
    ["Desde Madrid", "From Madrid", "Depuis Madrid", "Aus Madrid"],
    ["Envíos a España y Europa, gratis desde 50 €.", "Shipping to Spain and Europe, free over €50.", "Livraison en Espagne et en Europe, gratuite dès 50 €.", "Versand nach Spanien und Europa, gratis ab 50 €."],
    ["Tarjeta, Apple Pay, Klarna, Amazon Pay y más, con pago cifrado.", "Card, Apple Pay, Klarna, Amazon Pay and more, fully encrypted.", "Carte, Apple Pay, Klarna, Amazon Pay et plus, paiement chiffré.", "Karte, Apple Pay, Klarna, Amazon Pay und mehr, verschlüsselt."],
    // Catálogo (home)
    ["Booster box y sobres sueltos de Masters y Fusion World. Cada producto indica su precio con IVA y si queda stock.", "Booster boxes and single packs of Masters and Fusion World. Every product shows its price incl. VAT and whether it's in stock.", "Displays et boosters à l'unité de Masters et Fusion World. Chaque produit indique son prix TTC et sa disponibilité.", "Displays und einzelne Booster von Masters und Fusion World. Jedes Produkt zeigt seinen Preis inkl. MwSt. und ob es vorrätig ist."],
    ["Disponible", "In stock", "En stock", "Verfügbar"],
    ["Agotado", "Sold out", "Épuisé", "Ausverkauft"],
    ["Sin stock", "Out of stock", "Rupture", "Nicht vorrätig"],
    ["Añadir al carrito", "Add to cart", "Ajouter au panier", "In den Warenkorb"],
    ["Ver catálogo completo →", "View full catalogue →", "Voir tout le catalogue →", "Ganzen Katalog ansehen →"],
    ["Más vendidos", "Best sellers", "Meilleures ventes", "Bestseller"],
    ["Los productos que más salen de la tienda, ordenados por unidades vendidas.", "Our most popular products, ranked by units sold.", "Les produits qui partent le plus, classés par unités vendues.", "Unsere beliebtesten Produkte, sortiert nach verkauften Einheiten."],
    ["El más vendido", "Best seller", "N° 1 des ventes", "Meistverkauft"],
    ["Avisos de preventas, reposiciones y novedades. Un correo al mes como mucho.", "Pre-order alerts, restocks and news. One email a month at most.", "Alertes précommandes, réassorts et nouveautés. Un e-mail par mois maximum.", "Infos zu Vorbestellungen, Nachschub und Neuheiten. Höchstens eine E-Mail im Monat."],
    ["Suscribirme", "Subscribe", "M'abonner", "Abonnieren"],
    // Footer
    ["Producto sellado de Dragon Ball Super Card Game, Masters y Fusion World, con envío desde Madrid.", "Sealed Dragon Ball Super Card Game products, Masters and Fusion World, shipped from Madrid.", "Produits scellés Dragon Ball Super Card Game, Masters et Fusion World, expédiés depuis Madrid.", "Versiegelte Produkte von Dragon Ball Super Card Game, Masters und Fusion World, Versand aus Madrid."],
    ["Tienda", "Shop", "Boutique", "Shop"],
    ["Ayuda", "Help", "Aide", "Hilfe"],
    ["Envíos y devoluciones", "Shipping and returns", "Livraison et retours", "Versand und Rückgabe"],
    ["Preguntas frecuentes", "FAQ", "Questions fréquentes", "Häufige Fragen"],
    ["Aviso legal", "Legal notice", "Mentions légales", "Impressum"],
    ["Términos y condiciones", "Terms and conditions", "Conditions générales", "AGB"],
    ["Política de privacidad", "Privacy policy", "Politique de confidentialité", "Datenschutz"],
    ["Política de cookies", "Cookie policy", "Politique de cookies", "Cookie-Richtlinie"],
    ["© 2026 TacoStore · Precios con IVA (21 %) incluido", "© 2026 TacoStore · Prices include VAT (21%)", "© 2026 TacoStore · Prix TTC (TVA 21 %)", "© 2026 TacoStore · Preise inkl. MwSt. (21 %)"],
    ["Dragon Ball es una marca de sus respectivos titulares. Tienda no oficial.", "Dragon Ball is a trademark of its respective owners. Unofficial shop.", "Dragon Ball est une marque de ses détenteurs respectifs. Boutique non officielle.", "Dragon Ball ist eine Marke der jeweiligen Inhaber. Kein offizieller Shop."],
    // Catálogo completo
    ["Catálogo completo", "Full catalogue", "Catalogue complet", "Gesamter Katalog"],
    ["Todo el producto sellado que tenemos a la venta, separado por juego. Filtra por precio o por disponibilidad.", "All the sealed product we have for sale, split by game. Filter by price or availability.", "Tous nos produits scellés en vente, classés par jeu. Filtrez par prix ou disponibilité.", "Alle versiegelten Produkte im Verkauf, nach Spiel getrennt. Nach Preis oder Verfügbarkeit filtern."],
    ["Todo", "All", "Tout", "Alle"],
    ["Precio (€)", "Price (€)", "Prix (€)", "Preis (€)"],
    ["Disponibilidad", "Availability", "Disponibilité", "Verfügbarkeit"],
    ["Todos", "All", "Tous", "Alle"],
    ["Con stock", "In stock", "En stock", "Vorrätig"],
    ["Limpiar filtros", "Clear filters", "Effacer les filtres", "Filter zurücksetzen"],
    ["Ningún producto coincide con estos filtros. Prueba a ampliar el rango de precio.", "No products match these filters. Try widening the price range.", "Aucun produit ne correspond à ces filtres. Essayez d'élargir la fourchette de prix.", "Keine Produkte passen zu diesen Filtern. Versuche einen größeren Preisbereich."],
    // Detalle
    ["← Volver a la tienda", "← Back to the shop", "← Retour à la boutique", "← Zurück zum Shop"],
    ["IVA incluido", "VAT included", "TTC", "inkl. MwSt."],
    ["Descripción", "Description", "Description", "Beschreibung"],
    ["Aún no está en tu carrito", "Not in your cart yet", "Pas encore dans votre panier", "Noch nicht im Warenkorb"],
    ["Tienes", "You have", "Vous avez", "Du hast"],
    ["en el carrito", "in your cart", "dans le panier", "im Warenkorb"],
    // Carrito
    ["Tu carrito", "Your cart", "Votre panier", "Dein Warenkorb"],
    ["Tu carrito está vacío.", "Your cart is empty.", "Votre panier est vide.", "Dein Warenkorb ist leer."],
    ["Añade algo desde el catálogo.", "Add something from the catalogue.", "Ajoutez quelque chose depuis le catalogue.", "Füge etwas aus dem Katalog hinzu."],
    ["Base imponible", "Subtotal excl. VAT", "Montant HT", "Nettobetrag"],
    ["IVA (21 %)", "VAT (21%)", "TVA (21 %)", "MwSt. (21 %)"],
    ["Envío", "Shipping", "Livraison", "Versand"],
    ["Gratis", "Free", "Gratuite", "Gratis"],
    ["Total", "Total", "Total", "Gesamt"],
    ["Finalizar compra", "Checkout", "Commander", "Zur Kasse"],
    ["Redirigiendo…", "Redirecting…", "Redirection…", "Weiterleitung…"],
    ["Envío gratis a partir de 50 €. Pago seguro con Stripe.", "Free shipping over €50. Secure payment with Stripe.", "Livraison gratuite dès 50 €. Paiement sécurisé avec Stripe.", "Gratis Versand ab 50 €. Sichere Zahlung mit Stripe."],
    // Newsletter emergente
    ["Entérate antes que nadie de las", "Be the first to hear about", "Soyez les premiers informés des", "Erfahre als Erstes von"],
    ["preventas", "pre-orders", "précommandes", "Vorbestellungen"],
    ["Preventas, reposiciones y novedades. Un correo al mes como mucho.", "Pre-orders, restocks and news. One email a month at most.", "Précommandes, réassorts et nouveautés. Un e-mail par mois maximum.", "Vorbestellungen, Nachschub und Neuheiten. Höchstens eine E-Mail im Monat."],
    ["Escribe un correo válido", "Enter a valid email", "Saisissez une adresse e-mail valide", "Gib eine gültige E-Mail-Adresse ein"],
    ["Escribe un correo válido, por ejemplo nombre@dominio.com", "Enter a valid email, e.g. name@domain.com", "Saisissez une adresse e-mail valide, par ex. nom@domaine.com", "Gib eine gültige E-Mail-Adresse ein, z. B. name@domain.com"],
    // FAQ
    ["Preguntas", "Frequently asked", "Questions", "Häufige"],
    ["frecuentes", "questions", "fréquentes", "Fragen"],
    ["Pedidos, envíos, productos y devoluciones. Si no encuentras tu respuesta, escríbenos.", "Orders, shipping, products and returns. If you can't find your answer, write to us.", "Commandes, livraison, produits et retours. Si vous ne trouvez pas votre réponse, écrivez-nous.", "Bestellungen, Versand, Produkte und Rückgaben. Findest du keine Antwort, schreib uns."],
    ["Pedidos y pago", "Orders and payment", "Commandes et paiement", "Bestellung und Zahlung"],
    ["¿Cómo hago un pedido?", "How do I place an order?", "Comment passer commande ?", "Wie bestelle ich?"],
    ["Añade los productos al carrito y pulsa «Finalizar compra». Te llevaremos a la pasarela de pago segura, donde indicas tus datos de envío y eliges cómo pagar. Al terminar verás el resumen con tu número de pedido.", "Add products to your cart and press “Checkout”. We'll take you to the secure payment page, where you enter your shipping details and choose how to pay. When you're done you'll see a summary with your order number.", "Ajoutez les produits au panier et cliquez sur « Commander ». Vous arriverez sur la page de paiement sécurisée, où vous saisissez vos coordonnées de livraison et choisissez votre moyen de paiement. À la fin, vous verrez le récapitulatif avec votre numéro de commande.", "Lege die Produkte in den Warenkorb und klicke auf „Zur Kasse“. Du gelangst zur sicheren Zahlungsseite, wo du deine Lieferdaten eingibst und die Zahlungsart wählst. Danach siehst du die Übersicht mit deiner Bestellnummer."],
    ["¿Qué formas de pago aceptáis?", "Which payment methods do you accept?", "Quels moyens de paiement acceptez-vous ?", "Welche Zahlungsarten akzeptiert ihr?"],
    ["Pagas a través de Stripe, con tarjeta (Visa, Mastercard, American Express), Apple Pay, Link, Klarna (paga a plazos o más tarde), Amazon Pay y otros métodos como Bancontact o MB WAY. Los métodos que ves pueden variar según tu dispositivo y país. Tus datos de pago nunca pasan por nuestra web: se introducen directamente en la pasarela cifrada.", "You pay through Stripe, by card (Visa, Mastercard, American Express), Apple Pay, Link, Klarna (pay in instalments or later), Amazon Pay and other methods such as Bancontact or MB WAY. The methods you see may vary by device and country. Your payment details never pass through our site: they go straight into the encrypted payment page.", "Vous payez via Stripe, par carte (Visa, Mastercard, American Express), Apple Pay, Link, Klarna (paiement en plusieurs fois ou plus tard), Amazon Pay et d'autres moyens comme Bancontact ou MB WAY. Les moyens proposés peuvent varier selon votre appareil et votre pays. Vos données de paiement ne passent jamais par notre site : elles sont saisies directement sur la page de paiement chiffrée.", "Du zahlst über Stripe, mit Karte (Visa, Mastercard, American Express), Apple Pay, Link, Klarna (Ratenkauf oder später bezahlen), Amazon Pay und weiteren Methoden wie Bancontact oder MB WAY. Die angezeigten Methoden können je nach Gerät und Land variieren. Deine Zahlungsdaten laufen nie über unsere Website: Sie werden direkt auf der verschlüsselten Zahlungsseite eingegeben."],
    ["¿Los precios incluyen IVA?", "Do prices include VAT?", "Les prix incluent-ils la TVA ?", "Sind die Preise inkl. MwSt.?"],
    ["Sí. Todos los precios que ves en la tienda llevan el IVA (21 %) incluido. El único extra posible son los gastos de envío, que ves antes de pagar.", "Yes. All prices in the shop include VAT (21%). The only possible extra is shipping, which you see before paying.", "Oui. Tous les prix de la boutique incluent la TVA (21 %). Le seul supplément possible est la livraison, affichée avant le paiement.", "Ja. Alle Preise im Shop enthalten die MwSt. (21 %). Einziger möglicher Zusatz sind die Versandkosten, die du vor dem Bezahlen siehst."],
    ["¿Recibiré confirmación del pedido?", "Will I get an order confirmation?", "Vais-je recevoir une confirmation de commande ?", "Bekomme ich eine Bestellbestätigung?"],
    ["Sí. Te enviamos un email de confirmación al completar el pago y otro cuando el pedido sale de Madrid, con su número de seguimiento.", "Yes. We send you a confirmation email once payment is complete and another when the order leaves Madrid, with its tracking number.", "Oui. Nous vous envoyons un e-mail de confirmation après le paiement, puis un autre quand la commande quitte Madrid, avec son numéro de suivi.", "Ja. Wir schicken dir nach der Zahlung eine Bestätigungs-E-Mail und eine weitere, wenn die Bestellung Madrid verlässt, mit Sendungsnummer."],
    ["Envíos", "Shipping", "Livraison", "Versand"],
    ["¿A dónde enviáis?", "Where do you ship?", "Où livrez-vous ?", "Wohin liefert ihr?"],
    ["Enviamos desde Madrid a toda España y al resto de países de la Unión Europea.", "We ship from Madrid to all of Spain and the rest of the European Union.", "Nous expédions depuis Madrid dans toute l'Espagne et dans le reste de l'Union européenne.", "Wir versenden aus Madrid nach ganz Spanien und in die übrigen Länder der Europäischen Union."],
    ["¿Cuánto cuesta el envío?", "How much is shipping?", "Combien coûte la livraison ?", "Was kostet der Versand?"],
    ["3,95 € por pedido. A partir de 50 € de compra, el envío es gratis.", "€3.95 per order. Shipping is free on orders over €50.", "3,95 € par commande. Livraison gratuite dès 50 € d'achat.", "3,95 € pro Bestellung. Ab 50 € Einkaufswert ist der Versand gratis."],
    ["¿Cuánto tarda en llegar?", "How long does delivery take?", "Quel est le délai de livraison ?", "Wie lange dauert die Lieferung?"],
    ["La entrega estimada es de 2 a 5 días laborables desde que sale el pedido.", "Estimated delivery is 2 to 5 working days from dispatch.", "La livraison est estimée entre 2 et 5 jours ouvrés après l'expédition.", "Die voraussichtliche Lieferzeit beträgt 2 bis 5 Werktage ab Versand."],
    ["¿Cómo sé dónde está mi paquete?", "How do I track my parcel?", "Comment suivre mon colis ?", "Wie verfolge ich mein Paket?"],
    ["Cuando lo enviamos te llega un email con el número de seguimiento para consultar su estado en todo momento.", "When we ship it you'll receive an email with the tracking number so you can check its status at any time.", "Lors de l'expédition, vous recevez un e-mail avec le numéro de suivi pour consulter son état à tout moment.", "Beim Versand bekommst du eine E-Mail mit der Sendungsnummer, um den Status jederzeit zu prüfen."],
    ["Productos", "Products", "Produits", "Produkte"],
    ["¿Vendéis cartas sueltas?", "Do you sell single cards?", "Vendez-vous des cartes à l'unité ?", "Verkauft ihr Einzelkarten?"],
    ["No. Solo vendemos producto sellado: sobres sueltos y booster box de Dragon Ball Super Card Game, tanto de Masters como de Fusion World.", "No. We only sell sealed product: single packs and booster boxes of Dragon Ball Super Card Game, for both Masters and Fusion World.", "Non. Nous ne vendons que des produits scellés : boosters à l'unité et displays de Dragon Ball Super Card Game, aussi bien Masters que Fusion World.", "Nein. Wir verkaufen nur versiegelte Ware: einzelne Booster und Displays von Dragon Ball Super Card Game, sowohl Masters als auch Fusion World."],
    ["¿Los productos son originales y vienen precintados?", "Are the products genuine and factory sealed?", "Les produits sont-ils originaux et scellés ?", "Sind die Produkte original und versiegelt?"],
    ["Sí. Todo el producto es original y llega tal cual sale de fábrica, con su precinto intacto.", "Yes. Everything is genuine and arrives exactly as it left the factory, with its seal intact.", "Oui. Tous les produits sont originaux et arrivent tels qu'ils sortent de l'usine, avec leur scellé intact.", "Ja. Alles ist original und kommt so an, wie es die Fabrik verlassen hat, mit intakter Versiegelung."],
    ["¿Qué diferencia hay entre Masters y Fusion World?", "What's the difference between Masters and Fusion World?", "Quelle différence entre Masters et Fusion World ?", "Was ist der Unterschied zwischen Masters und Fusion World?"],
    ["Masters es el juego original, con las expansiones BT. Fusion World es la generación actual, con las expansiones FB. Son juegos distintos y sus cartas no se mezclan.", "Masters is the original game, with the BT expansions. Fusion World is the current generation, with the FB expansions. They are separate games and their cards don't mix.", "Masters est le jeu original, avec les extensions BT. Fusion World est la génération actuelle, avec les extensions FB. Ce sont deux jeux distincts dont les cartes ne se mélangent pas.", "Masters ist das ursprüngliche Spiel mit den BT-Erweiterungen. Fusion World ist die aktuelle Generation mit den FB-Erweiterungen. Es sind getrennte Spiele, deren Karten nicht kombiniert werden."],
    ["¿Hacéis preventas?", "Do you take pre-orders?", "Proposez-vous des précommandes ?", "Bietet ihr Vorbestellungen an?"],
    ["Sí, cuando hay nuevas expansiones. Suscríbete a la newsletter para enterarte antes que nadie de preventas y reposiciones.", "Yes, when new expansions come out. Subscribe to the newsletter to be the first to hear about pre-orders and restocks.", "Oui, lors des nouvelles extensions. Abonnez-vous à la newsletter pour être informé en premier des précommandes et réassorts.", "Ja, bei neuen Erweiterungen. Abonniere den Newsletter, um als Erstes von Vorbestellungen und Nachschub zu erfahren."],
    ["Un producto está agotado, ¿volverá?", "A product is sold out — will it be back?", "Un produit est épuisé, reviendra-t-il ?", "Ein Produkt ist ausverkauft – kommt es wieder?"],
    ["Normalmente reponemos, pero depende de la distribución. Apúntate a la newsletter o escríbenos y te avisamos.", "We usually restock, but it depends on distribution. Sign up to the newsletter or write to us and we'll let you know.", "Nous réassortissons généralement, mais cela dépend de la distribution. Inscrivez-vous à la newsletter ou écrivez-nous et nous vous préviendrons.", "Meist füllen wir nach, das hängt aber vom Vertrieb ab. Abonniere den Newsletter oder schreib uns, dann sagen wir dir Bescheid."],
    ["Devoluciones", "Returns", "Retours", "Rückgaben"],
    ["¿Puedo devolver un producto?", "Can I return a product?", "Puis-je retourner un produit ?", "Kann ich ein Produkt zurückgeben?"],
    ["Sí, tienes 14 días naturales desde que lo recibes para desistir de la compra, siempre que el producto siga precintado y sin abrir. Escríbenos desde la página de contacto con tu número de pedido.", "Yes, you have 14 calendar days from receipt to withdraw from the purchase, as long as the product is still sealed and unopened. Write to us from the contact page with your order number.", "Oui, vous disposez de 14 jours calendaires après réception pour vous rétracter, à condition que le produit soit toujours scellé et non ouvert. Écrivez-nous depuis la page de contact avec votre numéro de commande.", "Ja, du hast ab Erhalt 14 Kalendertage Widerrufsrecht, sofern das Produkt noch versiegelt und ungeöffnet ist. Schreib uns über die Kontaktseite mit deiner Bestellnummer."],
    ["¿Y si llega dañado?", "What if it arrives damaged?", "Et s'il arrive endommagé ?", "Und wenn es beschädigt ankommt?"],
    ["Escríbenos cuanto antes con tu número de pedido y unas fotos del paquete y del producto, y lo solucionamos.", "Write to us as soon as possible with your order number and some photos of the parcel and product, and we'll sort it out.", "Écrivez-nous au plus vite avec votre numéro de commande et quelques photos du colis et du produit, et nous réglerons le problème.", "Schreib uns so schnell wie möglich mit Bestellnummer und Fotos von Paket und Produkt, dann lösen wir das."],
    ["¿Sigues con dudas?", "Still have questions?", "Encore des questions ?", "Noch Fragen?"],
    ["Escríbenos →", "Write to us →", "Écrivez-nous →", "Schreib uns →"],
    // Contacto
    ["¿Hablamos", "Let's talk", "Parlons-en", "Lass uns reden"],
    ["Dudas sobre un pedido, un producto o una preventa. Déjanos tu mensaje y te respondemos por email.", "Questions about an order, a product or a pre-order? Leave us a message and we'll reply by email.", "Une question sur une commande, un produit ou une précommande ? Laissez-nous un message et nous vous répondrons par e-mail.", "Fragen zu einer Bestellung, einem Produkt oder einer Vorbestellung? Hinterlass uns eine Nachricht, wir antworten per E-Mail."],
    ["Nombre", "Name", "Nom", "Name"],
    ["Email", "Email", "E-mail", "E-Mail"],
    ["Motivo", "Subject", "Motif", "Anliegen"],
    ["Un pedido", "An order", "Une commande", "Eine Bestellung"],
    ["Producto o stock", "Product or stock", "Produit ou stock", "Produkt oder Bestand"],
    ["Preventas", "Pre-orders", "Précommandes", "Vorbestellungen"],
    ["Otro", "Other", "Autre", "Sonstiges"],
    ["Nº de pedido", "Order no.", "N° de commande", "Bestellnr."],
    ["(opcional)", "(optional)", "(facultatif)", "(optional)"],
    ["Mensaje", "Message", "Message", "Nachricht"],
    ["Enviar mensaje →", "Send message →", "Envoyer le message →", "Nachricht senden →"],
    ["Enviando…", "Sending…", "Envoi…", "Wird gesendet…"],
    ["¡Mensaje enviado! Te responderemos por email.", "Message sent! We'll reply by email.", "Message envoyé ! Nous vous répondrons par e-mail.", "Nachricht gesendet! Wir antworten per E-Mail."],
    ["Escribe tu nombre", "Enter your name", "Saisissez votre nom", "Gib deinen Namen ein"],
    ["Cuéntanos un poco más en el mensaje", "Tell us a bit more in your message", "Dites-nous-en un peu plus dans votre message", "Erzähl uns etwas mehr in deiner Nachricht"],
    ["No se pudo enviar el mensaje", "The message could not be sent", "Le message n'a pas pu être envoyé", "Die Nachricht konnte nicht gesendet werden"],
    ["No se pudo enviar el mensaje. Inténtalo de nuevo en un rato.", "The message could not be sent. Please try again later.", "Le message n'a pas pu être envoyé. Réessayez plus tard.", "Die Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen."],
    ["¿Es sobre un pedido?", "Is it about an order?", "C'est à propos d'une commande ?", "Geht es um eine Bestellung?"],
    ["Indica tu número de pedido: lo tienes en el email de confirmación. Así te ayudamos más rápido.", "Include your order number — it's in your confirmation email. That way we can help you faster.", "Indiquez votre numéro de commande : il figure dans l'e-mail de confirmation. Nous pourrons vous aider plus vite.", "Gib deine Bestellnummer an – sie steht in der Bestätigungs-E-Mail. So helfen wir dir schneller."],
    ["Respuestas rápidas", "Quick answers", "Réponses rapides", "Schnelle Antworten"],
    ["Envíos, pagos y devoluciones están resueltos en las preguntas frecuentes.", "Shipping, payments and returns are covered in the FAQ.", "Livraison, paiements et retours sont expliqués dans la FAQ.", "Versand, Zahlung und Rückgaben werden in den häufigen Fragen erklärt."],
    ["Ver preguntas frecuentes →", "See the FAQ →", "Voir la FAQ →", "Zu den häufigen Fragen →"],
    ["Enviamos a España y Europa. Gratis a partir de 50 €.", "We ship to Spain and Europe. Free over €50.", "Nous livrons en Espagne et en Europe. Gratuit dès 50 €.", "Wir liefern nach Spanien und Europa. Gratis ab 50 €."],
    // Pedido
    ["Cargando tu pedido…", "Loading your order…", "Chargement de votre commande…", "Bestellung wird geladen…"],
    ["¡Gracias por tu compra!", "Thank you for your purchase!", "Merci pour votre achat !", "Danke für deinen Einkauf!"],
    ["Pronto en tus manos.", "Soon in your hands.", "Bientôt entre vos mains.", "Bald in deinen Händen."],
    ["Tu pago se ha completado. Te enviaremos la confirmación del pedido por email.", "Your payment is complete. We'll email you the order confirmation.", "Votre paiement est validé. Nous vous enverrons la confirmation de commande par e-mail.", "Deine Zahlung ist abgeschlossen. Wir senden dir die Bestellbestätigung per E-Mail."],
    ["Hemos recibido tu pedido y ya lo estamos preparando. Te enviaremos un email a", "We've received your order and are already preparing it. We'll send an email to", "Nous avons reçu votre commande et la préparons déjà. Nous enverrons un e-mail à", "Wir haben deine Bestellung erhalten und bereiten sie schon vor. Wir senden eine E-Mail an"],
    ["con la confirmación y otro cuando salga de Madrid.", "with the confirmation and another when it leaves Madrid.", "avec la confirmation, puis un autre quand elle quittera Madrid.", "mit der Bestätigung und eine weitere, wenn sie Madrid verlässt."],
    ["Fecha", "Date", "Date", "Datum"],
    ["Ref. de pago", "Payment ref.", "Réf. de paiement", "Zahlungsref."],
    ["En proceso", "Processing", "En cours", "In Bearbeitung"],
    ["Tu compra", "Your purchase", "Votre achat", "Dein Einkauf"],
    ["Subtotal", "Subtotal", "Sous-total", "Zwischensumme"],
    ["Total pagado", "Total paid", "Total payé", "Bezahlt gesamt"],
    ["Envío a", "Ship to", "Livraison à", "Lieferung an"],
    ["Precios con IVA (21 %) incluido. Entrega estimada en 2–5 días laborables. Guarda tu nº de pedido por si necesitas contactarnos.", "Prices include VAT (21%). Estimated delivery in 2–5 working days. Keep your order number in case you need to contact us.", "Prix TTC (TVA 21 %). Livraison estimée sous 2 à 5 jours ouvrés. Conservez votre numéro de commande si vous devez nous contacter.", "Preise inkl. MwSt. (21 %). Voraussichtliche Lieferung in 2–5 Werktagen. Bewahre deine Bestellnummer auf, falls du uns kontaktieren musst."],
    ["Seguir comprando →", "Continue shopping →", "Continuer mes achats →", "Weiter einkaufen →"],
    ["¡Pago completado! Te enviaremos la confirmación por email", "Payment complete! We'll email you the confirmation", "Paiement validé ! Nous vous enverrons la confirmation par e-mail", "Zahlung abgeschlossen! Wir senden dir die Bestätigung per E-Mail"],
    ["Pago cancelado. Tu carrito sigue guardado", "Payment cancelled. Your cart is still saved", "Paiement annulé. Votre panier est conservé", "Zahlung abgebrochen. Dein Warenkorb ist gespeichert"],
    ["No se pudo iniciar el pago", "Payment could not be started", "Impossible de lancer le paiement", "Zahlung konnte nicht gestartet werden"],
    ["El carrito está vacío", "The cart is empty", "Le panier est vide", "Der Warenkorb ist leer"],
    // Atributos
    ["Abrir carrito", "Open cart", "Ouvrir le panier", "Warenkorb öffnen"],
    ["Carrito", "Cart", "Panier", "Warenkorb"],
    ["Cerrar", "Close", "Fermer", "Schließen"],
    ["Añadir uno", "Add one", "Ajouter un", "Eins hinzufügen"],
    ["Quitar uno", "Remove one", "Retirer un", "Eins entfernen"],
    ["Eliminar del carrito", "Remove from cart", "Retirer du panier", "Aus dem Warenkorb entfernen"],
    ["Correo electrónico", "Email address", "Adresse e-mail", "E-Mail-Adresse"],
    ["Detalle del producto", "Product details", "Détail du produit", "Produktdetails"],
    ["Juego", "Game", "Jeu", "Spiel"],
    ["Precio máximo", "Maximum price", "Prix maximum", "Höchstpreis"],
    ["Precio mínimo", "Minimum price", "Prix minimum", "Mindestpreis"],
    ["Productos anteriores", "Previous products", "Produits précédents", "Vorherige Produkte"],
    ["Productos siguientes", "Next products", "Produits suivants", "Nächste Produkte"],
    ["Secciones", "Sections", "Sections", "Bereiche"],
    ["Máx.", "Max.", "Max.", "Max."],
    ["Mín.", "Min.", "Min.", "Min."],
    ["tu@email.com", "you@email.com", "vous@email.com", "du@email.com"],
    ["Idioma", "Language", "Langue", "Sprache"],
    ["Oferta", "Sale", "Promo", "Angebot"],
    ["TacoStore · Inicio", "TacoStore · Home", "TacoStore · Accueil", "TacoStore · Startseite"],
  ];
  const COL = { en: 1, fr: 2, de: 3 };
  const DICT = new Map(T.map((r) => [r[0], r]));

  // Nombres de producto: "Booster box FB01 (24 sobres)", "Sobre FB09 Dual Evolution"…
  const W = {
    box: { en: "Booster box", fr: "Display", de: "Display" },
    pack: { en: "Booster pack", fr: "Booster", de: "Booster" },
    packs: { en: "packs", fr: "boosters", de: "Booster" },
  };
  const name = (s, l) => s
    .replace(/^Booster box /, W.box[l] + " ")
    .replace(/^Sobre /, W.pack[l] + " ")
    .replace(/\((\d+) sobres\)/, (_, n) => `(${n} ${W.packs[l]})`);
  const isName = (s) => /^(Booster box |Sobre )/.test(s);

  // Frases con datos variables: [patrón, {en, fr, de}]
  const P = [
    [/^Añadido: (.+)$/, { en: (m) => `Added: ${name(m[1], "en")}`, fr: (m) => `Ajouté : ${name(m[1], "fr")}`, de: (m) => `Hinzugefügt: ${name(m[1], "de")}` }],
    [/^Puesto (\d+)$/, { en: (m) => `No. ${m[1]}`, fr: (m) => `N° ${m[1]}`, de: (m) => `Platz ${m[1]}` }],
    [/^(\d+) productos$/, { en: (m) => `${m[1]} products`, fr: (m) => `${m[1]} produits`, de: (m) => `${m[1]} Produkte` }],
    [/^(\d+) de (\d+) productos$/, { en: (m) => `${m[1]} of ${m[2]} products`, fr: (m) => `${m[1]} sur ${m[2]} produits`, de: (m) => `${m[1]} von ${m[2]} Produkten` }],
    [/^Has visto los (\d+) productos$/, { en: (m) => `You've seen all ${m[1]} products`, fr: (m) => `Vous avez vu les ${m[1]} produits`, de: (m) => `Du hast alle ${m[1]} Produkte gesehen` }],
    [/^(.+) \/ ud\.$/, { en: (m) => `${m[1]} / unit`, fr: (m) => `${m[1]} / unité`, de: (m) => `${m[1]} / Stück` }],
    [/^Solo quedan (\d+) unidades$/, { en: (m) => `Only ${m[1]} left`, fr: (m) => `Plus que ${m[1]} en stock`, de: (m) => `Nur noch ${m[1]} verfügbar` }],
    [/^Solo quedan (\d+) de (.+)$/, { en: (m) => `Only ${m[1]} left of ${name(m[2], "en")}`, fr: (m) => `Plus que ${m[1]} de ${name(m[2], "fr")}`, de: (m) => `Nur noch ${m[1]} von ${name(m[2], "de")}` }],
    [/^Producto agotado: (.+)$/, { en: (m) => `Sold out: ${name(m[1], "en")}`, fr: (m) => `Épuisé : ${name(m[1], "fr")}`, de: (m) => `Ausverkauft: ${name(m[1], "de")}` }],
    [/^(.+): página en preparación$/, { en: (m) => `${tr(m[1], "en")}: page coming soon`, fr: (m) => `${tr(m[1], "fr")} : page en préparation`, de: (m) => `${tr(m[1], "de")}: Seite in Vorbereitung` }],
    [/^¡?Listo!? Te escribiremos a (.+)\.$/, { en: (m) => `Done! We'll write to ${m[1]}.`, fr: (m) => `C'est fait ! Nous écrirons à ${m[1]}.`, de: (m) => `Erledigt! Wir schreiben an ${m[1]}.` }],
    [/^Booster box precintada de (\w+) con 24 sobres de 12 cartas cada uno\. La opción más rentable para completar la colección\.$/, {
      en: (m) => `Sealed ${m[1]} booster box with 24 packs of 12 cards each. The best-value way to complete the set.`,
      fr: (m) => `Display scellé ${m[1]} de 24 boosters de 12 cartes chacun. L'option la plus rentable pour compléter la collection.`,
      de: (m) => `Versiegeltes ${m[1]}-Display mit 24 Boostern à 12 Karten. Die günstigste Art, das Set zu vervollständigen.` }],
    [/^Sobre individual de (\w+) con 12 cartas\. Ideal para probar suerte con la colección sin comprar la booster box entera\.$/, {
      en: (m) => `Single ${m[1]} pack with 12 cards. Perfect for trying your luck without buying the whole booster box.`,
      fr: (m) => `Booster ${m[1]} à l'unité de 12 cartes. Idéal pour tenter sa chance sans acheter tout le display.`,
      de: (m) => `Einzelner ${m[1]}-Booster mit 12 Karten. Ideal, um dein Glück zu versuchen, ohne das ganze Display zu kaufen.` }],
    [/^(.+) para Dragon Ball Super Card Game (.+)\.$/, { en: (m) => `${name(m[1], "en")} for Dragon Ball Super Card Game ${m[2]}.`, fr: (m) => `${name(m[1], "fr")} pour Dragon Ball Super Card Game ${m[2]}.`, de: (m) => `${name(m[1], "de")} für Dragon Ball Super Card Game ${m[2]}.` }],
  ];

  function tr(src, l) {
    if (l === "es" || !src) return src;
    const m = src.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const key = m[2].replace(/\s+/g, " ");
    if (!key) return src;
    let out = DICT.get(key)?.[COL[l]];
    if (out == null) for (const [re, f] of P) { const x = key.match(re); if (x) { out = f[l](x); break; } }
    if (out == null && isName(key)) out = name(key, l);
    return out == null ? src : m[1] + out + m[3];
  }

  let lang = "es";
  try { lang = localStorage.getItem(KEY) || ""; } catch (e) {}
  if (!LANGS[lang]) lang = (navigator.languages || [navigator.language || "es"]).map((x) => String(x).slice(0, 2)).find((x) => LANGS[x]) || "es";

  // Texto original de cada nodo/atributo, para poder volver a cualquier idioma
  const orig = new WeakMap(), last = new WeakMap();
  const ATTRS = ["placeholder", "aria-label", "alt", "title"];
  const skip = (el) => !el || el.closest("script,style,.lang-menu");

  function doText(n) {
    if (skip(n.parentElement)) return;
    const cur = n.nodeValue;
    let src = cur;
    if (last.has(n) && last.get(n) === cur) src = orig.get(n); else orig.set(n, cur);
    const out = tr(src, lang);
    last.set(n, out);
    if (out !== cur) n.nodeValue = out;
  }
  function doAttrs(el) {
    if (skip(el)) return;
    let o = orig.get(el), lt = last.get(el);
    if (!o) { o = {}; lt = {}; orig.set(el, o); last.set(el, lt); }
    for (const a of ATTRS) {
      const cur = el.getAttribute(a);
      if (cur == null) continue;
      if (lt[a] !== cur) o[a] = cur;
      const out = tr(o[a], lang);
      lt[a] = out;
      if (out !== cur) el.setAttribute(a, out);
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return doText(root);
    if (root.nodeType !== 1) return;
    doAttrs(root);
    root.querySelectorAll("*").forEach(doAttrs);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) doText(n);
  }

  let busy = false;
  const mo = new MutationObserver((list) => {
    if (busy) return;
    busy = true;
    for (const m of list) {
      if (m.type === "characterData") doText(m.target);
      else if (m.type === "attributes") doAttrs(m.target);
      else m.addedNodes.forEach(walk);
    }
    mo.takeRecords();
    busy = false;
  });

  // Selector de idioma junto al carrito
  const GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>';
  const cartBtn = document.getElementById("openCart");
  const box = document.createElement("div");
  box.className = "lang";
  box.innerHTML = `<button type="button" class="lang-btn" id="langBtn" aria-haspopup="true" aria-expanded="false">${GLOBE}<span id="langCode"></span></button>
    <ul class="lang-menu" id="langMenu" role="menu" hidden>${Object.entries(LANGS).map(([k, v]) => `<li role="none"><button type="button" role="menuitemradio" data-lang="${k}" lang="${k}"><b>${k.toUpperCase()}</b>${v}</button></li>`).join("")}</ul>`;
  cartBtn.parentNode.insertBefore(box, cartBtn);
  const btn = box.querySelector("#langBtn"), menu = box.querySelector("#langMenu");
  const open = (v) => { menu.hidden = !v; btn.setAttribute("aria-expanded", String(v)); };
  btn.addEventListener("click", (e) => { e.stopPropagation(); open(menu.hidden); });
  document.addEventListener("click", (e) => { if (!box.contains(e.target)) open(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
  menu.addEventListener("click", (e) => { const b = e.target.closest("[data-lang]"); if (b) { setLang(b.dataset.lang); open(false); btn.focus(); } });

  function setLang(l) {
    lang = l;
    window.tsLang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.documentElement.lang = l;
    box.querySelector("#langCode").textContent = l.toUpperCase();
    btn.setAttribute("aria-label", `${tr("Idioma", l)}: ${LANGS[l]}`);
    menu.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.lang === l)));
    busy = true; walk(document.body); mo.takeRecords(); busy = false;
    window.updateLogo && requestAnimationFrame(() => dispatchEvent(new Event("resize")));
  }
  window.tsT = (s) => tr(s, lang);

  setLang(lang);
  mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
})();
