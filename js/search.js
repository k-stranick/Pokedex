const inputElement = document.querySelector("#search-input");
const search_icon = document.querySelector("#search-clear-icon");
const sort_wrapper = document.querySelector(".sort-wrapper");

inputElement.addEventListener("input", () => {
    handleInputChange(inputElement);
});
search_icon.addEventListener("click", handleSearchCloseOnClick);
sort_wrapper.addEventListener("click", handleSortIconOnClick);

function handleInputChange(inputElement) {
    const inputValue = inputElement.value;

    if (inputValue !== "") {
        document
            .querySelector("#search-clear-icon")
            .classList.add("search-clear-icon-visible");
    } else {
        document
            .querySelector("#search-clear-icon")
            .classList.remove("search-clear-icon-visible");
    }
}

function handleSearchCloseOnClick() {
    document.querySelector("#search-input").value = "";
    document
        .querySelector("#search-clear-icon")
        .classList.remove("search-clear-icon-visible");
}

function handleSortIconOnClick() {
    document
        .querySelector(".filter-wrapper")
        .classList.toggle("filter-wrapper-open");
    document.querySelector("body").classList.toggle("filter-wrapper-overlay");
}