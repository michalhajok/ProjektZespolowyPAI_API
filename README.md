# Wypożyczalnia Sprzętu - Backend API

REST API dla aplikacji wypożyczalni sprzętu zbudowane w Node.js z Express.js i MongoDB.

## 📋 Funkcjonalności

### API Endpoints

- ✅ **Auth**: Rejestracja, logowanie z JWT
- ✅ **Users**: Zarządzanie profilami użytkowników
- ✅ **Categories**: CRUD kategorii sprzętu
- ✅ **Equipment**: CRUD sprzętu z filtrowaniem
- ✅ **Reservations**: System rezerwacji z statusami
- ✅ **Reviews**: System ocen i komentarzy

### Bezpieczeństwo

- ✅ JWT Authentication & Authorization
- ✅ Rate limiting (100 req/15min, auth: 5 req/15min)
- ✅ Helmet.js security headers
- ✅ Input validation z express-validator
- ✅ Password hashing z bcrypt
- ✅ CORS protection

## 🛠 Technologie

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MongoDB z Mongoose
- **Auth**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limit
- **Utils**: compression, morgan

## 🚀 Instalacja i uruchomienie

### Wymagania

- Node.js >= 18
- MongoDB (lokalnie lub cloud)
- npm lub yarn

### Krok po kroku

1. **Klonowanie repozytorium**

```bash
git clone https://github.com/michalhajok/ProjektZespolowyPAI_API.git
cd ProjektZespolowyPAI_API
```

2. **Instalacja zależności**

```bash
npm install
```

3. **Konfiguracja środowiska**
   Skopiuj `.env.example` do `.env`:

```bash
cp .env.example .env
```

Edytuj `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/rental_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES=7d
NODE_ENV=development
PORT=6000
```

4. **Uruchomienie MongoDB**

```bash
# Lokalnie
mongod

# Lub użyj MongoDB Atlas (cloud)
```

5. **Uruchomienie serwera**

```bash
# Development
npm run dev

# Production
npm start
```

API będzie dostępne pod: `http://localhost:6000`

## 📖 API Documentation

### Base URL

```
http://localhost:6000/api
```

### Uwierzytelnienie

Wszystkie chronione endpointy wymagają JWT token w nagłówku:

```
Authorization: Bearer <token>
```

### Endpoints

#### 🔐 Authentication

```
POST /auth/register     # Rejestracja użytkownika
POST /auth/login        # Logowanie
```

#### 👤 Users

```
GET    /users/me        # Profil użytkownika (wymagane auth)
PUT    /users/me        # Aktualizacja profilu (wymagane auth)
GET    /users           # Lista użytkowników (admin)
PUT    /users/:id       # Edycja użytkownika (admin)
DELETE /users/:id       # Usunięcie użytkownika (admin)
```

#### 📂 Categories

```
GET    /categories      # Lista kategorii
GET    /categories/:id  # Szczegóły kategorii
POST   /categories      # Nowa kategoria (admin)
PUT    /categories/:id  # Edycja kategorii (admin)
DELETE /categories/:id  # Usunięcie kategorii (admin)
```

#### 🔧 Equipment

```
GET    /equipment       # Lista sprzętu (+ filtrowanie)
GET    /equipment/:id   # Szczegóły sprzętu
POST   /equipment       # Nowy sprzęt (admin)
PUT    /equipment/:id   # Edycja sprzętu (admin)
DELETE /equipment/:id   # Usunięcie sprzętu (admin)
POST   /equipment/:id/views  # Zwiększenie liczby wyświetleń
```

#### 📅 Reservations

```
GET    /reservations    # Moje rezerwacje (user) / wszystkie (admin)
GET    /reservations/:id # Szczegóły rezerwacji
POST   /reservations    # Nowa rezerwacja (user)
PATCH  /reservations/:id # Zmiana statusu (admin/user)
DELETE /reservations/:id # Anulowanie (user w 24h)
```

#### ⭐ Reviews

```
GET    /reviews         # Lista recenzji (+ filtrowanie)
GET    /reviews/:id     # Szczegóły recenzji
POST   /reviews         # Nowa recenzja (user, po completed reservation)
PUT    /reviews/:id     # Edycja recenzji (autor)
DELETE /reviews/:id     # Usunięcie recenzji (autor/admin)
```

#### 🏥 Health

```
GET    /health          # Status API
```

### Query Parameters

#### Filtering Equipment

```
GET /equipment?category=64f...&status=available&limit=10&offset=0
```

#### Filtering Reviews

```
GET /reviews?equipment=64f...&rating=5&limit=20
```

## 📊 Data Models

### User

```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  role: 'user' | 'admin',
  isActive: Boolean,
  lastLogin: Date
}
```

### Category

```javascript
{
  name: String (unique),
  description: String,
  isActive: Boolean
}
```

### Equipment

