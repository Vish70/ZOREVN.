document.addEventListener("DOMContentLoaded", function () {
    const searchToggle = document.getElementById("searchToggle");
    const searchOverlay = document.getElementById("searchOverlay");
    const searchClose = document.getElementById("searchClose");
    const searchInput = document.getElementById("productSearchInput");
    const searchClear = document.getElementById("searchClear");
    const searchResults = document.getElementById("searchResults");
    const searchStatus = document.getElementById("searchStatus");
    const productGrid = document.getElementById("productGrid");
    const productListing = document.getElementById("productListing");

    if (
        !searchToggle ||
        !searchOverlay ||
        !searchInput ||
        !searchResults ||
        !productGrid ||
        !productListing
    ) {
        return;
    }

    let selectedProductId = "";
    let dispatchingSearchUpdate = false;
    let selectionHistoryActive = false;

    // Add the BACK TO ALL PRODUCTS button without editing HTML.
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "search-back-to-catalog";
    backButton.hidden = true;
    backButton.setAttribute("aria-label", "Back to all products");

    backButton.innerHTML = `
        <i class="ri-arrow-left-line" aria-hidden="true"></i>
        <span>BACK TO ALL PRODUCTS</span>
    `;

    const listingHeader = productListing.querySelector(".listing-header");

    if (listingHeader) {
        listingHeader.insertAdjacentElement("afterend", backButton);
    } else {
        productGrid.insertAdjacentElement("beforebegin", backButton);
    }

    // Style the new button without changing your CSS files.
    const backButtonStyles = document.createElement("style");
    backButtonStyles.id = "zorevn-search-back-styles";

    backButtonStyles.textContent = `
        .search-back-to-catalog {
            align-items: center;
            justify-content: center;
            gap: 9px;
            margin: 0 0 22px;
            padding: 12px 16px;
            border: 1px solid #E5E5E3;
            border-radius: 0;
            background: #FFFFFF;
            color: #111111;
            font-family: Manrope, sans-serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            line-height: 1.5;
            cursor: pointer;
            transition: background 0.2s ease, color 0.2s ease;
        }

        .search-back-to-catalog:not([hidden]) {
            display: inline-flex;
        }

        .search-back-to-catalog[hidden] {
            display: none !important;
        }

        .search-back-to-catalog:hover {
            background: #111111;
            color: #FFFFFF;
        }

        .search-back-to-catalog:focus-visible {
            outline: 2px solid #111111;
            outline-offset: 3px;
        }
    `;

    document.head.appendChild(backButtonStyles);

    function normalizeText(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getTypeKeywords(type) {
        const keywords = {
            tshirt: "t shirt t-shirt t-shirts tshirts tee tees",
            shirt: "shirts formal shirt casual shirt",
            jeans: "jean denim denims",
            shoes: "shoe footwear sneakers trainers",
            tops: "top blouse tops",
            shirts: "shirt shirts",
            jackets: "jacket coat outerwear",
            earphones: "earphone earbuds ear buds wireless earbuds",
            headphones: "headphone headphones headset",
            "power-bank": "power bank charger portable charger",
            cables: "cable wire charging cable"
        };

        return keywords[type] || "";
    }

    function getProductData(card) {
        const nameElement = card.querySelector(".product-name");
        const brandElement = card.querySelector(".product-brand");
        const imageElement = card.querySelector(".product-image");

        const name = nameElement ? nameElement.textContent.trim() : "";
        const brand = brandElement ? brandElement.textContent.trim() : "";
        const image = imageElement ? imageElement.getAttribute("src") : "";
        const imageAlt = imageElement ? imageElement.getAttribute("alt") : "";
        const audience = card.getAttribute("data-category") || "";
        const type = card.getAttribute("data-type") || "";
        const id = card.getAttribute("data-product-id") || "";

        return {
            id,
            name,
            brand,
            image,
            imageAlt,
            audience,
            type,
            card,
            searchText: normalizeText([
                name,
                brand,
                imageAlt,
                audience,
                type,
                getTypeKeywords(type)
            ].join(" "))
        };
    }

    function getAllProducts() {
        return Array.from(
            productGrid.querySelectorAll(".product-card")
        ).map(getProductData);
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function createProductResult(product) {
        const link = createElement("a", "search-result-card");

        // Clicking this result will filter the current page, not navigate.
        link.href = "#productListing";
        link.dataset.productId = product.id;

        link.setAttribute(
            "aria-label",
            "Show " + product.name + " in the product collection"
        );

        const image = createElement("img", "search-result-image");
        image.src = product.image || "";
        image.alt = product.imageAlt || product.name;
        image.loading = "lazy";

        const copy = createElement("div", "search-result-copy");

        const brand = createElement(
            "p",
            "search-result-brand",
            product.brand || "ZOREVN SELECTION"
        );

        const name = createElement(
            "h3",
            "search-result-name",
            product.name || "Untitled product"
        );

        const meta = createElement("div", "search-result-meta");

        const category = [product.audience, product.type]
            .filter(Boolean)
            .join(" / ");

        meta.appendChild(
            createElement("span", "", category || "Product")
        );

        const arrow = createElement("i", "ri-arrow-up-right-line");
        arrow.setAttribute("aria-hidden", "true");
        meta.appendChild(arrow);

        copy.append(brand, name, meta);
        link.append(image, copy);

        return link;
    }

    function showEmptyState(title, message) {
        const emptyState = createElement("div", "search-empty");

        const emptyTitle = createElement(
            "h3",
            "search-empty-title",
            title
        );

        const emptyText = createElement(
            "p",
            "search-empty-text",
            message
        );

        emptyState.append(emptyTitle, emptyText);
        searchResults.replaceChildren(emptyState);
    }

    function renderSearchResults() {
        const query = normalizeText(searchInput.value);

        searchResults.replaceChildren();

        if (searchClear) {
            searchClear.hidden = query.length === 0;
        }

        if (!query) {
            if (searchStatus) {
                searchStatus.textContent =
                    "Start typing to discover products.";
            }

            showEmptyState(
                "Your next discovery starts here.",
                "Search by product name, brand or category."
            );

            return;
        }

        const queryWords = query.split(" ");

        const matchingProducts = getAllProducts().filter(function (product) {
            return (
                product.name &&
                queryWords.every(function (word) {
                    return product.searchText.includes(word);
                })
            );
        });

        if (matchingProducts.length === 0) {
            if (searchStatus) {
                searchStatus.textContent = "No matching products found.";
            }

            showEmptyState(
                "No products found.",
                "Try a different name, brand or category."
            );

            return;
        }

        if (searchStatus) {
            searchStatus.textContent =
                matchingProducts.length +
                (matchingProducts.length === 1
                    ? " matching product"
                    : " matching products") +
                ' for "' + searchInput.value.trim() + '".';
        }

        const fragment = document.createDocumentFragment();

        matchingProducts.forEach(function (product) {
            fragment.appendChild(createProductResult(product));
        });

        searchResults.appendChild(fragment);
    }

    // Save the audience/category filter separately from search.
    function captureCatalogMatches() {
        productGrid.querySelectorAll(".product-card").forEach(function (card) {
            const currentMatch = card.getAttribute("data-filter-match");

            card.dataset.catalogMatch =
                currentMatch === null ? "true" : currentMatch;
        });
    }

    function updateBackButton() {
        const hasActiveSearch =
            normalizeText(searchInput.value).length > 0 ||
            selectedProductId.length > 0;

        backButton.hidden = !hasActiveSearch;
    }

    function notifyPagination() {
        dispatchingSearchUpdate = true;

        document.dispatchEvent(
            new CustomEvent("zorevn:filters-changed")
        );

        dispatchingSearchUpdate = false;
    }

    function applyCatalogFilter() {
        const query = normalizeText(searchInput.value);
        const queryWords = query ? query.split(" ") : [];

        getAllProducts().forEach(function (product) {
            const catalogMatch =
                product.card.dataset.catalogMatch !== "false";

            const matchesQuery =
                !query ||
                queryWords.every(function (word) {
                    return product.searchText.includes(word);
                });

            const matchesSelectedProduct =
                !selectedProductId ||
                product.id === selectedProductId;

            const matches = query
                ? matchesQuery && matchesSelectedProduct
                : catalogMatch;

            product.card.setAttribute(
                "data-filter-match",
                matches ? "true" : "false"
            );
        });

        updateBackButton();
        notifyPagination();
    }

    function openSearch() {
        searchOverlay.classList.add("is-open");
        searchOverlay.setAttribute("aria-hidden", "false");

        searchToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("search-is-open");

        renderSearchResults();

        window.requestAnimationFrame(function () {
            searchInput.focus();
        });
    }

    function closeSearch(restoreFocus) {
        searchOverlay.classList.remove("is-open");
        searchOverlay.setAttribute("aria-hidden", "true");

        searchToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("search-is-open");

        if (restoreFocus !== false) {
            searchToggle.focus();
        }
    }

    // Restore the full catalog without refreshing the page.
    function restoreCatalog() {
        selectedProductId = "";
        searchInput.value = "";
        selectionHistoryActive = false;

        renderSearchResults();
        closeSearch(false);
        applyCatalogFilter();

        updateBackButton();
    }

    searchToggle.addEventListener("click", openSearch);

    if (searchClose) {
        searchClose.addEventListener("click", function () {
            closeSearch();
        });
    }

    searchOverlay
        .querySelectorAll("[data-search-close]")
        .forEach(function (button) {
            button.addEventListener("click", function () {
                closeSearch();
            });
        });

    // Live product filtering while typing.
    searchInput.addEventListener("input", function () {
        selectedProductId = "";

        renderSearchResults();
        applyCatalogFilter();
    });

    if (searchClear) {
        searchClear.addEventListener("click", function () {
            searchInput.value = "";
            selectedProductId = "";

            renderSearchResults();
            applyCatalogFilter();

            searchInput.focus();
        });
    }

    // This is the visible page-level Back button.
    backButton.addEventListener("click", function () {
        restoreCatalog();
    });

    // Select a search result and show only that product on the same page.
    searchResults.addEventListener("click", function (event) {
        const result = event.target.closest(
            ".search-result-card[data-product-id]"
        );

        if (!result) {
            return;
        }

        event.preventDefault();

        selectedProductId = result.dataset.productId || "";

        // Add a browser history entry so browser Back can restore the catalog.
        try {
            const currentState =
                history.state && typeof history.state === "object"
                    ? history.state
                    : {};

            history.pushState(
                {
                    ...currentState,
                    zorevnSearchSelection: true,
                    zorevnProductId: selectedProductId
                },
                "",
                window.location.href
            );

            selectionHistoryActive = true;
        } catch (error) {
            // The visible page-level Back button will still work.
            selectionHistoryActive = false;
        }

        applyCatalogFilter();
        closeSearch(false);

        window.requestAnimationFrame(function () {
            const selectedCard = getAllProducts().find(function (product) {
                return product.id === selectedProductId;
            });

            if (selectedCard) {
                selectedCard.card.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        });
    });

    // Enter selects the first result.
    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            const firstResult = searchResults.querySelector(
                ".search-result-card[data-product-id]"
            );

            if (firstResult) {
                event.preventDefault();
                firstResult.click();
            }
        }
    });

    // Escape closes the search overlay.
    document.addEventListener("keydown", function (event) {
        if (
            event.key === "Escape" &&
            searchOverlay.classList.contains("is-open")
        ) {
            closeSearch();
        }
    });

    // Browser Back restores the collection if a search result was selected.
    window.addEventListener("popstate", function () {
        if (selectionHistoryActive) {
            restoreCatalog();
        }
    });

    // Keep the existing MEN/WOMEN and product-type filtering compatible.
    document.addEventListener("zorevn:filters-changed", function () {
        if (dispatchingSearchUpdate) {
            return;
        }

        window.setTimeout(function () {
            captureCatalogMatches();
            applyCatalogFilter();
        }, 0);
    });

    captureCatalogMatches();
    renderSearchResults();
    updateBackButton();
});