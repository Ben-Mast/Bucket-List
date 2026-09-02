import {
  createCategory,
  createBucketListItem,
  deleteCategory,
  deleteBucketListItem,
  createTagOption,
  deleteTagOption,
  fetchCategories,
  fetchTagOptions,
  fetchBucketListItems,
  getCurrentSession,
  loginWithPassword,
  logout,
  onAuthStateChange,
  updateCategory,
  updateTagOption,
  updateBucketListItem,
} from "./supabase.js";

const SHARED_ACCOUNT_EMAIL = "benjaminmst@gmail.com";

const sessionLoading = document.querySelector("#session-loading");
const accessGate = document.querySelector("#access-gate");
const bucketApp = document.querySelector("#bucket-app");
const loginForm = document.querySelector("#login-form");
const passwordInput = document.querySelector("#login-password");
const loginButton = document.querySelector("#login-button");
const loginError = document.querySelector("#login-error");
const logoutButton = document.querySelector("#logout-button");
const appError = document.querySelector("#app-error");
const toolsSection = document.querySelector("#tools-section");
const toggleAddFormButton = document.querySelector("#toggle-add-form");
const addItemForm = document.querySelector("#add-item-form");
const cancelAddButton = document.querySelector("#cancel-add");
const addCategorySelect = document.querySelector("#add-category");
const addLocationSelect = document.querySelector("#add-location");
const addWeatherSelect = document.querySelector("#add-weather");
const manageCategoriesButton = document.querySelector("#manage-categories");
const categoryPanel = document.querySelector("#category-panel");
const addCategoryForm = document.querySelector("#add-category-form");
const categoryList = document.querySelector("#category-list");
const addLocationForm = document.querySelector("#add-location-form");
const addWeatherForm = document.querySelector("#add-weather-form");
const locationList = document.querySelector("#location-list");
const weatherList = document.querySelector("#weather-list");
const itemSearch = document.querySelector("#item-search");
const toggleFiltersButton = document.querySelector("#toggle-filters");
const filterPanel = document.querySelector("#filter-panel");
const statusFilter = document.querySelector("#status-filter");
const categoryFilter = document.querySelector("#category-filter");
const locationFilter = document.querySelector("#location-filter");
const weatherFilter = document.querySelector("#weather-filter");
const list = document.querySelector("#bucket-list-items");
const listMessage = document.querySelector("#list-message");
const itemCount = document.querySelector("#item-count");

let loadedForUserId = null;
let allItems = [];
let categories = [];
let locations = [];
let weatherTags = [];

const ICON_PATHS = {
  check: ["m5 12 4 4L19 6"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"],
  plus: ["M12 5v14", "M5 12h14"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M7 7l1 13h8l1-13", "M10 11v5", "M14 11v5"],
};

function createIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  ICON_PATHS[name].forEach((pathData) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.append(path);
  });
  return svg;
}

function configureIconButton(button, icon, label, className) {
  button.className = className;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.append(createIcon(icon));
}

function showError(element, message) {
  element.textContent = message;
  element.hidden = false;
}

function clearAppError() {
  appError.hidden = true;
  appError.textContent = "";
}

function showActionError(action) {
  showError(appError, `We couldn’t ${action}. Please try again.`);
}

function getLoginErrorMessage(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (message.includes("invalid login credentials")) {
    return "That access code is incorrect. Try again.";
  }

  if (message.includes("email not confirmed")) {
    return "The shared account still needs to be confirmed in Supabase.";
  }

  return "We couldn’t unlock the list. Please try again.";
}

function showListMessage(message, type = "empty") {
  listMessage.textContent = message;
  listMessage.className = `list-message list-message--${type}`;
  listMessage.hidden = false;
}

function setFormBusy(form, busy) {
  form.querySelectorAll("input, textarea, select, button").forEach((control) => {
    control.disabled = busy;
  });
}

function getTrimmedValue(formData, field) {
  return String(formData.get(field) ?? "").trim();
}