```javascript
{
  name: String,
  description: String,
  category: ObjectId -> Category,
  specifications: {
    brand: String,
    model: String,
    serialNumber: String (unique),
    yearManufactured: Number,
    condition: 'new'|'excellent'|'good'|'fair'|'poor',
    technicalSpecs: Map<String>
  },
  availability: {
    status: 'available'|'reserved'|'rented'|'maintenance'|'retired',
    location: { branch, warehouse, shelf },
    quantity: Number,
    availableQuantity: Number
  },
  media: {
    images: [{ url, alt, isPrimary }],
    documents: [{ name, url, type }]
  },
  metadata: {
    views: Number,
    totalReservations: Number,
    averageRating: Number,
    reviewCount: Number
  }
}
```

### Reservation

```javascript
{
  user: ObjectId -> User,
  equipment: ObjectId -> Equipment,
  dates: { startDate: Date, endDate: Date },
  status: 'pending'|'approved'|'rented'|'completed'|'cancelled',
  history: [{ status, changedBy, reason, changedAt }]
}
```

### Review

```javascript
{
  user: ObjectId -> User,
  equipment: ObjectId -> Equipment,
  reservation: ObjectId -> Reservation,
  rating: Number (1-5),
  title: String,
  comment: String,
  isVerified: Boolean,
  helpfulVotes: Number
}
```

## 🔒 Bezpieczeństwo

### Rate Limiting

- **Ogólne**: 100 żądań / 15 minut / IP
- **Auth**: 5 żądań / 15 minut / IP
- **Configurowalne** przez zmienne środowiskowe

### Autoryzacja

```javascript
// Middleware przykład
router.put(
  "/equipment/:id",
  authenticate, // Sprawdź JWT
  authorize(["admin"]), // Tylko admin
  validateEquipment, // Walidacja danych
  updateEquipment
);
```

### Validation

Wszystkie inputy są walidowane przez express-validator:

- Email format
- Password strength (min. 8 znaków)
- ObjectId validation
- Required fields
- Data types i ranges

## 🗄️ Baza danych

### Indeksy MongoDB

```javascript
// Equipment
{ category: 1, "availability.status": 1 }
{ name: "text", description: "text" }
{ "metadata.averageRating": -1 }
{ "specifications.serialNumber": 1 } // unique, sparse

// Reviews
{ user: 1, equipment: 1 } // unique - jeden review na sprzęt
{ equipment: 1, rating: -1 }
```

### Migracje

Brak formalnych migracji - używamy Mongoose schema evolution.

## 🛠 Development

### Scripts

```bash
npm run dev      # Development z nodemon
npm start        # Production
npm test         # Testy (TODO)
```

### Environment Variables

| Zmienna       | Opis                         | Wymagane                  |
| ------------- | ---------------------------- | ------------------------- |
| `MONGODB_URI` | Connection string do MongoDB | ✅                        |
| `JWT_SECRET`  | Klucz do podpisywania JWT    | ✅                        |
| `JWT_EXPIRES` | Czas życia JWT               | ❌ (default: 7d)          |
| `NODE_ENV`    | Środowisko                   | ❌ (default: development) |
| `PORT`        | Port serwera                 | ❌ (default: 6000)        |

### Error Handling

```javascript
// Wszystkie errory są przechwytywane przez:
app.use(errorHandler);

// Response format:
{
  status: 'error' | 'success',
  message: 'Human readable message',
  data: {} // tylko dla success
}
```

### Logging

Używamy **morgan** w trybie "combined" dla logów HTTP.

## 🧪 Testing

```bash
# TODO: Implementacja testów
npm test
```

Planowane:

- Unit tests (Jest)
- Integration tests (Supertest)
- Database tests (MongoDB Memory Server)

## 📈 Performance

### Optimizations

- **Compression** middleware dla gzip
- **MongoDB indexes** dla często używanych queries
- **Pagination** dla dużych listach
- **Lean queries** gdzie nie potrzeba full Mongoose document

### Monitoring

- Health endpoint: `GET /api/health`
- Error logging z stack traces
- Process crash handling

## 🚀 Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure `MONGODB_URI` for production DB
- [ ] Enable CORS for production domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL/TLS
- [ ] Configure logging
- [ ] Set up monitoring

### Docker (TODO)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 6000
CMD ["npm", "start"]
```

## 🤝 Zespół

- **Jakub Mośny** - Kierownik projektu, dokumentacja, testy
- **Krystian Gwiżdż** - Frontend (UI/UX, Next.js)
- **Piotr Ćwikła** - Baza danych (modele, relacje)
- **Michał Hajok** - Backend (API, logika biznesowa)

## 📞 Troubleshooting

### Częste problemy

1. **MongoDB connection error**

   ```bash
   # Sprawdź czy MongoDB działa
   mongosh
   # Sprawdź connection string w .env
   ```

2. **JWT errors**

   ```bash
   # Upewnij się że JWT_SECRET jest ustawione
   # Sprawdź czy token nie wygasł
   ```

3. **Rate limit exceeded**
   ```bash
   # Poczekaj 15 minut lub zmień IP
   ```

---

**Politechnika Częstochowska**  
Katedra Informatyki  
Projekt zespołowy 2025/2026
