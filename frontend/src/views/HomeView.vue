<script setup>
import { ref, computed } from "vue";

const loading = ref(false);
const error = ref(false);

let products = ref([]);
let currentFilterSelected = ref("nom");
let namesToFilter = ref("");

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}

async function fetchProducts() {
  loading.value = true;
  error.value = false;

  try {
    const res = await fetch('http://127.0.0.1:3000/api/products');
    products.value = await res.json();
    changeCurrentFilter('nom');
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function changeCurrentFilter(filter) {
  currentFilterSelected.value = filter;
  if (filter === "nom") {
    products.value.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  } else if (filter === "prix") {
    products.value.sort((a, b) => {
      if (a.originalPrice < b.originalPrice) {
        return -1;
      }
      if (a.originalPrice > b.originalPrice) {
        return 1;
      }
      return 0;
    });
  }
}

// Logic
const filteredProduct = computed(() => {
  let filteredProduct = products.value
  
  if(namesToFilter.value.length > 0) {
    filteredProduct = filteredProduct.filter(
      product => product.name.toLowerCase().includes(namesToFilter.value.toLowerCase())
    );
  }
  
  return filteredProduct;
})

fetchProducts();
</script>

<template>
  <div>
    <h1 class="text-center mb-4">Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            <span class="input-group-text">Filtrage</span>
            <input v-model="namesToFilter"
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              data-test-filter
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-primary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-test-sorter
          >
            Trier par {{ currentFilterSelected }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a @click= "changeCurrentFilter('nom')" class="dropdown-item" href="#"> Nom </a>
            </li>
            <li>
              <a @click= "changeCurrentFilter('prix')" class="dropdown-item" href="#" data-test-sorter-price>
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-4" data-test-loading>
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4" role="alert" data-test-error>
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div class="row">
      <div class="col-md-4 mb-4" v-for="product in filteredProduct" data-test-product :key="product">
        <div class="card">
          <RouterLink :to="{ name: 'Product', params: { productId: product.id } }">
            <img
              :src= "product.pictureUrl"
              data-test-product-picture
              class="card-img-top"
            />
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink
                data-test-product-name
                :to="{ name: 'Product', params: { productId: product.id } }"
              >
              {{product.name}}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>
              {{product.description}}
            </p>
            <p class="card-text">
              Vendeur :
              <RouterLink
                data-test-product-seller
                :to="{ name: 'User', params: { userId: product.sellerId } }"
              >
              {{product.seller.username}}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>
              En cours jusqu'au {{formatDate(product.endDate)}}
            </p>
            <p class="card-text" data-test-product-price>Prix actuel : {{product.originalPrice}} €</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
