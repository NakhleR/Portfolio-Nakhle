<?php

$sections = [
    'site' => [
        'label' => 'Identity & contact',
        'path' => '/',
        'fields' => [
            'name' => [
                'label' => 'Public name',
                'type' => 'text',
                'default' => 'Nakhle Rizk',
            ],
            'tagline' => [
                'label' => 'Navigation tagline',
                'type' => 'text',
                'default' => 'Developer & creative thinker',
            ],
            'email' => [
                'label' => 'Contact email',
                'type' => 'email',
                'default' => 'nakhler2k2@gmail.com',
            ],
            'phone' => [
                'label' => 'Phone number',
                'type' => 'text',
                'default' => '+33 7 74 81 21 04',
            ],
            'address' => [
                'label' => 'Public location',
                'type' => 'textarea',
                'default' => 'Rue de Fontenelle

Rouen 76000, France',
            ],
            'github' => [
                'label' => 'GitHub URL',
                'type' => 'url',
                'default' => 'https://github.com/NakhleR',
            ],
            'linkedin' => [
                'label' => 'LinkedIn URL',
                'type' => 'url',
                'default' => 'https://www.linkedin.com/in/nakhle-rizk-528129256/',
            ],
            'availability' => [
                'label' => 'Availability message',
                'type' => 'text',
                'default' => 'Based in Rouen · Open to opportunities in France & Europe',
            ],
            'map_label' => [
                'label' => 'Map label',
                'type' => 'text',
                'default' => 'Rue de Fontenelle, 76000 Rouen',
            ],
            'latitude' => [
                'label' => 'Latitude',
                'type' => 'number',
                'default' => 49.44303,
                'min' => -90,
                'max' => 90,
            ],
            'longitude' => [
                'label' => 'Longitude',
                'type' => 'number',
                'default' => 1.08613,
                'min' => -180,
                'max' => 180,
            ],
        ],
    ],
    'home' => [
        'label' => 'Homepage',
        'path' => '/',
        'fields' => [
            'hero' => [
                'label' => 'Banner heading (one line per row)',
                'type' => 'textarea',
                'default' => 'Built to be

explored.',
            ],
            'intro' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'I\'m Nakhle, a full stack developer based in Rouen, France. I build web and mobile applications and explore artificial intelligence. Open to projects and opportunities across France and Europe.',
            ],
            'disciplines' => [
                'label' => 'Showcase disciplines',
                'type' => 'repeater',
                'default' => [
                    [
                        'label' => 'AI & machine learning',
                        'title' => 'Intelligence, engineered.',
                        'detail' => 'Learning systems. Real possibilities.',
                        'object' => 'processor',
                    ],
                    [
                        'label' => 'Mobile apps',
                        'title' => 'Ideas in your hands.',
                        'detail' => 'Small screens. Thoughtful experiences.',
                        'object' => 'mobile',
                    ],
                    [
                        'label' => 'Web development',
                        'title' => 'Connected by design.',
                        'detail' => 'Interfaces, systems, and everything between.',
                        'object' => 'web',
                    ],
                    [
                        'label' => 'Game development',
                        'title' => 'Built for the next move.',
                        'detail' => 'A little curiosity. A lot of play.',
                        'object' => 'controller',
                    ],
                ],
                'max' => 4,
                'fields' => [
                    'label' => [
                        'label' => 'Label',
                        'type' => 'text',
                        'default' => '',
                    ],
                    'title' => [
                        'label' => 'Caption title',
                        'type' => 'text',
                        'default' => '',
                    ],
                    'detail' => [
                        'label' => 'Caption description',
                        'type' => 'text',
                        'default' => '',
                    ],
                    'object' => [
                        'label' => '3D object',
                        'type' => 'select',
                        'default' => 'processor',
                        'options' => [
                            'processor',
                            'mobile',
                            'web',
                            'controller',
                        ],
                    ],
                ],
            ],
            'statement' => [
                'label' => 'Helix section heading',
                'type' => 'textarea',
                'default' => 'A curious mind.

A builder\'s instinct.',
            ],
            'statement_body' => [
                'label' => 'Helix section description',
                'type' => 'textarea',
                'default' => 'Full stack developer. AI & machine learning student. Always learning. Always building.',
            ],
            'caption' => [
                'label' => 'Helix caption',
                'type' => 'text',
                'default' => 'Human curiosity. Digital possibilities.',
            ],
            'approach' => [
                'label' => 'Approach heading',
                'type' => 'textarea',
                'default' => 'Good software starts with

better questions.',
            ],
            'approach_body' => [
                'label' => 'Approach introduction',
                'type' => 'textarea',
                'default' => 'The most interesting part of a problem is often the assumption hiding underneath it.',
            ],
            'quote' => [
                'label' => 'Quote',
                'type' => 'textarea',
                'default' => '“The greatest obstacle to discovery is not ignorance — it is the illusion of knowledge.”',
            ],
            'quote_author' => [
                'label' => 'Quote attribution',
                'type' => 'text',
                'default' => '— Daniel J. Boorstin',
            ],
            'services' => [
                'label' => 'Services',
                'type' => 'repeater',
                'default' => [
                    [
                        'title' => 'Web development',
                        'text' => 'Responsive, intuitive applications. Thoughtful interfaces, reliable backends, and the detail that connects them.',
                        'tools' => 'Frontend · Backend · APIs',
                    ],
                    [
                        'title' => 'AI & machine learning',
                        'text' => 'Exploring how systems learn and adapt through deep learning, data science, and intelligent automation.',
                        'tools' => 'Deep learning · Data science',
                    ],
                    [
                        'title' => 'Full stack solutions',
                        'text' => 'Connecting all the pieces, from a first prototype to a complete application built with room to grow.',
                        'tools' => 'Architecture · Databases · Deployment',
                    ],
                ],
                'max' => 12,
                'fields' => [
                    'title' => [
                        'label' => 'Title',
                        'type' => 'text',
                        'default' => '',
                    ],
                    'text' => [
                        'label' => 'Description',
                        'type' => 'textarea',
                        'default' => '',
                    ],
                    'tools' => [
                        'label' => 'Tools',
                        'type' => 'text',
                        'default' => '',
                    ],
                ],
            ],
        ],
    ],
    'about' => [
        'label' => 'About & skills',
        'path' => '/about',
        'fields' => [
            'hero' => [
                'label' => 'Page heading',
                'type' => 'textarea',
                'default' => 'Curiosity is

the constant.',
            ],
            'title' => [
                'label' => 'Biography heading',
                'type' => 'textarea',
                'default' => 'Engineering meets

a sense of possibility.',
            ],
            'biography' => [
                'label' => 'Biography (blank line between paragraphs)',
                'type' => 'textarea',
                'default' => 'I\'m Nakhle Rizk, born on November 20, 2002. I\'m a full stack developer and AI & machine learning student with a passion for building intelligent, user-focused applications. My journey began with web development, mastering various frontend and backend technologies.



My curiosity for how systems learn and adapt led me to artificial intelligence and machine learning, where I\'m exploring areas like deep learning, data science, and intelligent automation. I enjoy bridging the gap between robust software engineering and cutting-edge AI research.



I approach every project with attention to detail and a focus on user experience, whether I\'m building a responsive web application or training a machine learning model. I\'m constantly learning and expanding my skills to stay current with the latest technologies and best practices.',
                'max' => 15000,
            ],
            'portrait_caption' => [
                'label' => 'Portrait caption',
                'type' => 'text',
                'default' => 'Developer & lifelong learner',
            ],
            'journey_title' => [
                'label' => 'Timeline heading',
                'type' => 'text',
                'default' => 'Learning by doing.',
            ],
            'skills_title' => [
                'label' => 'Skills heading',
                'type' => 'textarea',
                'default' => 'A growing

toolbox.',
            ],
            'skills' => [
                'label' => 'Skill groups',
                'type' => 'repeater',
                'default' => [
                    [
                        'name' => 'Web Development',
                        'items' => [
                            [
                                'name' => 'React.js',
                                'imagePath' => '/react.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'JavaScript',
                                'imagePath' => '/js.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'TypeScript',
                                'imagePath' => '/ts.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Three.js',
                                'imagePath' => '/threejs.png',
                                'darkModeInvert' => true,
                            ],
                            [
                                'name' => 'PHP',
                                'imagePath' => '/php.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Laravel',
                                'imagePath' => '/laravel.png',
                                'darkModeInvert' => false,
                            ],
                        ],
                    ],
                    [
                        'name' => 'App Development',
                        'items' => [
                            [
                                'name' => 'Flutter',
                                'imagePath' => '/flutter.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Dart',
                                'imagePath' => '/dart.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Bloc',
                                'imagePath' => '/bloc.webp',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Riverpod',
                                'imagePath' => '/riverpod.png',
                                'darkModeInvert' => false,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Game Development',
                        'items' => [
                            [
                                'name' => 'Unreal Engine',
                                'imagePath' => '/unreal.png',
                                'darkModeInvert' => true,
                            ],
                            [
                                'name' => 'C++',
                                'imagePath' => '/cpp.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'C',
                                'imagePath' => '/c.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Blender',
                                'imagePath' => '/blender.png',
                                'darkModeInvert' => false,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Programming Languages',
                        'items' => [
                            [
                                'name' => 'JavaScript',
                                'imagePath' => '/js.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'TypeScript',
                                'imagePath' => '/ts.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'C',
                                'imagePath' => '/c.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'C++',
                                'imagePath' => '/cpp.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'OCaml',
                                'imagePath' => '/ocaml.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'PHP',
                                'imagePath' => '/php.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Java',
                                'imagePath' => '/java.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Python',
                                'imagePath' => '/python-logo-only.svg',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'Dart',
                                'imagePath' => '/dart.png',
                                'darkModeInvert' => false,
                            ],
                        ],
                    ],
                    [
                        'name' => 'Databases',
                        'items' => [
                            [
                                'name' => 'SQL',
                                'imagePath' => '/mysql.png',
                                'darkModeInvert' => false,
                            ],
                            [
                                'name' => 'MongoDB',
                                'imagePath' => '/mongodb.png',
                                'darkModeInvert' => false,
                            ],
                        ],
                    ],
                ],
                'max' => 15,
                'fields' => [
                    'name' => [
                        'label' => 'Group name',
                        'type' => 'text',
                        'default' => '',
                    ],
                    'items' => [
                        'label' => 'Skills',
                        'type' => 'repeater',
                        'default' => [],
                        'max' => 50,
                        'fields' => [
                            'name' => [
                                'label' => 'Skill name',
                                'type' => 'text',
                                'default' => '',
                            ],
                            'imagePath' => [
                                'label' => 'Local icon path',
                                'type' => 'asset',
                                'default' => '/laravel.png',
                            ],
                            'darkModeInvert' => [
                                'label' => 'Invert icon in dark mode',
                                'type' => 'checkbox',
                                'default' => false,
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
    'work' => [
        'label' => 'Work archive',
        'path' => '/work',
        'fields' => [
            'hero' => [
                'label' => 'Page heading',
                'type' => 'textarea',
                'default' => 'Work in

many forms.',
            ],
            'intro' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'A collection of things I\'ve built, problems I\'ve worked through, and ideas I\'ve followed. From web applications to games and beyond.',
            ],
        ],
    ],
    'contact' => [
        'label' => 'Contact page',
        'path' => '/contact',
        'fields' => [
            'hero' => [
                'label' => 'Page heading',
                'type' => 'textarea',
                'default' => 'Good things

start here.',
            ],
            'intro' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'A new project, an opportunity, or an interesting problem. I\'d love to hear about it.',
            ],
            'form_title' => [
                'label' => 'Form heading',
                'type' => 'text',
                'default' => 'Let\'s start a conversation.',
            ],
            'details_title' => [
                'label' => 'Details heading',
                'type' => 'text',
                'default' => 'Find me here.',
            ],
        ],
    ],
    'seo' => [
        'label' => 'Search & social',
        'path' => '/',
        'fields' => [
            'home_title' => [
                'label' => 'Home page title',
                'type' => 'text',
                'default' => 'Nakhle Rizk — Full Stack Developer in Rouen, France',
                'max' => 160,
            ],
            'home_description' => [
                'label' => 'Home description',
                'type' => 'textarea',
                'default' => 'Full stack developer in Rouen, France. Explore my web, mobile and AI projects. Open to roles and collaborations across France and Europe.',
                'max' => 500,
            ],
            'about_title' => [
                'label' => 'About page title',
                'type' => 'text',
                'default' => 'About Nakhle Rizk — Developer & AI Student',
                'max' => 160,
            ],
            'about_description' => [
                'label' => 'About description',
                'type' => 'textarea',
                'default' => 'Meet Nakhle Rizk, a full stack developer and AI and machine learning student. Explore his skills, experience, and approach to building software.',
                'max' => 500,
            ],
            'work_title' => [
                'label' => 'Work page title',
                'type' => 'text',
                'default' => 'Software, Web & AI Projects — Nakhle Rizk',
                'max' => 160,
            ],
            'work_description' => [
                'label' => 'Work description',
                'type' => 'textarea',
                'default' => 'Explore Nakhle Rizk’s web development, mobile, game, and AI projects, with case studies, technology stacks, screenshots, and source code links.',
                'max' => 500,
            ],
            'contact_title' => [
                'label' => 'Contact page title',
                'type' => 'text',
                'default' => 'Contact Nakhle Rizk — Projects & Opportunities',
                'max' => 160,
            ],
            'contact_description' => [
                'label' => 'Contact description',
                'type' => 'textarea',
                'default' => 'Contact Nakhle Rizk about a software project, a development role, or a collaboration. Get in touch to discuss your idea or opportunity.',
                'max' => 500,
            ],
        ],
    ],
    'legal' => [
        'label' => 'Publisher & hosting',
        'path' => '/legal',
        'fields' => [
            'owner' => [
                'label' => 'Publisher name',
                'type' => 'text',
                'default' => 'Nakhle Rizk',
                'optional' => false,
            ],
            'email' => [
                'label' => 'Privacy contact email',
                'type' => 'email',
                'default' => 'nakhler2k2@gmail.com',
                'optional' => false,
            ],
            'business' => [
                'label' => 'Business details',
                'type' => 'textarea',
                'default' => '',
                'optional' => true,
            ],
            'address' => [
                'label' => 'Public legal address',
                'type' => 'textarea',
                'default' => '',
                'optional' => true,
            ],
            'host_name' => [
                'label' => 'Hosting company',
                'type' => 'text',
                'default' => '',
                'optional' => true,
            ],
            'host_address' => [
                'label' => 'Hosting address',
                'type' => 'textarea',
                'default' => '',
                'optional' => true,
            ],
            'host_phone' => [
                'label' => 'Hosting telephone',
                'type' => 'text',
                'default' => '',
                'optional' => true,
            ],
        ],
    ],
    'privacy' => [
        'label' => 'Privacy policy',
        'path' => '/privacy',
        'fields' => [
            'title' => [
                'label' => 'Page title',
                'type' => 'text',
                'default' => 'Privacy policy',
            ],
            'introduction' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'A clear account of what this portfolio collects, why it collects it, and the choices you have.',
            ],
            'sections' => [
                'label' => 'Policy sections',
                'type' => 'repeater',
                'default' => [
                    [
                        'heading' => 'Who is responsible',
                        'body' => '{{publisher}} is responsible for personal information processed through this portfolio. For privacy requests, contact {{email}}.',
                    ],
                    [
                        'heading' => 'Contact enquiries',
                        'body' => 'The contact form stores the name, email address, and message you choose to send. This information is used to reply to your enquiry and discuss potential work. Please do not include sensitive personal information.



Handling an enquiry relies on taking steps at your request before a possible contract, or on the legitimate interest of answering correspondence. Messages should be reviewed when an enquiry is resolved and deleted when no longer needed; relevant correspondence may be retained for ongoing work, legal obligations, or disputes. You can ask about retention or request deletion using the contact address above.',
                    ],
                    [
                        'heading' => 'Optional audience analytics',
                        'body' => 'Only after you accept analytics, this site records page paths, visits, coarse device categories, clicks on interface controls and page surfaces, approximate click positions, scroll milestones, and estimated active reading time by section. A random consent reference and a random browser-session reference associate these events. They are pseudonymous identifiers, not a verified identity.



Analytics do not capture form inputs, message contents, keystroke contents, screenshots, screen recordings, URL query strings, full referrer addresses, advertising profiles, or device fingerprints. IP addresses and user-agent strings are not stored in the analytics tables. The web server still processes network information needed to deliver and secure the site.



Consent is the basis for this optional processing. Rejecting analytics does not limit access to the portfolio. Reading time is an estimate of active, visible content, not eye tracking or proof that a person read a particular sentence. The reports cover consenting traffic only.',
                    ],
                    [
                        'heading' => 'Retention and your choices',
                        'body' => 'Analytics events are retained for up to 90 days, with expired records removed by a daily maintenance task. Your choice and its policy version are remembered for 180 days. The optional session reference is kept in session storage and renewed after 30 minutes without activity. Browser storage restrictions can affect these durations.



Use Cookie preferences in the footer to change your choice. Withdrawing consent stops future analytics collection; it does not make earlier processing unlawful. You can also delete analytics linked to this browser’s consent reference and turn tracking off. Clearing cookies or using another browser may remove the reference needed to find those records.',
                    ],
                    [
                        'heading' => 'Recipients and external services',
                        'body' => 'Analytics and contact messages are stored in the database on Nakhle Rizk’s own server and are accessible to him to operate this personal portfolio and respond to enquiries. Analytics are not sent to an advertising network or external analytics provider, and personal information is not sold.


The interactive map loads automatically on the contact page and connects to OpenStreetMap. That provider then receives connection information such as your IP address. External project, GitHub, LinkedIn, and other links take you to services governed by their own privacy notices. The site is self-hosted using Microsoft IIS; publisher and hosting contact details are listed in the Legal notice.',
                    ],
                    [
                        'heading' => 'Your rights',
                        'body' => 'Where applicable, you may request access, correction, deletion, restriction, portability, or object to processing based on legitimate interests. You may withdraw analytics consent at any time. Contact the address above; only information reasonably necessary to verify and handle a request should be requested.



You may also raise a concern with your local data-protection authority. In France this is the CNIL (cnil.fr). Applicable statutory rights are not limited by this policy.',
                    ],
                ],
                'max' => 30,
                'fields' => [
                    'heading' => [
                        'label' => 'Heading',
                        'type' => 'text',
                        'default' => '',
                    ],
                    'body' => [
                        'label' => 'Text (blank line between paragraphs)',
                        'type' => 'textarea',
                        'default' => '',
                        'max' => 30000,
                    ],
                ],
            ],
        ],
    ],
    'cookies' => [
        'label' => 'Cookie policy',
        'path' => '/cookies',
        'fields' => [
            'title' => [
                'label' => 'Page title',
                'type' => 'text',
                'default' => 'Cookie policy',
            ],
            'introduction' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'The portfolio works without optional analytics. Accepting them is your choice.',
            ],
            'sections' => [
                'label' => 'Policy sections',
                'type' => 'repeater',
                'default' => [
                    [
                        'heading' => 'Essential cookies and storage',
                        'body' => 'The Laravel session cookie and XSRF-TOKEN support sessions, form security, and authentication. Their lifetime follows the server’s session configuration. Administrators may also use an authentication remembrance cookie when that feature is selected.



The portfolio_consent cookie remembers an explicit analytics choice and its version for 180 days. It is encrypted, HttpOnly, and uses SameSite=Lax; Secure is used on HTTPS requests. The server stores the matching choice and expiry so it can enforce consent.



portfolio-theme in local storage remembers a theme you choose until you remove it. portfolio-entry-seen in session storage prevents the entry animation from repeating in the same tab session. These settings support the requested interface rather than audience tracking.',
                    ],
                    [
                        'heading' => 'Optional analytics storage',
                        'body' => 'portfolio-analytics-session is created in session storage only when analytics are allowed. It contains a random session reference and activity time. A new reference is generated after 30 minutes without recorded activity. Session storage normally ends when its tab session ends.



Analytics requests stay on this site. Consent is checked on the server for every event batch. Global Privacy Control and Do Not Track signals keep analytics off. No optional advertising or session-replay cookies are used.',
                    ],
                    [
                        'heading' => 'Choose, change, or delete',
                        'body' => 'Accept and Reject are both available in the cookie banner. Manage preferences lets you review the purpose before choosing. No analytics option is preselected for a new visitor.



Cookie preferences remains available in the footer. Turning analytics off drops unsent events and removes the optional session reference from this tab. Deleting this browser’s analytics also removes the linked stored events. You can additionally clear site cookies and storage in your browser, which may reset your preferences.',
                    ],
                    [
                        'heading' => 'Third-party content',
                        'body' => 'The map loads automatically on the contact page and connects to OpenStreetMap, which receives connection information such as your IP address. Visiting an external link is a separate interaction with that provider. Those services can have their own storage and privacy practices.',
                    ],
                ],
                'max' => 30,
                'fields' => [
                    'heading' => [
                        'label' => 'Heading',
                        'type' => 'text',
                        'default' => '',
                    ],
                    'body' => [
                        'label' => 'Text (blank line between paragraphs)',
                        'type' => 'textarea',
                        'default' => '',
                        'max' => 30000,
                    ],
                ],
            ],
        ],
    ],
    'terms' => [
        'label' => 'Terms of use',
        'path' => '/terms',
        'fields' => [
            'title' => [
                'label' => 'Page title',
                'type' => 'text',
                'default' => 'Terms of use',
            ],
            'introduction' => [
                'label' => 'Introduction',
                'type' => 'textarea',
                'default' => 'These terms explain the permitted use of this portfolio. They are not a contract for paid development services.',
            ],
            'sections' => [
                'label' => 'Policy sections',
                'type' => 'repeater',
                'default' => [
                    [
                        'heading' => 'Purpose of this website',
                        'body' => 'This site presents work, experience, experiments, and ways to contact the publisher. Project descriptions and demonstrations illustrate work at a point in time and may change. Browsing the site or sending a message does not create an employment relationship, partnership, or services agreement. Any paid work requires separate agreed terms.',
                    ],
                    [
                        'heading' => 'Permitted use',
                        'body' => 'You may browse, share links, and download the provided CV for evaluating professional opportunities. Do not attempt unauthorized access, interfere with the site, bypass security controls, send unlawful or abusive material, or use the contact form for spam. Automated access must respect applicable law and must not disrupt the service.',
                    ],
                    [
                        'heading' => 'Content and intellectual property',
                        'body' => 'Original text, design, custom visual work, and original code are protected to the extent applicable law provides. Rights remain with their respective owners. Project screenshots, software names, trademarks, client materials, libraries, fonts, and third-party models may have separate owners and licences.



Public source repositories are governed by the licence supplied with each repository; displaying a project here does not grant additional rights. Statutory exceptions, quotation rights, and rights granted by applicable open-source licences remain unaffected. Ask the publisher before reusing original portfolio material beyond those rights.',
                    ],
                    [
                        'heading' => 'External links and availability',
                        'body' => 'Links and demonstrations may rely on third-party services. Their availability, content, and terms can change independently. Reasonable care is taken with the portfolio, but uninterrupted access or error-free information cannot be promised. Do not rely on a demonstration as a production service unless separately agreed.',
                    ],
                    [
                        'heading' => 'Responsibility and disputes',
                        'body' => 'Each party remains responsible as required by applicable law. These terms do not exclude liability that cannot lawfully be excluded, or restrict mandatory consumer, privacy, or other statutory protections.



Please contact {{email}} first about a concern so it can be investigated. Applicable law and jurisdiction follow the rules that legally apply to the situation; no exclusive foreign forum is imposed here.',
                    ],
                    [
                        'heading' => 'Updates',
                        'body' => 'These terms may be updated as the site changes. The date shown on this page identifies the current text. Changes to analytics purposes require a renewed consent choice where required.',
                    ],
                ],
                'max' => 30,
                'fields' => [
                    'heading' => [
                        'label' => 'Heading',
                        'type' => 'text',
                        'default' => '',
                    ],
                    'body' => [
                        'label' => 'Text (blank line between paragraphs)',
                        'type' => 'textarea',
                        'default' => '',
                        'max' => 30000,
                    ],
                ],
            ],
        ],
    ],
];

foreach (require __DIR__.'/french.php' as $section => $values) {
    $definition = $sections[$section];
    $definition['label'] = 'Français · '.$definition['label'];
    $definition['path'] = '/fr'.rtrim($definition['path'], '/');
    if ($section === 'site') {
        $definition['fields'] = array_intersect_key($definition['fields'], $values);
    }
    foreach ($values as $key => $value) {
        $definition['fields'][$key]['default'] = $value;
    }
    $sections['fr_'.$section] = $definition;
}
$projects = [];
foreach (require __DIR__.'/french_projects.php' as $id => $project) {
    $projects[] = ['id' => $id, ...$project];
}
$sections['fr_projects'] = [
    'label' => 'Français · Project translations', 'path' => '/fr/work',
    'fields' => ['projects' => [
        'label' => 'French projects (use the project ID from its public URL)', 'type' => 'repeater', 'max' => 200,
        'default' => $projects,
        'fields' => [
            'id' => ['label' => 'Project ID', 'type' => 'text', 'default' => ''],
            'title' => ['label' => 'French title', 'type' => 'text', 'default' => ''],
            'description' => ['label' => 'French summary', 'type' => 'textarea', 'default' => ''],
            'longDescription' => ['label' => 'French case study', 'type' => 'textarea', 'default' => '', 'max' => 30000],
        ],
    ]],
];

return $sections;
