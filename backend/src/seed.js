import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Timeline from './models/Timeline.js';
import Project from './models/Project.js';

dotenv.config();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected for seeding'))
    .catch((err) => {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
    });

// Admin user
const admin = {
    email: 'super@admin.com',
    password: 'Admin123',
    isAdmin: true,
};

// Timeline data from About.tsx
const timelineItems = [
    {
        year: 'January 2024 - Currently',
        title: 'Full Stack Developer',
        location: 'Code SARL - Jounieh, Lebanon',
        category: 'work',
        bullets: [
            'Mastery of front-end and back-end technologies.',
            'Effective collaboration with teams to achieve project objectives.',
            'Creation of complete web applications, from design to production.'
        ],
        order: 0
    },
    {
        year: 'February 2020 - September 2022',
        title: 'Maintenance team manager',
        location: 'GCS Computers Pro - Sarba, Lebanon',
        category: 'work',
        bullets: [
            'Close collaboration within a dynamic team.',
            'Evolution at the heart of a workshop specializing in the complete repair of various electronic devices.',
            'Active participation in repair and maintenance projects.'
        ],
        order: 1
    },
    {
        year: 'September 2019 - January 2020',
        title: 'Cashier',
        location: 'Morgan\'s Lane - Kaslik, Lebanon',
        category: 'work',
        bullets: [
            'Development of essential skills in the accurate and efficient processing of financial transactions.',
            'Commitment to exceptional customer service.',
            'Warm welcome to customers.'
        ],
        order: 2
    },
    {
        year: 'June 2019 - August 2019',
        title: 'Versatile Employee',
        location: 'McDonald\'s - Kaslik, Lebanon',
        category: 'work',
        bullets: [
            'Acquisition of extensive experience in various operational areas.',
            'Inventory management.',
            'Customer service.'
        ],
        order: 3
    },
    {
        year: 'September 2023 - Currently',
        title: 'L2 Computer Science',
        location: 'University of Rouen Normandy - Rouen, France',
        category: 'education',
        order: 4
    },
    {
        year: 'September 2022 - June 2023',
        title: 'L1 IEEA',
        location: 'University of Rouen Normandy - Rouen, France',
        category: 'education',
        order: 5
    },
    {
        year: 'September 2019 - June 2020',
        title: 'French Scientific Baccalaureate - Biology',
        location: 'Sainte-Famille Française - Jounieh, Liban',
        category: 'education',
        order: 6
    }
];

// Project data from Work.tsx
const projects = [
    {
        title: "Unreal Engine Adventure Game",
        category: "Game Development",
        description: "A third-person adventure game with realistic visuals and physics.",
        longDescription: "A fully immersive third-person adventure game developed with Unreal Engine. Features include realistic visuals with dynamic lighting, advanced AI behavior systems, interactive environments, and a unique narrative that adapts to player choices. The game incorporates custom character animations and a procedurally generated world.",
        technologies: ["Unreal Engine", "C++", "Blueprint", "Niagara VFX", "SpeedTree"],
        images: ["game1.jpg", "game2.jpg", "game3.jpg"],
        order: 0
    },
    {
        title: "React E-Commerce Platform",
        category: "Web Development",
        description: "A full-featured online shopping platform with payment integration.",
        longDescription: "A comprehensive e-commerce solution built with React and Node.js. The platform includes user authentication, product management, shopping cart functionality, checkout process with Stripe integration, and an admin dashboard for inventory management. The application is fully responsive and optimized for performance.",
        technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe API", "Redux"],
        images: ["ecommerce1.jpg", "ecommerce2.jpg"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com/nakhlerizk/ecommerce",
        order: 1
    },
    {
        title: "Unity Mobile Game",
        category: "Game Development",
        description: "A casual mobile game with engaging mechanics and monetization.",
        longDescription: "A casual mobile game developed with Unity targeting iOS and Android platforms. The game features intuitive touch controls, progressive difficulty, in-app purchases, ad integration, and social features. Special attention was paid to optimizing performance for a wide range of mobile devices.",
        technologies: ["Unity", "C#", "Mobile SDK", "Firebase", "AdMob"],
        images: ["mobile-game1.jpg", "mobile-game2.jpg"],
        order: 2
    },
    {
        title: "Real-time Analytics Dashboard",
        category: "Full Stack Development",
        description: "A data visualization platform with real-time updates and filters.",
        longDescription: "An advanced analytics dashboard that provides real-time data visualization for business metrics. The application features interactive charts, customizable widgets, data filtering capabilities, and automated reporting. Built with a scalable architecture to handle large datasets with minimal latency.",
        technologies: ["Vue.js", "D3.js", "Node.js", "WebSockets", "PostgreSQL"],
        images: ["dashboard1.jpg", "dashboard2.jpg"],
        order: 3
    },
    {
        title: "Godot 2D Platformer",
        category: "Game Development",
        description: "A retro-styled 2D platformer with unique puzzle elements.",
        longDescription: "A 2D platformer game developed with Godot Engine featuring pixel art graphics, custom physics, innovative puzzle mechanisms, and a chiptune soundtrack. The game includes multiple levels with increasing difficulty, boss fights, and hidden collectibles throughout the game world.",
        technologies: ["Godot Engine", "GDScript", "Pixel Art", "Tiled Map Editor"],
        images: ["platformer1.jpg", "platformer2.jpg"],
        order: 4
    },
    {
        title: "Progressive Web App",
        category: "Frontend Development",
        description: "A PWA with offline capabilities and push notifications.",
        longDescription: "A Progressive Web Application that delivers a native-like experience across all devices. The app features offline functionality using Service Workers, push notifications, home screen installation, and optimized loading times. The interface is fully responsive and adapts to different screen sizes.",
        technologies: ["React", "TypeScript", "PWA", "Service Workers", "IndexedDB"],
        images: ["pwa1.jpg", "pwa2.jpg"],
        githubUrl: "https://github.com/nakhlerizk/pwa-project",
        order: 5
    }
];

// Seed database
const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Timeline.deleteMany({});
        await Project.deleteMany({});

        console.log('Data cleared');

        // Create admin user
        const createdUser = await User.create(admin);
        console.log(`Admin user created: ${createdUser.email}`);

        // Create timeline items
        const createdTimelineItems = await Timeline.insertMany(timelineItems);
        console.log(`${createdTimelineItems.length} timeline items created`);

        // Create projects
        const createdProjects = await Project.insertMany(projects);
        console.log(`${createdProjects.length} projects created`);

        console.log('Database seeded successfully');
        process.exit();
    } catch (error) {
        console.error(`Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

seedDatabase(); 