function createFormField(labelText, control, wide = false) {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  wrapper.className = `form-field${wide ? " form-field--wide" : ""}`;
  label.htmlFor = control.id;
  label.textContent = labelText;
  wrapper.append(label, control);
  return wrapper;
}

function populateCategorySelect(select, selectedId = "") {
  select.replaceChildren();
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "No category";
  select.append(emptyOption);
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    option.selected = category.id === selectedId;
    select.append(option);
  });
}

function populateCategoryFilter(selectedId = "") {
  categoryFilter.replaceChildren();
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All categories";
  categoryFilter.append(allOption);
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    option.selected = category.id === selectedId;
    categoryFilter.append(option);
  });
}

function createCategorySelect(id, selectedId = "") {
  const select = document.createElement("select");
  select.id = id;
  select.name = "categoryId";
  populateCategorySelect(select, selectedId);
  return select;
}

function createTagSelect(id, name, options, emptyLabel, selectedId = "") {
  const select = document.createElement("select");
  select.id = id;
  select.name = name;
  populateSimpleSelect(select, options, emptyLabel, selectedId);
  return select;
}

function populateSimpleSelect(select, options, emptyLabel, selectedId = "") {
  select.replaceChildren();
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = emptyLabel;
  select.append(empty);
  options.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.name;
    option.selected = entry.id === selectedId;
    select.append(option);
  });
}

function createEditForm(item, display) {
  const form = document.createElement("form");
  const titleInput = document.createElement("input");
  const descriptionInput = document.createElement("textarea");
  const categoryInput = createCategorySelect(`edit-category-${item.id}`, item.category_id ?? "");
  const locationInput = createTagSelect(`edit-location-${item.id}`, "locationId", locations, "No location", item.location_id ?? "");
  const weatherInput = createTagSelect(`edit-weather-${item.id}`, "weatherId", weatherTags, "No weather", item.weather_id ?? "");
  const actions = document.createElement("div");
  const saveButton = document.createElement("button");
  const cancelButton = document.createElement("button");

  form.className = "item-form edit-item-form";
  form.hidden = true;
  titleInput.id = `edit-title-${item.id}`;
  titleInput.name = "title";
  titleInput.type = "text";
  titleInput.maxLength = 200;
  titleInput.required = true;
  titleInput.value = item.title;
  titleInput.defaultValue = item.title;
  descriptionInput.id = `edit-description-${item.id}`;
  descriptionInput.name = "description";
  descriptionInput.rows = 3;
  descriptionInput.maxLength = 1000;
  descriptionInput.value = item.description ?? "";
  descriptionInput.defaultValue = item.description ?? "";
  actions.className = "form-actions";
  saveButton.type = "submit";
  cancelButton.type = "button";
  configureIconButton(saveButton, "check", "Save changes", "icon-button icon-button--confirm");
  configureIconButton(cancelButton, "close", "Cancel", "icon-button icon-button--quiet");
  actions.append(saveButton, cancelButton);
  form.append(
    createFormField("Title", titleInput, true),
    createFormField("Description", descriptionInput, true),
    createFormField("Category", categoryInput),
    createFormField("Location", locationInput),
    createFormField("Weather", weatherInput),
    actions,
  );

  cancelButton.addEventListener("click", () => {
    form.reset();
    form.hidden = true;
    display.hidden = false;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAppError();
    const formData = new FormData(form);
    const title = getTrimmedValue(formData, "title");
    if (!title) return;

    setFormBusy(form, true);
    try {
      await updateBucketListItem(item.id, {
        title,
        description: getTrimmedValue(formData, "description") || null,
        category_id: getTrimmedValue(formData, "categoryId") || null,
        location_id: getTrimmedValue(formData, "locationId") || null,
        weather_id: getTrimmedValue(formData, "weatherId") || null,
      });
      await loadBucketList();
    } catch (error) {
      console.error("Unable to edit bucket-list item:", error);
      showActionError("save those changes");
      setFormBusy(form, false);
    }
  });

  return form;
}

