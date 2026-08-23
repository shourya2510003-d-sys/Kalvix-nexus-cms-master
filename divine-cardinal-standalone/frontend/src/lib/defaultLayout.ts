export const DEFAULT_HOMEPAGE_LAYOUT = [
  {
    id: "hero_banner",
    order: 0,
    visible: true,
    styles: {
      backgroundColor: "#FAF9F6",
      textColor: "#1A1A1A",
      fontFamily: "font-serif",
      textAlignment: "left"
    },
    data: {
      sliderInterval: 5,
      slides: [
        {
          id: "slide-1",
          mediaType: "image",
          mediaUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200",
          subtitle: "Time Tested Recipe",
          title: "BHRINGRAJ HAIR RITUAL",
          description: "Distilled with ancient Deg-Bhapka recipes. Deeply nourishes the scalp, reduces hair fall, and restores natural thickness.",
          buttonText: "Shop Now",
          buttonLink: "/shop"
        }
      ]
    }
  },
  {
    id: "slow_beauty",
    order: 1,
    visible: true,
    data: {
      title: "RITUALS ARE NEVER RUSHED",
      description: "A reminder to savour the stillness between moments, pause long enough to feel, ease into your own rhythm, release the urgency and take your time as life gently unfolds.",
      buttonText: "Explore Now",
      buttonLink: "/pages/about",
      mediaType: "video",
      videoImage: "https://kalvix-nexus-production.up.railway.app/uploads/1783752704651-371936797.mp4",
      videoSubtitle: "A cultural invitation",
      videoTitleLine1: "to experience",
      videoTitleLine2: "slow beauty"
    }
  },
  {
    id: "seasonal_indulgences",
    order: 2,
    visible: true,
    data: {
      title: "SEASONAL INDULGENCES",
      buttonText: "View All >",
      buttonLink: "/shop"
    }
  },
  {
    id: "shop_by_concern",
    order: 3,
    visible: true,
    data: {
      title: "Shop By Concern",
      items: [
        { name: 'Clear Skin', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300' },
        { name: 'Youthful Glow', img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=300' },
        { name: 'Gentle Baby Soothing', img: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=300' },
        { name: 'Muscle Relaxation', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300' },
        { name: 'Skin Glow', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300' }
      ]
    }
  },
  {
    id: "trusted_tales",
    order: 4,
    visible: true,
    data: {
      title: "Trusted Tales",
      subtitleHtml: "Experience Ayurveda, share your story. Be part of the #DivineTribe—tag <span className='font-semibold text-luxury-gold'>@divinecardinal</span> to get featured.",
      items: [
        {
          title: "Body Mist Oudh & Green Tea",
          desc: "A fresh flower infused body mist with aromatic Oudh & Green Tea to soften...",
          price: "₹1,350",
          img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400",
          likes: 120
        },
        {
          title: "Facial Tonic Mist Pure Rosewater",
          desc: "The skin requires a gentle boost after cleansing to rehydrate, tone and...",
          price: "₹1,350",
          img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400",
          likes: 340
        },
        {
          title: "Sheer Sun Fluid With SPF 50",
          desc: "Made with tender Coconut Water, fresh Basil leaves and cooling Aloe...",
          price: "₹1,575",
          img: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=400",
          likes: 89
        },
        {
          title: "Light Hydrating Facial Serum",
          desc: "This Light Hydrating Facial Serum Panchpushp is infused with the pure...",
          price: "₹1,875",
          img: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400",
          likes: 212
        },
        {
          title: "Transformative Soundarya Night Serum",
          desc: "This revolutionary Night Serum is a breakthrough blend immersed in an...",
          price: "₹3,375",
          img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
          likes: 512
        }
      ]
    }
  },
  {
    id: "quiz_banner",
    order: 5,
    visible: true,
    data: {
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=1200",
      subtitle: "Tailored",
      title: "Beauty Routine",
      description: "Answer a few simple questions to discover your personalized Ayurvedic ritual tailored specifically to your dosha, skin type and lifestyle needs.",
      buttonText: "Take the Quiz",
      questions: [
        {
          key: 'skinType',
          question: 'What is your skin type?',
          options: ['Oily Skin', 'Dry Skin', 'Normal Skin', 'Sensitive Skin']
        },
        {
          key: 'concern',
          question: 'What is your primary wellness concern?',
          options: ['Clear Skin & Even Tone', 'Muscle/Joint Pain', 'Youthful Glow', 'Baby Care']
        },
        {
          key: 'texture',
          question: 'Which product texture do you prefer?',
          options: ['Light Hydrating Serum', 'Nourishing Massage Oil', 'Concentrated Face Serum', 'Pure Flower Mist']
        }
      ],
      recommendations: [
        {
          conditionKey: 'concern',
          conditionValue: 'Muscle/Joint Pain',
          productSku: 'DCIWN09' // Lavender Body Pain Relief Oil
        },
        {
          conditionKey: 'concern',
          conditionValue: 'Clear Skin & Even Tone',
          productSku: 'DCIW01' // Example SKU for Anti-Stress Lemon Roll-On or similar
        },
        {
          conditionKey: 'texture',
          conditionValue: 'Pure Flower Mist',
          productSku: 'DCIWN30' // Headache Relieving Peppermint Oil (example)
        },
        {
          // Default fallback if no match
          conditionKey: 'default',
          conditionValue: 'default',
          productSku: 'DCIW02'
        }
      ]
    }
  },
  {
    id: "best_sellers",
    order: 6,
    visible: true,
    data: {
      title: "BEST SELLERS",
      subtitle: "Most Loved",
      description: "Explore our highly rated, time-tested health & body care remedies.",
      productIds: []
    }
  },
  {
    id: "latest_reads",
    order: 7,
    visible: true,
    data: {
      title: "Latest Reads",
      buttonText: "Read Blog >",
      buttonLink: "/blogs/journal",
      items: [
        {
          title: 'NOTHING MEANT TO BE WASTED',
          category: 'Sustainability',
          image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600',
          date: 'July 8, 2026',
          content: 'At Divine Cardinal, we believe that true luxury is sustainable. Every single component of our raw material procurement, extraction, and packaging process is aligned with ecological conservation. Our glass jars are completely recyclable, and our organic residue from cold-pressing oils is safely composted and returned to the farmers to enrich the soil for subsequent crops. Guided by the principles of zero-waste Ayurveda, we celebrate the absolute cycle of nature.'
        },
        {
          title: 'EVERY DROP, THOUGHTFULLY RETURNED',
          category: 'Sustainability',
          image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600',
          date: 'June 28, 2026',
          content: 'Water conservation lies at the core of our manufacturing processes. In our steam-distillation rituals, every single drop of condensation is collected, cooled, and processed through state-of-the-art filtration. We use closed-loop water systems that reuse cooling water, preventing millions of liters of water wastage each year. Our commitment is simple: what we take from the earth, we return with absolute purity.'
        },
        {
          title: 'POWERED BY THE SUN, GUIDED BY INTENTION',
          category: 'Brand Story',
          image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&q=80&w=600',
          date: 'May 14, 2026',
          content: 'Our extraction units and offices run entirely on solar energy grids. Nestled in the sunlit foot-hills of the Himalayas, our solar arrays harvest clean, renewable energy to power the cold-pressing expellers and distillation boilers. We choose to minimize our carbon footprint, ensuring that every time you nourish your skin with Divine Cardinal, you are participating in a clean, solar-driven future for India and the world.'
        }
      ]
    }
  },
  {
    id: "our_story",
    order: 8,
    visible: true,
    data: {
      image: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&q=80&w=1200",
      title: "Our Story",
      description: "Welcome to Divine Cardinal, where we embrace the 5,000-year-old tradition of Ayurveda to offer you holistic health and wellness solutions. Based in India, our brand is dedicated to bringing you the finest aromatherapy-based products, meticulously crafted from the purest natural ingredients.",
      signatureText: "Gaurav Agarwal"
    }
  },
  {
    id: "testimonials_slider",
    order: 9,
    visible: true,
    data: {
      buttonText: "Leave a Review",
      items: [
        {
          name: "Tripti Sahu",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop",
          text: "The Chamomile Teething Roll-On is a lifesaver for my baby's discomfort—soothing, gentle, and easy to apply. Delivery was fast and reliable, and the product arrived perfectly packaged...",
          rating: 5,
          timeAgo: "1 year ago"
        },
        {
          name: "Sandhya Agarwal",
          image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop",
          text: "I absolutely love Divine Cardinal's range of natural serums and oils. The Anti-Stretch Marks Oil kept my skin supple and radiant throughout my pregnancy.",
          rating: 5,
          timeAgo: "1 year ago"
        },
        {
          name: "Ayush Gupta",
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
          text: "The artisanal quality of each product is evident—everything is handcrafted with love and free from harsh chemicals.",
          rating: 5,
          timeAgo: "1 year ago"
        }
      ]
    }
  },
  {
    id: "instagram_integration",
    order: 10,
    visible: true,
    data: {
      subtitle: "Follow Our Journey",
      title: "As Seen on Social",
      description: "Watch how Divine Cardinal is transforming skin & health care routines across India.",
      buttonText: "Follow on Instagram",
      items: [
        { type: 'video', src: 'https://images.unsplash.com/photo-1605368307297-c81121d5a3ec?q=80&w=400&auto=format&fit=crop' },
        { type: 'image', src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop' },
        { type: 'image', src: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?q=80&w=400&auto=format&fit=crop' },
        { type: 'image', src: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=400&auto=format&fit=crop' }
      ]
    }
  },
  {
    id: "instagram_reels",
    order: 10,
    visible: true,
    data: {
      title: "Instagram Reels",
      subtitle: "Instant Glow",
      reels: [
        "https://www.instagram.com/reel/C-U4yY4oGqL/",
        "https://www.instagram.com/reel/C-U4yY4oGqL/",
        "https://www.instagram.com/reel/C-U4yY4oGqL/"
      ]
    }
  },
  {
    id: "brand_usps",
    order: 11,
    visible: true,
    data: {
      title: "Our Features",
      items: [
        {
          title: "Ayurveda",
          desc: "Emphasize the 5,000-year-old tradition of Ayurveda and its holistic approach to health and wellness.",
          img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop"
        },
        {
          title: "Aromatherapy",
          desc: "Aromatherapy-Based Fragrances: The therapeutic use of essential oils from plants for the improvement of physical, emotional, and spiritual well-being.",
          img: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?q=80&w=600&auto=format&fit=crop"
        },
        {
          title: "Natural Ingredients",
          desc: "Use of only natural ingredients, free from harsh chemicals, artificial fragrances, and dyes.",
          img: "https://images.unsplash.com/photo-1611077543940-1ce463b72382?q=80&w=600&auto=format&fit=crop"
        },
        {
          title: "Handcrafted with Love",
          desc: "Handcrafting each product, ensuring a personal touch and high-quality finish.",
          img: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop"
        }
      ]
    }
  },
  {
    id: "marketplace_reviews",
    order: 12,
    visible: true,
    data: {
      title: "Loved Everywhere",
      items: [
        {
          title: "A miracle for hand cramps!",
          comment: "As a professional pianist, my fingers lock up frequently. Geranium Cramp Relief Oil has saved my practice sessions. Works within 10 minutes of rub. Worth every rupee.",
          reviewer: "Ritu Malhotra",
          product: "Geranium Writer's Cramp Relief Oil",
          rating: 5,
          platform: "Amazon",
          color: "#FF9900"
        },
        {
          title: "Teething relief was instant",
          comment: "We tried so many ointments for teething baby. Chamomile Roll-On was highly recommended by group of parents. Truly natural, pleasant sleep scent. Safe and effective.",
          reviewer: "Dr. Sneha Roy",
          product: "Chamomile Teething Roll-On",
          rating: 5,
          platform: "Myntra",
          color: "#FF3F6C"
        },
        {
          title: "Peppermint oil does absolute magic",
          comment: "Instant relief for forehead tension headache. Small compact tube is super travel friendly. Feels very cold and relaxing. 10/10 purchase from Divine Cardinal.",
          reviewer: "Vikram S.",
          product: "Headache Relieving Peppermint Oil",
          rating: 5,
          platform: "Amazon",
          color: "#FF9900"
        }
      ]
    }
  },
  {
    id: "customer_reviews",
    order: 13,
    visible: true,
    data: {
      title: "Customer Reviews",
      buttonText: "Write a Review",
      emptyStateText: "No reviews published yet. Be the first to share your experience with Divine Cardinal!"
    }
  },
  {
    id: "available_on_platforms",
    order: 14,
    visible: true,
    data: {
      title: "Also Available On",
      platforms: [
        { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", link: "https://amazon.in" },
        { name: "Myntra", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Myntra_logo.png", link: "https://myntra.com" },
        { name: "Firstcry", logo: "https://cdn.firstcry.com/education/2022/11/06094158/Logo_21-1.jpg", link: "https://firstcry.com" },
        { name: "JioMart", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/JioMart_logo.svg", link: "https://jiomart.com" }
      ]
    }
  },
  {
    id: "text_paragraph",
    order: 15,
    visible: true,
    data: {
      title: "Text Section Heading",
      blocks: [
        {
          heading: "Sub-heading 1",
          paragraph: "This is a paragraph of text. You can add more paragraphs and headings here to build up text heavy pages like terms of service or policy pages."
        }
      ]
    }
  }
];
