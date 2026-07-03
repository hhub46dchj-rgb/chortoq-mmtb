const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB ulandi...');

        await User.deleteMany({});
        await Post.deleteMany({});

        const admin = new User({
            username: 'admin',
            password: process.env.ADMIN_PASSWORD,
            role: 'admin',
            fullName: 'Admin'
        });
        await admin.save();
        console.log('Admin yaratildi!');

        const samplePosts = [
            {
                title: 'CHORTOQMMTB Yangi O\'quv Yili Boshlandi!',
                content: '2025-2026 o\'quv yili uchun barcha talabalar va o\'qituvchilarni tabriklaymiz! Yangi o\'quv yili 1-sentabrdan boshlandi. Barcha talabalar va o\'qituvchilarga muvaffaqiyat tilaymiz.\n\nYangi o\'quv yilida bizning muassasada yangi yo\'nalishlar va dasturlar ishga tushiriladi. Batafsil ma\'lumot uchun bizning ofisimizga murojaat qiling.',
                category: 'yangiliklar',
                author: admin._id,
                image: '',
                views: 125,
                tags: ['yangi o\'quv yili', 'tabrik']
            },
            {
                title: 'Rahbariyat - Bizning Jamoa',
                content: 'CHORTOQMMTB rahbariyati:\n\nDirektor: Karimov A.B.\nO\'rinbosar: Rashidov D.K.\n\nBizning tajribali jamoamiz sifatli ta\'lim berish uchun harakat qilmoqda.',
                category: 'rahbariyat',
                author: admin._id,
                image: '',
                views: 89,
                tags: ['rahibariyat', 'jamoa']
            },
            {
                title: 'Asosiy Muassasalar Haqida',
                content: 'CHORTOQMMTB quyidagi muassasalarni o\'z ichiga oladi:\n\n1. Asosiy bino - 3 qavatli\n2. Sport zal\n3. Axborot markazi\n4. Oshxona\n5. Laboratoriya\n\nBarcha muassasalar zamonaviy jihozlangan.',
                category: 'muassasalar',
                author: admin._id,
                image: '',
                views: 67,
                tags: ['muassasalar', 'binolar']
            },
            {
                title: '2025-2026 Statistik Ma\'lumotlar',
                content: 'Joriy yil statistikasi:\n\nJami talabalar: 1,250\nJami o\'qituvchilar: 85\nSinf xonalari: 32\nKompyuter xonalari: 4\n\nBarcha ko\'rsatkichlar o\'tgan yilga nisbatan yaxshilandi.',
                category: 'statistika',
                author: admin._id,
                image: '',
                views: 234,
                tags: ['statistika', 'raqamlar']
            },
            {
                title: 'Yangi Vakansiyalar Ochildi!',
                content: 'Quyidagi lavozimlar uchun vakansiyalar mavjud:\n\n1. Matematika o\'qituvchisi - 1 ta\n2. Informatika o\'qituvchisi - 1 ta\n3. Tarix o\'qituvchisi - 1 ta\n\nArizalar 15-sentabrga qadar qabul qilinadi.',
                category: 'vakansiyalar',
                author: admin._id,
                image: '',
                views: 156,
                tags: ['vakansiyalar', 'ish']
            },
            {
                title: 'Virtual Qabulxona',
                content: 'Virtual qabulxona orqali siz:\n\n- Savol-javob berishingiz\n- Takliflar kiritishingiz\n- Shikoyatlar yozishingiz\n- Batafsil ma\'lumot olishingiz mumkin\n\nBizning raqamimiz: +998 (69) 412-34-56',
                category: 'virtual-qabulxona',
                author: admin._id,
                image: '',
                views: 45,
                tags: ['qabulxona', 'aloqa']
            },
            {
                title: 'Galereya - Suratlar',
                content: 'Bizning muassasadagi eng go\'zal lahzalar. Tez orada yangi suratlar qo\'shiladi.\n\nTadbirlar, marosimlar va boshqa voqealar suratlari.',
                category: 'galereya',
                author: admin._id,
                image: '',
                views: 78,
                tags: ['galereya', 'suratlar']
            }
        ];

        for (const postData of samplePosts) {
            const post = new Post(postData);
            await post.save();
        }

        console.log(`${samplePosts.length} ta namuna ma\'lumot yaratildi!`);
        console.log('Seed tugadi!');
        
        process.exit(0);
    } catch (error) {
        console.error('Seed xatosi:', error.message);
        process.exit(1);
    }
};

seedData();
