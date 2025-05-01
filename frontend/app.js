const API_URL = 'http://localhost:3000/api';

let token = null;
let isLogin = true;

const listingsGrid = document.getElementById('listingsGrid');
const authSection = document.getElementById('authSection');
const authTitle = document.getElementById('authTitle');
const authForm = document.getElementById('authForm');
const authToggle = document.getElementById('authToggle');
const authMessage = document.getElementById('authMessage');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

function showAuthSection() {
  authSection.classList.remove('hidden');
}

function hideAuthSection() {
  authSection.classList.add('hidden');
  authMessage.textContent = '';
  authForm.reset();
}

function toggleAuthMode() {
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? 'Login' : 'Sign Up';
  authToggle.textContent = isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login';
  authMessage.textContent = '';
  authForm.reset();
}

async function fetchListings() {
  try {
    const res = await fetch(`${API_URL}/listings`);
    const data = await res.json();
    renderListings(data);
  } catch (error) {
    console.error('Error fetching listings:', error);
  }
}

function renderListings(listings) {
  listingsGrid.innerHTML = '';
  if (listings.length === 0) {
    listingsGrid.innerHTML = '<p>No listings available.</p>';
    return;
  }
  listings.forEach(listing => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded shadow p-4 flex flex-col';
    card.innerHTML = `
      <img src="${listing.image || 'https://via.placeholder.com/300x200'}" alt="${listing.title}" class="rounded mb-4 object-cover h-48 w-full" />
      <h3 class="text-lg font-semibold mb-2">${listing.title}</h3>
      <p class="text-gray-600 mb-2">${listing.location}</p>
      <p class="text-red-600 font-bold mb-4">${listing.price} USD / night</p>
    `;
    listingsGrid.appendChild(card);
  });
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = authForm.email.value.trim();
  const password = authForm.password.value.trim();
  if (!email || !password) {
    authMessage.textContent = 'Please enter email and password.';
    return;
  }
  const endpoint = isLogin ? 'login' : 'register';
  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      hideAuthSection();
      alert('Authentication successful!');
    } else {
      authMessage.textContent = data.message || 'Authentication failed.';
    }
  } catch (error) {
    authMessage.textContent = 'Error connecting to server.';
  }
}

authForm.addEventListener('submit', handleAuthSubmit);
authToggle.addEventListener('click', toggleAuthMode);
loginBtn.addEventListener('click', () => {
  isLogin = true;
  authTitle.textContent = 'Login';
  authToggle.textContent = "Don't have an account? Sign Up";
  showAuthSection();
});
signupBtn.addEventListener('click', () => {
  isLogin = false;
  authTitle.textContent = 'Sign Up';
  authToggle.textContent = 'Already have an account? Login';
  showAuthSection();
});

  
// Initial fetch of listings
fetchListings();
