
/* =================================
   PART 7: FUNCTIONAL PAGINATION
================================= */


/* =========================================
   ZOREVN: FILTERED PRODUCT PAGINATION
========================================= */

$(document).ready(function () {
    const productsPerPage = 12;

    const $grid = $("#productGrid");
    const $pagination = $("#pagination");
    const $numbers = $("#paginationNumbers");
    const $prev = $("#prevPage");
    const $next = $("#nextPage");
    const $count = $("#listingCount");

    if (!$grid.length || !$pagination.length) return;

    const $allProducts = $grid.children(".product-card");
    let filteredProducts = [];
    let currentPage = 1;

    // Empty-state message for categories without products
    let $emptyState = $("#catalogEmptyState");

    if (!$emptyState.length) {
        $emptyState = $("<div>", {
            id: "catalogEmptyState",
            class: "catalog-empty-state",
            role: "status",
            text: "No products found in this collection yet. Please check back soon."
        });

        $grid.after($emptyState);
    }

    function collectFilteredProducts() {
        filteredProducts = $allProducts.filter(function () {
            return $(this).attr("data-filter-match") === "true";
        }).toArray();
    }

    function renderPage() {
        const totalProducts = filteredProducts.length;
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;

        // Hide every card first
        $allProducts.prop("hidden", true);

        // Show only cards on the current page
        filteredProducts.forEach(function (card, index) {
            card.hidden = !(index >= start && index < end);
        });

        // Product count
        $count.text(
            totalProducts + (totalProducts === 1 ? " PRODUCT" : " PRODUCTS")
        );

        // Empty state
        $emptyState.toggle(totalProducts === 0);

        // Pagination buttons
        $numbers.empty();

        for (let page = 1; page <= totalPages; page++) {
            const $button = $("<button>", {
                type: "button",
                class: "pagination-number" +
                    (page === currentPage ? " is-active" : ""),
                text: page,
                "aria-label": "Page " + page
            });

            if (page === currentPage) {
                $button.attr("aria-current", "page");
            }

            $button.on("click", function () {
                goToPage(page);
            });

            $numbers.append($button);
        }

        $prev.prop("disabled", currentPage <= 1);
        $next.prop("disabled", currentPage >= totalPages);

        // $pagination.toggle(totalPages > 1);

            $pagination.show();
    }

    function refreshProducts() {
        collectFilteredProducts();
        currentPage = 1;
        renderPage();
    }

    function goToPage(page) {
        const totalPages = Math.ceil(
            filteredProducts.length / productsPerPage
        );

        if (page < 1 || page > totalPages) return;

        currentPage = page;
        renderPage();

        const listing = document.getElementById("productListing");

        if (listing) {
            listing.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }

    $prev.on("click", function () {
        goToPage(currentPage - 1);
    });

    $next.on("click", function () {
        goToPage(currentPage + 1);
    });

    // React whenever audience or product type changes
    document.addEventListener("zorevn:filters-changed", function () {
        refreshProducts();
    });

    // Initial render
    refreshProducts();
});
