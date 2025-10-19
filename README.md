# FeedForward

Welcome to FeedForward, a full-stack web application designed to combat food waste and alleviate hunger by creating a direct link between food providers with surplus and recipients in need.

The platform serves as a community-driven marketplace where providers can easily list available food items, and recipients can find and reserve them. By leveraging modern web technologies and artificial intelligence, FeedForward aims to make food donation efficient, accessible, and impactful.

![FeedForward Logo](src/components/icons/logo.tsx)

## ✨ Features

- **Provider & Recipient Roles:** A two-sided platform serving both those who want to provide food and those who are looking for it.
- **Secure User Authentication:** A mock authentication system allows users to register, log in, and manage their profiles.
- **Dynamic Food Listings:** Providers can create, edit, and delete food listings, complete with images, quantity, weight/volume, and pickup address.
- **Geo-Location Search:** Recipients can search for available food listings based on their current location and a specified range (in miles or kilometers).
- **Interactive Map & Directions:** The platform uses the Google Maps API to show pickup locations and generate driving directions for recipients.
- **Reservation & Approval Flow:** Recipients can reserve a listing, which sends a real-time notification to the provider to approve or deny the request.
- **Secure Pickup System:**
  - **OTP Verification:** A one-time password is generated for secure, confirmed handoffs.
  - **Instruction-Based Pickup:** Providers can choose to leave the item in a safe location with specific instructions for the recipient.
- **Real-Time Notifications:** In-app dialogs notify providers instantly of new reservation requests.
- **AI-Powered Recipe Suggestions:** To help recipients make the most of their food, an AI assistant (powered by Google's Gemini model via Genkit) suggests simple recipes based on the donated food item. The suggestions are automatically proofread by another AI call to ensure quality.
- **Persistent State:** The application uses browser Local Storage to simulate a real-time database, persisting all user data, listings, and application state across sessions and browser tabs.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration:** [Genkit (Google)](https://firebase.google.com/docs/genkit) with the Gemini family of models.
- **Mapping:** [Google Maps Platform APIs](https://developers.google.com/maps) (Places, Geocoding, Directions)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks (`useState`, `useEffect`, `useContext`) with a custom `useSyncExternalStore`-based solution for cross-tab Local Storage synchronization.

## 🚀 Getting Started

Follow these instructions to get the project running locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add your Google Maps and Gemini API keys. You can get a Gemini key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```.env
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

    *Note: The Google Maps API key should have the **Maps JavaScript API**, **Places API**, **Geocoding API**, and **Directions API** enabled.*

### Running the Application

To run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## 📂 Project Structure

The project follows the standard Next.js App Router structure.

```
/
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   ├── components/         # Reusable UI components (ShadCN, layout, custom)
│   ├── hooks/              # Custom React hooks for state and logic (e.g., useAuth, useListings)
│   ├── lib/                # Utility functions and library initializations
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── flows/          # AI logic for features like recipe suggestions
│   │   └── genkit.ts       # Genkit initialization
├── public/                 # Static assets
└── ...                     # Configuration files (tailwind, next, etc.)
```
