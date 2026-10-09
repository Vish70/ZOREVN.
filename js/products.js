
/* =========================================
   ZOREVN: AUDIENCE + PRODUCT TYPE FILTERS
========================================= */

$(document).ready(function () {
    const categories = {
        men: {
            title: "Men's Collection",
            types: [
                { label: "ALL", value: "all" },
                { label: "T-SHIRT", value: "tshirt" },
                { label: "SHIRT", value: "shirt" },
                { label: "JEANS", value: "jeans" },
                { label: "SHOES", value: "shoes" }
            ]
        },

        women: {
            title: "Women's Collection",
            types: [
                { label: "ALL", value: "all" },
                { label: "TOPS", value: "tops" },
                { label: "JEANS", value: "jeans" },
                { label: "KURTI", value: "kurti" },
                { label: "JACKETS", value: "jackets" }
            ]
        },

        tech: {
            title: "Technology Collection",
            types: [
                { label: "ALL", value: "all" },
                { label: "EARPHONES", value: "earphones" },
                { label: "HEADPHONES", value: "headphones" },
                { label: "POWER BANK", value: "power-bank" },
                { label: "CABLES", value: "cables" }
            ]
        }
    };

    const $audienceButtons = $("#audienceToggle [data-audience]");
    const $typeToggle = $("#productTypeToggle");
    const $listingTitle = $("#listingTitle");
    const $productGrid = $("#productGrid");

    let activeAudience = "men";
    let activeType = "all";

    if (!$typeToggle.length || !$productGrid.length) return;

    // Generate product-type buttons from category data
    function renderProductTypes() {
        const audience = categories[activeAudience];

        $typeToggle.empty();

        audience.types.forEach(function (type) {
            const $button = $("<button>", {
                type: "button",
                class: "product-type-pill" +
                    (type.value === activeType ? " is-active" : ""),
                text: type.label,
                "data-type": type.value,
                "aria-pressed": type.value === activeType ? "true" : "false"
            });

            $button.on("click", function () {
                activeType = type.value;

                renderProductTypes();
                applyFilters();
            });

            $typeToggle.append($button);
        });
    }

    // Update audience button appearance
    function updateAudienceButtons() {
        $audienceButtons.each(function () {
            const isActive = $(this).attr("data-audience") === activeAudience;

            $(this)
                .toggleClass("is-active", isActive)
                .attr("aria-pressed", isActive ? "true" : "false");
        });
    }

    // Filter product cards by audience and product type
    function applyFilters() {
        const $cards = $productGrid.children(".product-card");

        $cards.each(function () {
            const $card = $(this);
            const cardAudience = String($card.attr("data-category") || "").toLowerCase();
            const cardType = String($card.attr("data-type") || "").toLowerCase();

            const audienceMatches = cardAudience === activeAudience;
            const typeMatches = activeType === "all" || cardType === activeType;

            $card.attr(
                "data-filter-match",
                audienceMatches && typeMatches ? "true" : "false"
            );
        });

        $listingTitle.text(categories[activeAudience].title);

        // Tell pagination to update using the new filtered products
        document.dispatchEvent(
            new CustomEvent("zorevn:filters-changed", {
                detail: {
                    audience: activeAudience,
                    type: activeType
                }
            })
        );
    }

    // Audience selection
    $audienceButtons.on("click", function () {
        const selectedAudience = String($(this).attr("data-audience") || "");

        if (!categories[selectedAudience]) return;

        activeAudience = selectedAudience;
        activeType = "all";

        updateAudienceButtons();
        renderProductTypes();
        applyFilters();
    });

    // Initial state
    updateAudienceButtons();
    renderProductTypes();
    applyFilters();

    // Allow future scripts to read the current selection
    window.ZorevnCatalog = {
        getAudience: function () {
            return activeAudience;
        },
        getType: function () {
            return activeType;
        },
        getCategories: function () {
            return categories;
        }
    };
});