function createItemElement(item) {
  const listItem = document.createElement("li");
  const display = document.createElement("div");
  const checkbox = document.createElement("input");
  const content = document.createElement("div");
  const headingRow = document.createElement("div");
  const title = document.createElement("h3");
  const statusText = document.createElement("span");
  const actions = document.createElement("div");
  const editButton = document.createElement("button");
  const deleteButton = document.createElement("button");

  listItem.className = "bucket-list-item";
  listItem.classList.toggle("is-complete", item.completed);
  display.className = "item-display";
  checkbox.className = "item-checkbox";
  checkbox.type = "checkbox";
  checkbox.checked = item.completed;
  checkbox.setAttribute("aria-label", `${item.completed ? "Mark incomplete" : "Mark complete"}: ${item.title}`);
  content.className = "item-content";
  headingRow.className = "item-heading-row";
  title.textContent = item.title;
  statusText.className = "item-status-text";
  statusText.textContent = item.completed ? "Completed" : "Incomplete";
  headingRow.append(title, statusText);
  content.append(headingRow);

  if (item.description) {
    const description = document.createElement("p");
    description.className = "item-description";
    description.textContent = item.description;
    content.append(description);
  }

  if (item.category?.name) {
    const category = document.createElement("span");
    category.className = "item-category";
    category.textContent = item.category.name;
    content.append(category);
  }
  if (item.location?.name) {
    const location = document.createElement("span");
    location.className = "item-category item-location";
    location.textContent = item.location.name;
    content.append(location);
  }
  if (item.weather?.name) {
    const weather = document.createElement("span");
    weather.className = "item-category item-weather";
    weather.textContent = item.weather.name;
    content.append(weather);
  }

  actions.className = "item-actions";
  editButton.type = "button";
  deleteButton.type = "button";
  configureIconButton(editButton, "edit", "Edit item", "icon-button icon-button--quiet icon-button--small");
  configureIconButton(deleteButton, "trash", "Delete item", "icon-button icon-button--danger icon-button--small");
  actions.append(editButton, deleteButton);
  content.append(actions);
  display.append(checkbox, content);

  const editForm = createEditForm(item, display);
  editButton.addEventListener("click", () => {
    display.hidden = true;
    editForm.hidden = false;
    editForm.elements.title.focus();
  });

  checkbox.addEventListener("change", async () => {
    clearAppError();
    checkbox.disabled = true;
    const completed = checkbox.checked;
    try {
      await updateBucketListItem(item.id, {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      });
      await loadBucketList();
    } catch (error) {
      console.error("Unable to change completion status:", error);
      checkbox.checked = !completed;
      checkbox.disabled = false;
      showActionError("change that item’s status");
    }
  });

  deleteButton.addEventListener("click", async () => {
    const confirmed = window.confirm(`Delete “${item.title}” from the bucket list?`);
    if (!confirmed) return;

    clearAppError();
    editButton.disabled = true;
    deleteButton.disabled = true;
    checkbox.disabled = true;
    deleteButton.setAttribute("aria-busy", "true");
    try {
      await deleteBucketListItem(item.id);
      await loadBucketList();
    } catch (error) {
      console.error("Unable to delete bucket-list item:", error);
      editButton.disabled = false;
      deleteButton.disabled = false;
      checkbox.disabled = false;
      deleteButton.removeAttribute("aria-busy");
      showActionError("delete that item");
    }
  });

  listItem.append(display, editForm);
  return listItem;
}

function renderItems(items) {
  list.replaceChildren();

  if (items.length === 0) {
    const filtersActive = itemSearch.value.trim() || statusFilter.value !== "all" || categoryFilter.value || locationFilter.value || weatherFilter.value;
    showListMessage(filtersActive ? "No matches." : "No items yet.");
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => fragment.append(createItemElement(item)));
  list.append(fragment);
  listMessage.hidden = true;
}

