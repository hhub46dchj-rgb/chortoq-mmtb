# CHORTOQMMTB - Rasmiy Sayt v2.0

Zamonaviy backend va frontend bilan to'liq loyiha.

## O'rnatish

### 1. MongoDB o'rnatish
MongoDB o'rnatilgan bo'lishi kerak. Agar yo'q bo'lsa:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# yoki Docker bilan
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Loyihani clone qilish va o'rnatish
```bash
cd chortoq-mmtb
npm install
```

### 3. Database'ni to'ldirish (ixtiyoriy)
```bash
npm run seed
```

### 4. Serverni ishga tushirish
```bash
# Ishlab chiqish rejimida
npm run dev

# yoki ishlab chiqarish rejimida
npm start
```

### 5. Brauzerda ochish
```
http://localhost:5000
```

## Admin Kirish

- **Login:** admin
- **Parol:** ChMmtb!2026#

## API Endpoints

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish
- `GET /api/auth/me` - Profil ma'lumotlari
- `PUT /api/auth/profile` - Profilni yangilash

### Posts
- `GET /api/posts` - Barcha ma'lumotlar
- `GET /api/posts/:id` - Bitta ma'lumot
- `POST /api/posts` - Yangi ma'lumot (admin)
- `PUT /api/posts/:id` - Yangilash (admin)
- `DELETE /api/posts/:id` - O'chirish (admin)

### Stats
- `GET /api/stats` - Statistika (admin)

## Xususiyatlari

- Dark/Light mode
- Responsive dizayn
- Animatsiyalar
- Admin dashboard
- Rasm yuklash
- Qidiruv
- Statistika grafigi
- JWT avtorizatsiya
