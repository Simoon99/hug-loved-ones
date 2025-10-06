# AI Hug Generator 🤗

Create beautiful AI-generated hug images and share them with loved ones!

## 🎨 Features

- **AI-Powered Image Generation** - Uses Google's Gemini Nano Banana (gemini-2.5-flash-image)
- **Multi-Photo Support** - Upload up to 3 photos as input
- **Social Sharing** - Share directly to Instagram, Facebook, Twitter/X, and WhatsApp
- **Pricing Tiers** - Flexible pricing options ($2.99, $3.99, $4.99)
- **Secure Storage** - Private Supabase storage with signed URLs
- **Mobile-First Design** - Optimized for mobile devices with smooth animations
- **Image Gallery** - Browse all your generated hug images
- **Shareable Links** - Beautiful share pages with Open Graph meta tags

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Storage**: Supabase Storage
- **AI**: Google Gemini 2.5 Flash Image (Nano Banana)
- **Deployment**: Vercel

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Simoon99/hug-loved-ones.git
cd hug-loved-ones
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Set up Supabase:
   - Create the `images` table (see `database-separation.sql`)
   - Create the `hug-images` storage bucket (private)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

1. Upload 1-3 photos of people
2. Enter a custom prompt (or use AI-generated)
3. Click "Generate Hug Image"
4. Select a pricing tier
5. Click "Pay & Generate"
6. AI creates a beautiful hug scene
7. Download or share to social media!

## 🔒 Security Features

- **Private Storage**: Images stored in private Supabase bucket
- **Signed URLs**: Temporary access (7 days expiry)
- **Service Role Authentication**: Secure image downloads
- **No Public URLs**: Images not directly accessible

## 📱 Mobile Optimization

- Touch-optimized buttons (48x48px minimum)
- Momentum scrolling on iOS
- No tap highlight flash
- Instant touch response
- Responsive pricing modal
- Sticky pay button

## 🎨 UI Features

- Beautiful gradient backgrounds
- Smooth animations throughout
- Loading states with progress updates
- Success animations
- Error handling
- Mobile-first responsive design

## 🚧 Payment Integration (Coming Soon)

The app is ready for payment integration with:
- Stripe
- PayPal
- Paddle

Payment logic is stubbed in `handlePayment()` function.

## 📄 License

MIT License - feel free to use this project!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

**Simoon99**
- GitHub: [@Simoon99](https://github.com/Simoon99)

## ⭐ Show your support

Give a ⭐️ if you like this project!