function renderFilteredItems() {
  const query = itemSearch.value.trim().toLowerCase();
  const status = statusFilter.value;
  const categoryId = categoryFilter.value;
  const locationId = locationFilter.value;
  const weatherId = weatherFilter.value;
  toggleFiltersButton.classList.toggle("is-active", status !== "all" || Boolean(categoryId || locationId || weatherId));
  const filteredItems = allItems.filter((item) => {
    const matchesQuery = !query ||
      item.title.toLowerCase().includes(query) ||
      (item.category?.name ?? "").toLowerCase().includes(query) ||
      (item.location?.name ?? "").toLowerCase().includes(query) ||
      (item.weather?.name ?? "").toLowerCase().includes(query);
    const matchesStatus = status === "all" ||
      (status === "complete" && item.completed) ||
      (status === "incomplete" && !item.completed);
    const matchesCategory = !categoryId || item.category_id === categoryId;
    const matchesLocation = !locationId || item.location_id === locationId;
    const matchesWeather = !weatherId || item.weather_id === weatherId;
    return matchesQuery && matchesStatus && matchesCategory && matchesLocation && matchesWeather;
  });
  renderItems(filteredItems);
}

async function loadBucketList() {
  showListMessage("Loading our bucket list…", "loading");

  try {
    allItems = await fetchBucketListItems();
    renderFilteredItems();
  } catch (error) {
    console.error("Unable to load bucket-list items:", error);
    list.replaceChildren();
    showListMessage("We couldn’t load the bucket list. Check the Supabase connection and refresh the page.", "error");
  }
}

function renderCategoryList() {
  categoryList.replaceChildren();
  categories.forEach((category) => {
    const row = document.createElement("li");
    const name = document.createElement("span");
    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    row.className = "category-row";
    name.textContent = category.name;
    actions.className = "category-actions";
    editButton.type = "button";
    deleteButton.type = "button";
    configureIconButton(editButton, "edit", `Rename ${category.name}`, "icon-button icon-button--quiet icon-button--small");
    configureIconButton(deleteButton, "trash", `Delete ${category.name}`, "icon-button icon-button--danger icon-button--small");
    actions.append(editButton, deleteButton);
    row.append(name, actions);
    categoryList.append(row);

    editButton.addEventListener("click", async () => {
      const nextName = window.prompt("Category name", category.name)?.trim();
      if (!nextName || nextName === category.name) return;
      clearAppError();
      try {
        await updateCategory(category.id, nextName);
        await loadCategories();
        await loadBucketList();
      } catch (error) {
        console.error("Unable to rename category:", error);
        showActionError("rename that category");
      }
    });

    deleteButton.addEventListener("click", async () => {
      if (!window.confirm(`Delete category “${category.name}”? Items will keep their other details.`)) return;
      clearAppError();
      try {
        await deleteCategory(category.id);
        await loadCategories();
        await loadBucketList();
      } catch (error) {
        console.error("Unable to delete category:", error);
        showActionError("delete that category");
      }
    });
  });
}

function renderManagedOptions(options, targetList, table, label) {
  targetList.replaceChildren();
  options.forEach((entry) => {
    const row = document.createElement("li");
    const name = document.createElement("span");
    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");
    row.className = "category-row";
    name.textContent = entry.name;
    actions.className = "category-actions";
    editButton.type = deleteButton.type = "button";
    configureIconButton(editButton, "edit", `Rename ${entry.name}`, "icon-button icon-button--quiet icon-button--small");
    configureIconButton(deleteButton, "trash", `Delete ${entry.name}`, "icon-button icon-button--danger icon-button--small");
    actions.append(editButton, deleteButton);
    row.append(name, actions);
    targetList.append(row);
    editButton.addEventListener("click", async () => {
      const nextName = window.prompt(`${label} name`, entry.name)?.trim();
      if (!nextName || nextName === entry.name) return;
      try { await updateTagOption(table, entry.id, nextName); await loadCategories(); await loadBucketList(); }
      catch (error) { console.error(error); showActionError(`rename that ${label.toLowerCase()}`); }
    });
    deleteButton.addEventListener("click", async () => {
      if (!window.confirm(`Delete ${label.toLowerCase()} “${entry.name}”?`)) return;
      try { await deleteTagOption(table, entry.id); await loadCategories(); await loadBucketList(); }
      catch (error) { console.error(error); showActionError(`delete that ${label.toLowerCase()}`); }
    });
  });
}

