
/* =========================================
   ZOREVN PRODUCT PAGE LOGIC
========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const products = window.ZOREVN_PRODUCTS || {};

    const page = document.getElementById("productDetailPage");
    const notFound = document.getElementById("productNotFound");

    const breadcrumbName = document.getElementById("breadcrumbProductName");
    const categoryLink = document.getElementById("productCategoryLink");
    const categoryLabel = document.getElementById("productCategory");

    const mainImage = document.getElementById("mainProductImage");
    const thumbnails = document.getElementById("productThumbnails");

    const brandElement = document.getElementById("productBrand");
    const nameElement = document.getElementById("productName");
    const ratingValue = document.getElementById("productRatingValue");
    const ratingLabel = document.querySelector(".detail-rating-label");
    const availability = document.getElementById("productAvailability");

    const shortDescription = document.getElementById("productShortDescription");
    const fullDescription = document.getElementById("productFullDescription");

    const sizeSection = document.getElementById("productSizeSection");
    const sizeOptions = document.getElementById("productSizeOptions");
    const selectedSizeLabel = document.getElementById("selectedSizeLabel");
    const sizeMessage = document.getElementById("productSizeMessage");

    const amazonLink = document.getElementById("amazonProductLink");

    const videoSection = document.getElementById("productVideoSection");
    const videoElement = document.getElementById("productVideo");

    const highlightsGrid = document.getElementById("productHighlights");
    const relatedGrid = document.getElementById("relatedProducts");

    const footerYear = document.getElementById("footerYear");

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    const product = productId ? products[productId] : null;

    if (!page || !notFound) return;

    if (!product) {
        page.hidden = true;
        notFound.hidden = false;
        document.title = "Product Not Found | ZOREVN.";
        return;
    }

    page.hidden = false;
    notFound.hidden = true;

    let selectedSize = "";

    const audienceNames = {
        men: "MEN",
        women: "WOMEN",
        tech: "TECH"
    };

    const categoryNames = {
        tshirt: "T-SHIRT",
        shirt: "SHIRT",
        jeans: "JEANS",
        shoes: "SHOES",
        tops: "TOPS",
        shirts: "SHIRTS",
        jackets: "JACKETS",
        earphones: "EARPHONES",
        headphones: "HEADPHONES",
        "power-bank": "POWER BANK",
        cables: "CABLES"
    };

    const audience = audienceNames[product.category] || "COLLECTION";
    const type = categoryNames[product.type] || String(product.type || "").toUpperCase();

    const productTitle = product.name || "Product Details";

    document.title = productTitle + " | ZOREVN.";

    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
        descriptionMeta.setAttribute(
            "content",
            productTitle + " — discover curated finds on ZOREVN."
        );
    }

    if (breadcrumbName) breadcrumbName.textContent = productTitle;

    if (categoryLink) {
        categoryLink.textContent = audience;
        categoryLink.href = "index.html#productListing";
    }

    if (categoryLabel) {
        categoryLabel.textContent =
            type ? audience + " / " + type : audience;
    }

    if (brandElement) brandElement.textContent = product.brand || "ZOREVN.";
    if (nameElement) nameElement.textContent = productTitle;

    if (ratingValue) {
        ratingValue.textContent = product.rating || "—";
    }

    if (ratingLabel) {
        ratingLabel.textContent = product.ratingLabel
            ? "(" + product.ratingLabel + ")"
            : "";
    }

    if (availability) {
        availability.textContent =
            product.availability || "Check retailer availability";
    }

    if (shortDescription) {
        shortDescription.textContent =
            product.description || "Check the retailer listing for more details.";
    }

    if (fullDescription) {
        fullDescription.textContent =
            product.description || "Check the retailer listing for more details.";
    }

    /* IMAGE GALLERY */

    const galleryImages =
        Array.isArray(product.gallery) && product.gallery.length
            ? product.gallery
            : [product.image].filter(Boolean);

    function setMainImage(src, alt, selectedButton) {
        if (!mainImage || !src) return;

        mainImage.src = src;
        mainImage.alt = alt || productTitle;

        thumbnails.querySelectorAll(".product-thumbnail").forEach(function (button) {
            const active = button === selectedButton;

            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", active ? "true" : "false");
        });
    }

    if (mainImage && galleryImages.length) {
        mainImage.src = galleryImages[0];
        mainImage.alt = productTitle;

        thumbnails.replaceChildren();

        galleryImages.forEach(function (src, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className =
                "product-thumbnail" + (index === 0 ? " is-active" : "");
            button.setAttribute(
                "aria-label",
                "View product image " + (index + 1)
            );
            button.setAttribute(
                "aria-pressed",
                index === 0 ? "true" : "false"
            );

            const image = document.createElement("img");
            image.src = src;
            image.alt = productTitle + " — image " + (index + 1);
            image.loading = "lazy";

            button.appendChild(image);

            button.addEventListener("click", function () {
                setMainImage(src, productTitle, button);
            });

            thumbnails.appendChild(button);
        });
    }

    /* VIDEO
       The section appears only when a real video path is provided.
    */

    if (videoSection && videoElement && product.video) {
        videoElement.poster = product.image || "";
        videoElement.src = product.video;
        videoSection.hidden = false;

        videoElement.addEventListener("error", function () {
            videoSection.hidden = true;
        }, { once: true });
    } else if (videoSection && videoElement) {
        videoSection.hidden = true;
        videoElement.removeAttribute("src");
        videoElement.load();
    }

    /* SIZE SELECTOR */

    const sizes = Array.isArray(product.sizes) ? product.sizes : [];

    function renderSizes() {
        if (!sizeSection || !sizeOptions) return;

        sizeOptions.replaceChildren();

        if (!sizes.length) {
            sizeSection.hidden = true;
            selectedSize = "";
            return;
        }

        sizeSection.hidden = false;

        sizes.forEach(function (size) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "product-size-button";
            button.textContent = size;
            button.setAttribute("aria-pressed", "false");
            button.setAttribute("aria-label", "Select size " + size);

            button.addEventListener("click", function () {
                selectedSize = size;

                sizeOptions.querySelectorAll(".product-size-button")
                    .forEach(function (otherButton) {
                        const active = otherButton === button;

                        otherButton.classList.toggle("is-selected", active);
                        otherButton.setAttribute(
                            "aria-pressed",
                            active ? "true" : "false"
                        );
                    });

                if (selectedSizeLabel) {
                    selectedSizeLabel.textContent = "Selected: " + size;
                }

                if (sizeMessage) {
                    sizeMessage.textContent = "";
                    sizeMessage.classList.remove("is-error");
                }
            });

            sizeOptions.appendChild(button);
        });

        if (selectedSizeLabel) {
            selectedSizeLabel.textContent = "Select a size";
        }

        if (sizeMessage) {
            sizeMessage.textContent = "";
            sizeMessage.classList.remove("is-error");
        }
    }

    renderSizes();

    /* AMAZON CTA
       amazonUrl is the real product/affiliate URL when supplied.
       If it is blank, use an Amazon India search as a temporary fallback.
    */

    if (amazonLink) {
        amazonLink.addEventListener("click", function (event) {
            event.preventDefault();

            if (sizes.length && !selectedSize) {
                if (sizeMessage) {
                    sizeMessage.textContent =
                        "Please select a size before continuing.";
                    sizeMessage.classList.add("is-error");
                }

                if (sizeSection) {
                    sizeSection.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }

                if (sizeOptions) {
                    const firstSizeButton =
                        sizeOptions.querySelector(".product-size-button");

                    if (firstSizeButton) firstSizeButton.focus();
                }

                return;
            }

            let destination = String(product.amazonUrl || "").trim();

            if (!destination) {
                let searchTerm = productTitle;

                if (selectedSize) {
                    searchTerm += " size " + selectedSize;
                }

                destination =
                    "https://www.amazon.in/s?k=" +
                    encodeURIComponent(searchTerm);
            }

            window.open(destination, "_blank", "noopener,noreferrer");
        });
    }

    /* PRODUCT HIGHLIGHTS */

    if (highlightsGrid) {
        highlightsGrid.replaceChildren();

        const highlights = Array.isArray(product.highlights)
            ? product.highlights
            : [];

        highlights.forEach(function (text, index) {
            const card = document.createElement("article");
            card.className = "product-highlight-card";

            const number = document.createElement("span");
            number.className = "product-highlight-number";
            number.textContent = String(index + 1).padStart(2, "0");

            const paragraph = document.createElement("p");
            paragraph.textContent = text;

            card.append(number, paragraph);
            highlightsGrid.appendChild(card);
        });
    }

    /* RELATED PRODUCTS */

    function createRelatedProductCard(item) {
        const link = document.createElement("a");
        link.className = "related-product-card";
        link.href = "product.html?id=" + encodeURIComponent(item.id);

        const imageWrap = document.createElement("div");
        imageWrap.className = "related-product-image-wrap";

        const image = document.createElement("img");
        image.className = "related-product-image";
        image.src = item.image;
        image.alt = item.name;
        image.loading = "lazy";

        imageWrap.appendChild(image);

        const brand = document.createElement("p");
        brand.className = "related-product-brand";
        brand.textContent = item.brand || "ZOREVN. SELECTION";

        const name = document.createElement("h3");
        name.className = "related-product-name";
        name.textContent = item.name;

        const viewLink = document.createElement("span");
        viewLink.className = "related-product-link";
        viewLink.append(
            document.createTextNode("VIEW DETAILS ")
        );

        const arrow = document.createElement("i");
        arrow.className = "ri-arrow-right-line";
        arrow.setAttribute("aria-hidden", "true");

        viewLink.appendChild(arrow);
        link.append(imageWrap, brand, name, viewLink);

        return link;
    }

    if (relatedGrid) {
        relatedGrid.replaceChildren();

        const allProducts = Object.values(products);

        let relatedProducts = allProducts.filter(function (item) {
            return (
                item.id !== product.id &&
                item.category === product.category
            );
        });

        if (relatedProducts.length < 4) {
            const additionalProducts = allProducts.filter(function (item) {
                return (
                    item.id !== product.id &&
                    !relatedProducts.some(function (existing) {
                        return existing.id === item.id;
                    })
                );
            });

            relatedProducts = relatedProducts.concat(additionalProducts);
        }

        relatedProducts.slice(0, 4).forEach(function (item) {
            if (item.image && item.id) {
                relatedGrid.appendChild(createRelatedProductCard(item));
            }
        });
    }
});