async function loadCategories() {
  const selectedId = addCategorySelect.value;
  const selectedFilterId = categoryFilter.value;
  const selectedLocation = addLocationSelect.value;
  const selectedWeather = addWeatherSelect.value;
  const selectedLocationFilter = locationFilter.value;
  const selectedWeatherFilter = weatherFilter.value;
  [categories, locations, weatherTags] = await Promise.all([
    fetchCategories(), fetchTagOptions("locations"), fetchTagOptions("weather_tags"),
  ]);
  populateCategorySelect(addCategorySelect, selectedId);
  populateCategoryFilter(selectedFilterId);
  populateSimpleSelect(addLocationSelect, locations, "No location", selectedLocation);
  populateSimpleSelect(addWeatherSelect, weatherTags, "No weather", selectedWeather);
  populateSimpleSelect(locationFilter, locations, "All locations", selectedLocationFilter);
  populateSimpleSelect(weatherFilter, weatherTags, "All weather", selectedWeatherFilter);
  renderCategoryList();
  renderManagedOptions(locations, locationList, "locations", "Location");
  renderManagedOptions(weatherTags, weatherList, "weather_tags", "Weather");
}

function setAddFormOpen(open) {
  addItemForm.hidden = !open;
  toggleAddFormButton.setAttribute("aria-expanded", String(open));
  toggleAddFormButton.classList.toggle("is-active", open);
  toolsSection.hidden = addItemForm.hidden && categoryPanel.hidden;
  if (open) addItemForm.elements.title.focus();
  if (!open) addItemForm.reset();
}

async function applySession(session) {
  const user = session?.user ?? null;
  sessionLoading.hidden = true;

  if (!user) {
    loadedForUserId = null;
    bucketApp.hidden = true;
    accessGate.hidden = false;
    list.replaceChildren();
    setAddFormOpen(false);
    categoryPanel.hidden = true;
    toolsSection.hidden = true;
    manageCategoriesButton.classList.remove("is-active");
    manageCategoriesButton.setAttribute("aria-expanded", "false");
    itemSearch.value = "";
    statusFilter.value = "all";
    categoryFilter.value = "";
    locationFilter.value = "";
    weatherFilter.value = "";
    filterPanel.hidden = true;
    toggleFiltersButton.setAttribute("aria-expanded", "false");
    allItems = [];
    categories = [];
    locations = [];
    weatherTags = [];
    passwordInput.focus();
    return;
  }

  loginError.hidden = true;
  loginForm.reset();
  accessGate.hidden = true;
  bucketApp.hidden = false;

  if (loadedForUserId !== user.id) {
    loadedForUserId = user.id;
    await loadCategories();
    await loadBucketList();
  }
}

toggleAddFormButton.addEventListener("click", () => setAddFormOpen(addItemForm.hidden));
cancelAddButton.addEventListener("click", () => setAddFormOpen(false));
itemSearch.addEventListener("input", renderFilteredItems);
statusFilter.addEventListener("change", renderFilteredItems);
categoryFilter.addEventListener("change", renderFilteredItems);
locationFilter.addEventListener("change", renderFilteredItems);
weatherFilter.addEventListener("change", renderFilteredItems);
toggleFiltersButton.addEventListener("click", () => {
  const open = filterPanel.hidden;
  filterPanel.hidden = !open;
  toggleFiltersButton.setAttribute("aria-expanded", String(open));
});

manageCategoriesButton.addEventListener("click", () => {
  const open = categoryPanel.hidden;
  categoryPanel.hidden = !open;
  manageCategoriesButton.setAttribute("aria-expanded", String(open));
  manageCategoriesButton.classList.toggle("is-active", open);
  toolsSection.hidden = addItemForm.hidden && categoryPanel.hidden;
  if (open) addCategoryForm.elements.name.focus();
});

addCategoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAppError();
  const name = getTrimmedValue(new FormData(addCategoryForm), "name");
  if (!name) return;
  setFormBusy(addCategoryForm, true);
  try {
    const created = await createCategory(name);
    addCategoryForm.reset();
    setFormBusy(addCategoryForm, false);
    await loadCategories();
    addCategorySelect.value = created.id;
  } catch (error) {
    console.error("Unable to create category:", error);
    showActionError("add that category");
    setFormBusy(addCategoryForm, false);
  }
});

function bindTagAddForm(form, table, select) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = getTrimmedValue(new FormData(form), "name");
    if (!name) return;
    setFormBusy(form, true);
    try {
      const created = await createTagOption(table, name);
      form.reset();
      setFormBusy(form, false);
      await loadCategories();
      select.value = created.id;
    } catch (error) {
      console.error(error);
      showActionError("add that tag");
      setFormBusy(form, false);
    }
  });
}

bindTagAddForm(addLocationForm, "locations", addLocationSelect);
bindTagAddForm(addWeatherForm, "weather_tags", addWeatherSelect);

addItemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAppError();
  const formData = new FormData(addItemForm);
  const title = getTrimmedValue(formData, "title");
  if (!title) return;

  setFormBusy(addItemForm, true);
  try {
    await createBucketListItem({
      title,
      description: getTrimmedValue(formData, "description"),
      categoryId: getTrimmedValue(formData, "categoryId"),
      locationId: getTrimmedValue(formData, "locationId"),
      weatherId: getTrimmedValue(formData, "weatherId"),
    });
    setFormBusy(addItemForm, false);
    setAddFormOpen(false);
    await loadBucketList();
  } catch (error) {
    console.error("Unable to create bucket-list item:", error);
    showActionError("add that item");
    setFormBusy(addItemForm, false);
  }
});

passwordInput.addEventListener("input", () => {
  passwordInput.value = passwordInput.value.replace(/\D/g, "");
  loginError.hidden = true;
});

document.querySelectorAll("[data-digit]").forEach((button) => {
  button.addEventListener("click", () => {
    if (passwordInput.value.length < passwordInput.maxLength) {
      passwordInput.value += button.dataset.digit;
      passwordInput.dispatchEvent(new Event("input"));
    }
  });
});

document.querySelector('[data-action="clear"]').addEventListener("click", () => {
  passwordInput.value = "";
  passwordInput.focus();
});

document.querySelector('[data-action="backspace"]').addEventListener("click", () => {
  passwordInput.value = passwordInput.value.slice(0, -1);
  passwordInput.focus();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.hidden = true;
  loginButton.disabled = true;
  loginButton.setAttribute("aria-busy", "true");

  try {
    const session = await loginWithPassword(SHARED_ACCOUNT_EMAIL, passwordInput.value);
    await applySession(session);
  } catch (error) {
    showError(loginError, getLoginErrorMessage(error));
    passwordInput.value = "";
    passwordInput.focus();
  } finally {
    loginButton.disabled = false;
    loginButton.removeAttribute("aria-busy");
  }
});

logoutButton.addEventListener("click", async () => {
  clearAppError();
  logoutButton.disabled = true;
  logoutButton.setAttribute("aria-busy", "true");

  try {
    await logout();
    await applySession(null);
  } catch (error) {
    console.error("Unable to lock the list:", error);
    showActionError("lock the list");
  } finally {
    logoutButton.disabled = false;
    logoutButton.removeAttribute("aria-busy");
  }
});

onAuthStateChange((session) => {
  applySession(session);
});

getCurrentSession()
  .then(applySession)
  .catch((error) => {
    console.error("Unable to check the current session:", error);
    applySession(null);
    showError(loginError, "We couldn’t check access. Please refresh and try again.");
  });
